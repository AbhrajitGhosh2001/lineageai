require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('[FATAL] DATABASE_URL environment variable is not set');
  console.error('[FATAL] Set DATABASE_URL in Railway service variables and redeploy');
}

let prisma;

if (global.__prisma) {
  prisma = global.__prisma;
} else if (connectionString) {
  const adapter = new PrismaPg({ connectionString });
  prisma = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== 'production') {
    global.__prisma = prisma;
  }
} else {
  // Return a proxy that throws a clear error on any DB call
  // so the process stays alive and /api/health still responds
  prisma = new Proxy({}, {
    get: () => () => Promise.reject(new Error('DATABASE_URL is not configured')),
  });
}

module.exports = prisma;
