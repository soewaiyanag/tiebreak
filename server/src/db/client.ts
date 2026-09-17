import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

/**
 * One pooled connection, created once and reused across requests. Application
 * query traffic always goes through DATABASE_URL (the Neon -pooler host, via
 * PgBouncer) — never DATABASE_URL_UNPOOLED, which is reserved for migrations
 * (see drizzle.config.ts).
 */
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema });
