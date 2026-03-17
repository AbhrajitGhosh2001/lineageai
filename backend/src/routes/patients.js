const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const { auditMiddleware } = require('../middleware/audit');
const { encrypt, decryptPatient } = require('../lib/encryption');
const { cacheGet, cacheSet, cacheDelPattern, CACHE_TTL } = require('../lib/redis');

const router = express.Router();
router.use(authenticate);

router.get('/', auditMiddleware('Patient', 'READ'), async (req, res) => {
  try {
    const cacheKey = `patients:${req.user.userId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const patients = await prisma.patient.findMany({
      where: { counselorId: req.user.userId },
      include: {
        familyMembers: {
          include: { outreaches: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const decrypted = patients.map(decryptPatient);
    await cacheSet(cacheKey, decrypted, 60);
    res.json(decrypted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', auditMiddleware('Patient', 'READ'), async (req, res) => {
  try {
    const patient = await prisma.patient.findFirst({
      where: { id: req.params.id, counselorId: req.user.userId },
      include: {
        familyMembers: {
          include: { outreaches: { orderBy: { createdAt: 'desc' } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(decryptPatient(patient));
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', auditMiddleware('Patient', 'CREATE'), async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, email, phone, condition, testResult, testDate, notes } = req.body;
    if (!firstName || !lastName || !condition) {
      return res.status(400).json({ error: 'firstName, lastName, and condition are required' });
    }

    const patient = await prisma.patient.create({
      data: {
        firstNameEnc: encrypt(firstName),
        lastNameEnc: encrypt(lastName),
        dateOfBirth,
        emailEnc: encrypt(email),
        phoneEnc: encrypt(phone),
        condition,
        testResult,
        testDate,
        notes,
        counselorId: req.user.userId,
      },
    });

    await cacheDelPattern(`patients:${req.user.userId}*`);
    await cacheDelPattern(`dashboard:${req.user.userId}*`);
    res.status(201).json(decryptPatient(patient));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', auditMiddleware('Patient', 'UPDATE'), async (req, res) => {
  try {
    const existing = await prisma.patient.findFirst({
      where: { id: req.params.id, counselorId: req.user.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Patient not found' });

    const { firstName, lastName, dateOfBirth, email, phone, condition, testResult, testDate, notes } = req.body;
    const patient = await prisma.patient.update({
      where: { id: req.params.id },
      data: {
        firstNameEnc: firstName ? encrypt(firstName) : existing.firstNameEnc,
        lastNameEnc: lastName ? encrypt(lastName) : existing.lastNameEnc,
        dateOfBirth,
        emailEnc: email !== undefined ? encrypt(email) : existing.emailEnc,
        phoneEnc: phone !== undefined ? encrypt(phone) : existing.phoneEnc,
        condition,
        testResult,
        testDate,
        notes,
      },
    });

    await cacheDelPattern(`patients:${req.user.userId}*`);
    await cacheDelPattern(`dashboard:${req.user.userId}*`);
    res.json(decryptPatient(patient));
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', auditMiddleware('Patient', 'DELETE'), async (req, res) => {
  try {
    const existing = await prisma.patient.findFirst({
      where: { id: req.params.id, counselorId: req.user.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Patient not found' });
    await prisma.patient.delete({ where: { id: req.params.id } });
    await cacheDelPattern(`patients:${req.user.userId}*`);
    await cacheDelPattern(`dashboard:${req.user.userId}*`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
