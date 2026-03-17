require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { encrypt } = require('./lib/encryption');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  const clinic = await prisma.clinic.upsert({
    where: { id: 'seed-clinic-1' },
    update: {},
    create: { id: 'seed-clinic-1', name: 'Demo Genetics Center', plan: 'core' },
  });

  const passwordHash = await bcrypt.hash('demo1234', 10);
  const counselor = await prisma.user.upsert({
    where: { email: 'demo@lineage.ai' },
    update: {},
    create: {
      email: 'demo@lineage.ai',
      passwordHash,
      name: 'Dr. Demo Counselor',
      clinicId: clinic.id,
    },
  });

  const patient1 = await prisma.patient.create({
    data: {
      firstNameEnc: encrypt('Sarah'),
      lastNameEnc: encrypt('Mitchell'),
      condition: 'BRCA1/2 - Hereditary Breast/Ovarian Cancer',
      testResult: 'positive',
      testDate: '2026-01-10',
      emailEnc: encrypt('sarah.m@email.com'),
      phoneEnc: encrypt('555-0101'),
      counselorId: counselor.id,
      clinicId: clinic.id,
      notes: 'BRCA1 pathogenic variant confirmed. Maternal family history of breast cancer.',
    },
  });

  const members1 = await Promise.all([
    prisma.familyMember.create({ data: { patientId: patient1.id, firstNameEnc: encrypt('Emily'),  lastNameEnc: encrypt('Mitchell'), relationship: 'sibling', emailEnc: encrypt('emily.m@email.com'),  testStatus: 'completed', testResult: 'positive',  testDate: '2026-02-15' } }),
    prisma.familyMember.create({ data: { patientId: patient1.id, firstNameEnc: encrypt('Rachel'), lastNameEnc: encrypt('Mitchell'), relationship: 'sibling', emailEnc: encrypt('rachel.m@email.com'), testStatus: 'scheduled' } }),
    prisma.familyMember.create({ data: { patientId: patient1.id, firstNameEnc: encrypt('Tom'),    lastNameEnc: encrypt('Mitchell'), relationship: 'sibling', testStatus: 'contacted' } }),
    prisma.familyMember.create({ data: { patientId: patient1.id, firstNameEnc: encrypt('Linda'),  lastNameEnc: encrypt('Mitchell'), relationship: 'parent', testStatus: 'not-contacted' } }),
    prisma.familyMember.create({ data: { patientId: patient1.id, firstNameEnc: encrypt('James'),  lastNameEnc: encrypt('Mitchell'), relationship: 'child',  testStatus: 'not-contacted' } }),
  ]);

  await prisma.outreach.createMany({
    data: [
      { familyMemberId: members1[0].id, method: 'email',  status: 'responded', sentAt: new Date('2026-01-20'), respondedAt: new Date('2026-01-22'), message: 'Cascade testing invitation' },
      { familyMemberId: members1[1].id, method: 'email',  status: 'sent',      sentAt: new Date('2026-02-01') },
      { familyMemberId: members1[1].id, method: 'sms',    status: 'delivered', sentAt: new Date('2026-02-10') },
      { familyMemberId: members1[2].id, method: 'phone',  status: 'sent',      sentAt: new Date('2026-02-05') },
    ],
  });

  const patient2 = await prisma.patient.create({
    data: {
      firstNameEnc: encrypt('Michael'),
      lastNameEnc: encrypt('Torres'),
      condition: 'Lynch Syndrome - Hereditary Colorectal Cancer',
      testResult: 'positive',
      testDate: '2026-01-25',
      emailEnc: encrypt('michael.t@email.com'),
      counselorId: counselor.id,
      clinicId: clinic.id,
    },
  });

  const members2 = await Promise.all([
    prisma.familyMember.create({ data: { patientId: patient2.id, firstNameEnc: encrypt('Carlos'), lastNameEnc: encrypt('Torres'), relationship: 'sibling', testStatus: 'completed', testResult: 'negative' } }),
    prisma.familyMember.create({ data: { patientId: patient2.id, firstNameEnc: encrypt('Maria'),  lastNameEnc: encrypt('Torres'), relationship: 'sibling', testStatus: 'not-contacted' } }),
    prisma.familyMember.create({ data: { patientId: patient2.id, firstNameEnc: encrypt('Ana'),    lastNameEnc: encrypt('Torres'), relationship: 'parent',  testStatus: 'declined' } }),
  ]);

  await prisma.outreach.createMany({
    data: [
      { familyMemberId: members2[0].id, method: 'email',  status: 'responded', sentAt: new Date('2026-02-01'), respondedAt: new Date('2026-02-03') },
      { familyMemberId: members2[2].id, method: 'letter', status: 'sent',       sentAt: new Date('2026-02-05') },
    ],
  });

  console.log('Seeded successfully!');
  console.log('Demo login: demo@lineage.ai / demo1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
