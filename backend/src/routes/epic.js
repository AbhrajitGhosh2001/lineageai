const express = require('express');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const EPIC_CONFIG = {
  clientId: process.env.EPIC_CLIENT_ID,
  // Epic sandbox vs production
  authorizationUrl: process.env.EPIC_AUTH_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
  tokenUrl: process.env.EPIC_TOKEN_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
  fhirBaseUrl: process.env.EPIC_FHIR_BASE_URL || 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
  redirectUri: process.env.EPIC_REDIRECT_URI || 'https://lineageai-copy-production.up.railway.app/api/auth/epic/callback',
  scopes: 'launch patient/Patient.read patient/Observation.write patient/DiagnosticReport.write openid fhirUser',
};

// Store for PKCE and state (in production, use Redis)
const pendingAuths = new Map();

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier) {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

// ── SMART Launch endpoint (EHR calls this) ──────────────────────────────────
router.get('/launch', (req, res) => {
  if (!EPIC_CONFIG.clientId) {
    return res.status(503).json({ error: 'Epic FHIR integration not configured' });
  }

  const { launch, iss } = req.query;

  if (!launch || !iss) {
    return res.status(400).json({ error: 'Missing launch or iss parameter' });
  }

  // Generate PKCE values
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = crypto.randomBytes(16).toString('hex');

  // Store for callback
  pendingAuths.set(state, {
    codeVerifier,
    iss,
    launch,
    createdAt: Date.now(),
  });

  // Clean up old entries (older than 10 minutes)
  for (const [key, value] of pendingAuths.entries()) {
    if (Date.now() - value.createdAt > 600000) {
      pendingAuths.delete(key);
    }
  }

  const authUrl = new URL(EPIC_CONFIG.authorizationUrl);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', EPIC_CONFIG.clientId);
  authUrl.searchParams.set('redirect_uri', EPIC_CONFIG.redirectUri);
  authUrl.searchParams.set('scope', EPIC_CONFIG.scopes);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('aud', iss);
  authUrl.searchParams.set('launch', launch);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  res.redirect(authUrl.toString());
});

// ── OAuth Callback ──────────────────────────────────────────────────────────
router.get('/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('[Epic OAuth Error]', error, error_description);
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?epic_error=${encodeURIComponent(error_description || error)}`);
  }

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state' });
  }

  const pending = pendingAuths.get(state);
  if (!pending) {
    return res.status(400).json({ error: 'Invalid or expired state' });
  }

  pendingAuths.delete(state);

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(EPIC_CONFIG.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: EPIC_CONFIG.redirectUri,
        client_id: EPIC_CONFIG.clientId,
        code_verifier: pending.codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[Epic Token Error]', errorText);
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?epic_error=token_exchange_failed`);
    }

    const tokens = await tokenResponse.json();
    
    // tokens contains: access_token, token_type, expires_in, scope, patient (patient ID in context)
    // Store these securely - in production, encrypt and store in database
    
    const patientId = tokens.patient;
    const accessToken = tokens.access_token;

    // Redirect to frontend with success indicator
    // The frontend should then call our API to fetch/sync patient data
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?epic_connected=true&epic_patient=${patientId}`);

  } catch (err) {
    console.error('[Epic Callback Error]', err);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?epic_error=callback_failed`);
  }
});

// ── Standalone launch (for testing without EHR context) ─────────────────────
router.get('/standalone-launch', authenticate, (req, res) => {
  if (!EPIC_CONFIG.clientId) {
    return res.status(503).json({ error: 'Epic FHIR integration not configured' });
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = crypto.randomBytes(16).toString('hex');

  pendingAuths.set(state, {
    codeVerifier,
    iss: EPIC_CONFIG.fhirBaseUrl,
    userId: req.user.userId,
    createdAt: Date.now(),
  });

  const authUrl = new URL(EPIC_CONFIG.authorizationUrl);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', EPIC_CONFIG.clientId);
  authUrl.searchParams.set('redirect_uri', EPIC_CONFIG.redirectUri);
  authUrl.searchParams.set('scope', EPIC_CONFIG.scopes.replace('launch ', '')); // No launch scope for standalone
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('aud', EPIC_CONFIG.fhirBaseUrl);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  res.redirect(authUrl.toString());
});

// ── Write observation back to EHR ───────────────────────────────────────────
router.post('/write-observation', authenticate, async (req, res) => {
  const { accessToken, patientFhirId, observation } = req.body;

  if (!accessToken || !patientFhirId || !observation) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const fhirObservation = {
      resourceType: 'Observation',
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'laboratory',
          display: 'Laboratory',
        }],
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: observation.loincCode || '55233-1',
          display: observation.display || 'Genetic analysis master panel',
        }],
      },
      subject: {
        reference: `Patient/${patientFhirId}`,
      },
      effectiveDateTime: observation.effectiveDate || new Date().toISOString(),
      valueString: observation.result,
      interpretation: observation.interpretation ? [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
          code: observation.interpretation,
        }],
      }] : undefined,
    };

    const response = await fetch(`${EPIC_CONFIG.fhirBaseUrl}/Observation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/fhir+json',
      },
      body: JSON.stringify(fhirObservation),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Epic Write Error]', errorText);
      return res.status(response.status).json({ error: 'Failed to write to EHR', details: errorText });
    }

    const result = await response.json();
    res.json({ success: true, resourceId: result.id });

  } catch (err) {
    console.error('[Epic Write Error]', err);
    res.status(500).json({ error: 'Failed to write observation' });
  }
});

// ── Fetch patient from EHR ──────────────────────────────────────────────────
router.get('/patient/:fhirId', authenticate, async (req, res) => {
  const { fhirId } = req.params;
  const accessToken = req.headers['x-epic-token'];

  if (!accessToken) {
    return res.status(401).json({ error: 'Missing Epic access token' });
  }

  try {
    const response = await fetch(`${EPIC_CONFIG.fhirBaseUrl}/Patient/${fhirId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/fhir+json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch patient from EHR' });
    }

    const patient = await response.json();
    res.json(patient);

  } catch (err) {
    console.error('[Epic Fetch Error]', err);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// ── Configuration endpoint (for frontend to check if Epic is enabled) ───────
router.get('/config', (req, res) => {
  res.json({
    enabled: !!EPIC_CONFIG.clientId,
    launchUrl: EPIC_CONFIG.clientId 
      ? 'https://lineageai-copy-production.up.railway.app/api/auth/epic/launch'
      : null,
    redirectUri: EPIC_CONFIG.redirectUri,
  });
});

module.exports = router;
