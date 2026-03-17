require('dotenv').config();
const { Worker } = require('bullmq');
const Redis = require('ioredis');
const prisma = require('../lib/prisma');
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');

// BullMQ requires maxRetriesPerRequest: null — use a dedicated connection
// separate from the shared cache client in lib/redis.js
function getBullRedis() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const isTLS = url.startsWith('rediss://');
  return new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: isTLS ? {} : undefined,
  });
}

// ── SendGrid setup ────────────────────────────────────────────────────────────
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('[Worker] SENDGRID_API_KEY not set — email dispatch will be skipped.');
}

// ── Twilio setup ──────────────────────────────────────────────────────────────
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} else {
  console.warn('[Worker] TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN not set — SMS dispatch will be skipped.');
}

// ── Provider dispatch ─────────────────────────────────────────────────────────

async function sendEmail({ recipientEmail, message, subject }) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('[Worker] Skipping email — no SendGrid API key.');
    return { skipped: true };
  }
  if (!recipientEmail) throw new Error('recipientEmail is required for email outreach');

  const msg = {
    to: recipientEmail,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@lineage.ai',
    subject: subject || 'Important Health Information from Lineage AI',
    text: message,
    html: `<p>${message.replace(/\n/g, '<br/>')}</p>
           <hr/>
           <p style="font-size:12px;color:#888;">
             This message was sent by Lineage AI on behalf of your healthcare provider.
             If you have questions, please contact your care team directly.
           </p>`,
  };

  const [response] = await sgMail.send(msg);
  console.log(`[Worker] Email sent to ${recipientEmail} — status ${response.statusCode}`);
  return { provider: 'sendgrid', statusCode: response.statusCode };
}

async function sendSms({ recipientPhone, message }) {
  if (!twilioClient) {
    console.warn('[Worker] Skipping SMS — Twilio not configured.');
    return { skipped: true };
  }
  if (!recipientPhone) throw new Error('recipientPhone is required for SMS outreach');
  if (!process.env.TWILIO_FROM_NUMBER) throw new Error('TWILIO_FROM_NUMBER env var is required');

  const result = await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_FROM_NUMBER,
    to: recipientPhone,
  });

  console.log(`[Worker] SMS sent to ${recipientPhone} — SID ${result.sid} status ${result.status}`);
  return { provider: 'twilio', sid: result.sid, status: result.status };
}

async function dispatchOutreach(method, data) {
  switch (method) {
    case 'email':
      return sendEmail(data);

    case 'sms':
      return sendSms(data);

    case 'letter':
      // PostGrid integration placeholder — add POSTGRID_API_KEY when ready
      console.warn('[Worker] Letter dispatch not yet integrated (PostGrid). Logging intent.');
      return { skipped: true, reason: 'PostGrid not configured' };

    case 'phone':
      // Twilio Voice / Bland AI placeholder
      console.warn('[Worker] Phone call dispatch not yet integrated. Logging intent.');
      return { skipped: true, reason: 'Voice provider not configured' };

    default:
      throw new Error(`Unknown outreach method: ${method}`);
  }
}

// ── BullMQ Worker ─────────────────────────────────────────────────────────────

const worker = new Worker(
  'outreach',
  async (job) => {
    const {
      outreachId,
      method,
      familyMemberId,
      message,
      subject,
      recipientEmail,
      recipientPhone,
    } = job.data;

    console.log(`[Worker] Processing outreach job ${job.id}: ${method} → family member ${familyMemberId}`);

    let dispatchResult;
    try {
      dispatchResult = await dispatchOutreach(method, {
        recipientEmail,
        recipientPhone,
        message,
        subject,
      });
    } catch (err) {
      // Mark as failed in DB so the UI reflects the real state
      await prisma.outreach.update({
        where: { id: outreachId },
        data: { status: 'failed' },
      });
      throw err; // re-throw so BullMQ records the failure and can retry
    }

    const finalStatus = dispatchResult?.skipped ? 'skipped' : 'delivered';

    await prisma.outreach.update({
      where: { id: outreachId },
      data: { status: finalStatus, sentAt: new Date() },
    });

    console.log(`[Worker] Outreach job ${job.id} → ${finalStatus}`);
    return { success: true, outreachId, dispatchResult };
  },
  {
    connection: getBullRedis(),
    concurrency: 10,
  }
);

worker.on('completed', (job, result) => {
  console.log(`[Worker] Job ${job.id} completed:`, result?.dispatchResult);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

module.exports = worker;
