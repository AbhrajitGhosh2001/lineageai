const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const { cacheGet, cacheSet, CACHE_TTL } = require('../lib/redis');
const { decryptPatient, decryptFamilyMember } = require('../lib/encryption');

const router = express.Router();
router.use(authenticate);

router.get('/dashboard', async (req, res) => {
  try {
    const counselorId = req.user.userId;
    const cacheKey = `dashboard:${counselorId}`;

    const cached = await cacheGet(cacheKey);
    if (cached) return res.json({ ...cached, cached: true });

    const patients = await prisma.patient.findMany({
      where: { counselorId },
      include: {
        familyMembers: {
          include: { outreaches: true },
        },
      },
    });

    const totalPatients = patients.length;
    const allMembers = patients.flatMap(p => p.familyMembers);
    const totalAtRisk = allMembers.length;
    const tested = allMembers.filter(m => m.testStatus === 'completed').length;
    const contacted = allMembers.filter(m => ['contacted', 'scheduled', 'completed'].includes(m.testStatus)).length;
    const declined = allMembers.filter(m => m.testStatus === 'declined').length;
    const notContacted = allMembers.filter(m => m.testStatus === 'not-contacted').length;
    const scheduled = allMembers.filter(m => m.testStatus === 'scheduled').length;
    const cascadeRate = totalAtRisk > 0 ? Math.round((tested / totalAtRisk) * 100) : 0;

    const conditionCounts = {};
    patients.forEach(p => {
      conditionCounts[p.condition] = (conditionCounts[p.condition] || 0) + 1;
    });
    const conditionBreakdown = Object.entries(conditionCounts).map(([name, count]) => ({ name, count }));

    const recentOutreaches = await prisma.outreach.findMany({
      where: { familyMember: { patient: { counselorId } } },
      include: {
        familyMember: { include: { patient: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const decryptedOutreaches = recentOutreaches.map(o => ({
      ...o,
      familyMember: {
        ...decryptFamilyMember(o.familyMember),
        patient: decryptPatient(o.familyMember.patient),
      },
    }));

    const stats = {
      totalPatients,
      totalAtRisk,
      tested,
      contacted,
      declined,
      notContacted,
      scheduled,
      cascadeRate,
      industryBaseline: 30,
      conditionBreakdown,
      recentOutreaches: decryptedOutreaches,
    };

    await cacheSet(cacheKey, stats, CACHE_TTL.DASHBOARD);
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
