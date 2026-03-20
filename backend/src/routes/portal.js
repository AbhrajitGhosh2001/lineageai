const express = require('express');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const { decryptPatient, decryptFamilyMember } = require('../lib/encryption');

const router = express.Router();

// ── Risk scoring algorithm ────────────────────────────────────────────────────
// Higher score = higher priority for outreach
const RELATIONSHIP_RISK = {
  parent: 50, sibling: 50, child: 50,
  aunt: 25, uncle: 25,
  cousin: 12, grandparent: 25,
  other: 10,
};

function computeRiskScore(member, condition) {
  let score = RELATIONSHIP_RISK[member.relationship] ?? 10;

  // Age factor — younger untested relatives are higher priority
  if (member.dateOfBirth) {
    const age = new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear();
    if (age >= 25 && age <= 50) score += 20;
    else if (age < 25) score += 10;
  }

  // High-penetrance conditions get a boost
  if (condition && (condition.includes('BRCA') || condition.includes('Lynch') || condition.includes('Li-Fraumeni'))) {
    score += 15;
  }

  // Never contacted = urgent
  if (member.testStatus === 'not-contacted') score += 20;
  else if (member.testStatus === 'contacted') score += 5;
  else if (member.testStatus === 'completed' || member.testStatus === 'declined') score = 0;

  return Math.min(score, 100);
}

// ── Generate family portal link ───────────────────────────────────────────────
router.post('/patients/:patientId/portal', authenticate, async (req, res) => {
  try {
    const patient = await prisma.patient.findFirst({
      where: { id: req.params.patientId, counselorId: req.user.userId },
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.familyPortalToken.create({
      data: { patientId: patient.id, token, expiresAt },
    });

    const portalUrl = `${process.env.FRONTEND_URL}/portal/${token}`;
    res.json({ token, portalUrl, expiresAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Get portal tokens for a patient ──────────────────────────────────────────
router.get('/patients/:patientId/portal', authenticate, async (req, res) => {
  try {
    const patient = await prisma.patient.findFirst({
      where: { id: req.params.patientId, counselorId: req.user.userId },
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const tokens = await prisma.familyPortalToken.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tokens);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Public portal view (no auth — token-gated) ───────────────────────────────
router.get('/portal/:token', async (req, res) => {
  try {
    const record = await prisma.familyPortalToken.findUnique({
      where: { token: req.params.token },
      include: {
        patient: {
          include: {
            familyMembers: {
              where: { optedOut: false },
              include: { outreaches: { orderBy: { createdAt: 'desc' }, take: 1 } },
            },
          },
        },
      },
    });

    if (!record) return res.status(404).json({ error: 'Portal link not found' });
    if (record.expiresAt < new Date()) return res.status(410).json({ error: 'This portal link has expired' });

    await prisma.familyPortalToken.update({
      where: { id: record.id },
      data: { viewCount: { increment: 1 } },
    });

    const patient = decryptPatient(record.patient);

    // Only expose safe fields — no PII beyond condition and test result
    res.json({
      condition: patient.condition,
      testResult: patient.testResult,
      testDate: patient.testDate,
      familyMemberCount: patient.familyMembers.length,
      testedCount: patient.familyMembers.filter(m => m.testStatus === 'completed').length,
      expiresAt: record.expiresAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Risk scoring for a patient's family ──────────────────────────────────────
router.get('/patients/:patientId/risk-scores', authenticate, async (req, res) => {
  try {
    const patient = await prisma.patient.findFirst({
      where: { id: req.params.patientId, counselorId: req.user.userId },
      include: { familyMembers: { include: { outreaches: true } } },
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const decrypted = decryptPatient(patient);
    const scored = decrypted.familyMembers
      .filter(m => !m.optedOut)
      .map(m => ({
        ...m,
        riskScore: computeRiskScore(m, patient.condition),
      }))
      .sort((a, b) => b.riskScore - a.riskScore);

    // Persist scores
    await Promise.all(scored.map(m =>
      prisma.familyMember.update({ where: { id: m.id }, data: { riskScore: m.riskScore } })
    ));

    res.json(scored);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Opt-out a family member ───────────────────────────────────────────────────
router.post('/family/:memberId/opt-out', async (req, res) => {
  try {
    const { reason } = req.body;
    const member = await prisma.familyMember.findUnique({ where: { id: req.params.memberId } });
    if (!member) return res.status(404).json({ error: 'Family member not found' });

    await prisma.familyMember.update({
      where: { id: req.params.memberId },
      data: { optedOut: true, testStatus: 'declined' },
    });

    await prisma.optOut.upsert({
      where: { familyMemberId: req.params.memberId },
      update: { reason },
      create: { familyMemberId: req.params.memberId, reason },
    });

    res.json({ success: true, message: 'You have been opted out. No further contact will be made.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Capacity manager stats ────────────────────────────────────────────────────
router.get('/clinic/capacity', authenticate, async (req, res) => {
  try {
    const counselorId = req.user.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    const allMembers = await prisma.familyMember.findMany({
      where: { patient: { counselorId }, optedOut: false },
      include: { outreaches: true },
    });

    const scheduledThisMonth = allMembers.filter(m =>
      m.testStatus === 'scheduled' &&
      m.updatedAt >= startOfMonth && m.updatedAt <= endOfMonth
    ).length;

    const pendingOutreach = allMembers.filter(m => m.testStatus === 'not-contacted').length;
    const inProgress = allMembers.filter(m => ['contacted', 'scheduled'].includes(m.testStatus)).length;
    const completedTotal = allMembers.filter(m => m.testStatus === 'completed').length;

    // Estimate slots needed: assume 30min per counseling session, 6hr/day capacity
    const avgSessionsPerDay = 12;
    const workingDaysLeft = Math.max(1, Math.round((endOfMonth - now) / (1000 * 60 * 60 * 24)));
    const remainingCapacity = avgSessionsPerDay * workingDaysLeft;
    const slotsNeeded = Math.max(0, inProgress - remainingCapacity);

    res.json({
      scheduledThisMonth,
      pendingOutreach,
      inProgress,
      completedTotal,
      remainingCapacity,
      slotsNeeded,
      workingDaysLeft,
      recommendation: slotsNeeded > 0
        ? `Open ${Math.ceil(slotsNeeded / avgSessionsPerDay)} more counseling days this month`
        : 'Current capacity is sufficient',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── AI chatbot (gene-specific responses) ─────────────────────────────────────
const GENE_KB = {
  brca: {
    keywords: ['brca', 'brca1', 'brca2', 'breast', 'ovarian'],
    responses: {
      risk: 'A BRCA1 or BRCA2 mutation increases lifetime breast cancer risk to 50–72% (vs 12% average) and ovarian cancer risk to 44% (vs 1.2% average).',
      testing: 'Genetic testing for BRCA1/2 is a simple saliva or blood test. Results take 2–4 weeks. Many insurers cover it at 100% when a family member tests positive.',
      children: 'Each child of a BRCA1/2 carrier has a 50% chance of inheriting the mutation. Testing is typically recommended starting at age 25.',
      prevention: 'Options include enhanced screening (MRI + mammogram annually), risk-reducing medications (tamoxifen), or preventive surgery. Your genetic counselor can explain each.',
    },
  },
  lynch: {
    keywords: ['lynch', 'colorectal', 'colon', 'msh', 'mlh', 'pms'],
    responses: {
      risk: 'Lynch syndrome raises lifetime colorectal cancer risk to 40–80% and endometrial cancer risk to 40–60%. Other cancers (ovarian, stomach, urinary) are also elevated.',
      testing: 'Testing involves a blood or saliva sample. If your relative tested positive, you have a 50% chance of carrying the same mutation.',
      children: 'Lynch syndrome follows an autosomal dominant pattern — each child has a 50% chance of inheriting it.',
      prevention: 'Colonoscopies every 1–2 years starting at 20–25 dramatically reduce risk. Aspirin therapy and other options are available.',
    },
  },
  default: {
    responses: {
      risk: 'Hereditary cancer syndromes can significantly increase cancer risk. Knowing your family history helps you and your doctor make informed decisions.',
      testing: 'Genetic testing is typically a simple saliva or blood test. Ask your genetic counselor about coverage and what to expect.',
      children: 'Many hereditary conditions follow a 50% inheritance pattern. A genetic counselor can explain the specific risks for your family.',
      prevention: 'Early detection and prevention options exist for most hereditary conditions. Your genetic counselor can create a personalized plan.',
    },
  },
};

function getGeneInfo(condition) {
  if (!condition) return GENE_KB.default;
  const lower = condition.toLowerCase();
  for (const [, info] of Object.entries(GENE_KB)) {
    if (info.keywords && info.keywords.some(k => lower.includes(k))) return info;
  }
  return GENE_KB.default;
}

function generateChatResponse(message, condition) {
  const lower = message.toLowerCase();
  const info = getGeneInfo(condition);

  if (lower.includes('risk') || lower.includes('chance') || lower.includes('likely') || lower.includes('probability')) {
    return info.responses.risk;
  }
  if (lower.includes('test') || lower.includes('how') || lower.includes('sample') || lower.includes('blood') || lower.includes('saliva')) {
    return info.responses.testing;
  }
  if (lower.includes('child') || lower.includes('son') || lower.includes('daughter') || lower.includes('kid') || lower.includes('inherit')) {
    return info.responses.children;
  }
  if (lower.includes('prevent') || lower.includes('screen') || lower.includes('protect') || lower.includes('surgery') || lower.includes('option')) {
    return info.responses.prevention;
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('help')) {
    return `Hello! I'm here to help you understand hereditary cancer risk${condition ? ` related to ${condition}` : ''}. You can ask me about: your risk level, how testing works, what this means for your children, or prevention options.`;
  }

  return `That's a great question. For specific guidance about ${condition || 'your family\'s hereditary condition'}, I recommend speaking with a genetic counselor. In general: ${info.responses.risk} Would you like to know more about testing, risk levels, or prevention options?`;
}

router.post('/chat', async (req, res) => {
  try {
    const { message, condition, portalToken } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    let resolvedCondition = condition;

    // If coming from portal, look up condition from token
    if (portalToken && !condition) {
      const record = await prisma.familyPortalToken.findUnique({
        where: { token: portalToken },
        include: { patient: true },
      });
      if (record && record.expiresAt > new Date()) {
        resolvedCondition = record.patient.condition;
      }
    }

    const response = generateChatResponse(message, resolvedCondition);
    res.json({ response, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
