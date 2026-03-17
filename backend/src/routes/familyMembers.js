const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');
const { encrypt, decryptFamilyMember } = require('../lib/encryption');
const { cacheDelPattern } = require('../lib/redis');

const router = express.Router({ mergeParams: true });
router.use(authenticate);

async function verifyPatientOwnership(patientId, userId) {
  return prisma.patient.findFirst({ where: { id: patientId, counselorId: userId } });
}

router.get('/', auditMiddleware('FamilyMember', 'READ'), async (req, res) => {
  try {
    const patient = await verifyPatientOwnership(req.params.patientId, req.user.userId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const members = await prisma.familyMember.findMany({
      where: { patientId: req.params.patientId },
      include: { outreaches: { orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(members.map(decryptFamilyMember));
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', auditMiddleware('FamilyMember', 'CREATE'), async (req, res) => {
  try {
    const patient = await verifyPatientOwnership(req.params.patientId, req.user.userId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const { firstName, lastName, relationship, email, phone, dateOfBirth, riskLevel } = req.body;
    if (!firstName || !lastName || !relationship) {
      return res.status(400).json({ error: 'firstName, lastName, and relationship are required' });
    }

    const member = await prisma.familyMember.create({
      data: {
        patientId: req.params.patientId,
        firstNameEnc: encrypt(firstName),
        lastNameEnc: encrypt(lastName),
        relationship,
        emailEnc: encrypt(email),
        phoneEnc: encrypt(phone),
        dateOfBirth,
        riskLevel: riskLevel ?? 'at-risk',
      },
    });

    await cacheDelPattern(`patients:${req.user.userId}*`);
    await cacheDelPattern(`dashboard:${req.user.userId}*`);
    res.status(201).json(decryptFamilyMember(member));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:memberId', auditMiddleware('FamilyMember', 'UPDATE'), async (req, res) => {
  try {
    const patient = await verifyPatientOwnership(req.params.patientId, req.user.userId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const existing = await prisma.familyMember.findUnique({ where: { id: req.params.memberId } });
    if (!existing) return res.status(404).json({ error: 'Family member not found' });

    const { firstName, lastName, relationship, email, phone, dateOfBirth, riskLevel, testStatus, testResult, testDate } = req.body;

    const member = await prisma.familyMember.update({
      where: { id: req.params.memberId },
      data: {
        firstNameEnc: firstName ? encrypt(firstName) : existing.firstNameEnc,
        lastNameEnc: lastName ? encrypt(lastName) : existing.lastNameEnc,
        relationship,
        emailEnc: email !== undefined ? encrypt(email) : existing.emailEnc,
        phoneEnc: phone !== undefined ? encrypt(phone) : existing.phoneEnc,
        dateOfBirth,
        riskLevel,
        testStatus,
        testResult,
        testDate,
      },
    });

    await cacheDelPattern(`patients:${req.user.userId}*`);
    await cacheDelPattern(`dashboard:${req.user.userId}*`);
    res.json(decryptFamilyMember(member));
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:memberId', auditMiddleware('FamilyMember', 'DELETE'), async (req, res) => {
  try {
    const patient = await verifyPatientOwnership(req.params.patientId, req.user.userId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    await prisma.familyMember.delete({ where: { id: req.params.memberId } });
    await cacheDelPattern(`patients:${req.user.userId}*`);
    await cacheDelPattern(`dashboard:${req.user.userId}*`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
