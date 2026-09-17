import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Migrations need the DIRECT connection (no -pooler host): PgBouncer's
    // transaction-pooling mode doesn't support the session-level statements
    // migrations rely on. See neon-postgres skill: "pooled vs direct".
    url: process.env.DATABASE_URL_UNPOOLED!,
  },
});
