import "dotenv/config";
import { defineConfig } from "prisma/config";

// Supports PgBouncer in transaction mode via ?pgbouncer=true&connection_limit=1
// For direct migrations use DATABASE_URL_DIRECT (bypasses PgBouncer)
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL_DIRECT"] ?? process.env["DATABASE_URL"],
  },
});
