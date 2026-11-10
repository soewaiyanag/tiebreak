import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

/**
 * Runs once per `vitest run`, before any test file loads: a real Postgres 17
 * in Docker (same major version as Neon), with the real Drizzle migrations
 * applied, so tests exercise the actual schema and constraints. Needs Docker.
 */
export default async function setup() {
  const container = await new PostgreSqlContainer("postgres:17-alpine").start();
  const url = container.getConnectionUri();

  const pool = new Pool({ connectionString: url });
  await migrate(drizzle(pool), { migrationsFolder: new URL("../drizzle", import.meta.url).pathname });
  await pool.end();

  // Test workers inherit this, so src/db/client.ts connects here — never to Neon.
  process.env.DATABASE_URL = url;

  return async () => {
    await container.stop();
  };
}
