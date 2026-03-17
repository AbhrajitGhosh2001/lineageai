require('dotenv').config();
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

/**
 * PostgreSQL connection via @prisma/adapter-pg.
 *
 * DATABASE_URL should include PgBouncer params for production:
 *   postgresql://user:pass@pgbouncer-host:6432/db?pgbouncer=true&connection_limit=1
 *
 * DATABASE_URL_DIRECT bypasses PgBouncer for migrations:
 *   postgresql://user:pass@postgres-host:5432/db
 */
const connectionString = process.env.DATABASE_URL;

let prisma;

if (global.__prisma) {
  prisma = global.__prisma;
} else {
  const adapter = new PrismaPg({ connectionString });
  prisma = new PrismaClient({ adapter });

  // Prevent multiple instances in dev (hot reload)
  if (process.env.NODE_ENV !== 'production') {
    global.__prisma = prisma;
  }
}

module.exports = prisma;
