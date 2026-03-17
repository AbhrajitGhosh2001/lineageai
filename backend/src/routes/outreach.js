const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');
const { decryptFamilyMember } = require('../lib/encryption');
const { enqueueOutreach } = require('../queues/outreach');
const { cacheDelPattern } = require('../lib/redis');

const router = express.Router({ mergeParams: true });
router.use(authenticate);

async function verifyMemberOwnership(memberId, userId) {
  return prisma.familyMember.findFirst({
    where: { id: memberId, patient: { counselorId: userId } },
    include: { patient: true },
  });
}

router.get('/', auditMiddleware('Outreach', 'READ'), async (req, res) => {
  try {
    const member = await verifyMemberOwnership(req.params.memberId, req.user.userId);
    if (!member) return res.status(404).json({ error: 'Family member not found' });

    const outreaches = await prisma.outreach.findMany({
      where: { familyMemberId: req.params.memberId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(outreaches);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', auditMiddleware('Outreach', 'CREATE'), async (req, res) => {
  try {
    const member = await verifyMemberOwnership(req.params.memberId, req.user.userId);
    if (!member) return res.status(404).json({ error: 'Family member not found' });

    const { method, message } = req.body;
    if (!method) return res.status(400).json({ error: 'method is required' });

    const decrypted = decryptFamilyMember(member);

    // Create outreach record immediately (status: pending until worker processes)
    const outreach = await prisma.outreach.create({
      data: {
        familyMemberId: req.params.memberId,
        method,
        message,
        status: 'pending',
      },
    });

    // Enqueue background job for actual dispatch
    const jobId = await enqueueOutreach({
      outreachId: outreach.id,
      method,
      familyMemberId: req.params.memberId,
      message,
      recipientEmail: decrypted.email,
      recipientPhone: decrypted.phone,
    });

    // Update with jobId if queued, otherwise mark sent directly
    await prisma.outreach.update({
      where: { id: outreach.id },
      data: jobId
        ? { jobId: String(jobId) }
        : { status: 'sent', sentAt: new Date() },
    });

    // Update family member status to contacted if not yet
    if (member.testStatus === 'not-contacted') {
      await prisma.familyMember.update({
        where: { id: req.params.memberId },
        data: { testStatus: 'contacted' },
      });
    }

    await cacheDelPattern(`patients:${req.user.userId}*`);
    await cacheDelPattern(`dashboard:${req.user.userId}*`);

    res.status(201).json({ ...outreach, jobId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:outreachId', auditMiddleware('Outreach', 'UPDATE'), async (req, res) => {
  try {
    const member = await verifyMemberOwnership(req.params.memberId, req.user.userId);
    if (!member) return res.status(404).json({ error: 'Family member not found' });

    const { status, respondedAt } = req.body;
    const outreach = await prisma.outreach.update({
      where: { id: req.params.outreachId },
      data: {
        status,
        respondedAt: respondedAt ? new Date(respondedAt) : undefined,
      },
    });
    res.json(outreach);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
