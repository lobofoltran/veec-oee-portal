import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { QueryResultRow } from "pg";

let pool: Pool | null = null;
let db: Kysely<Record<string, never>> | null = null;

function getPool() {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }
  pool = new Pool({ connectionString });
  return pool;
}

export function getDb() {
  if (db) return db;
  db = new Kysely<Record<string, never>>({
    dialect: new PostgresDialect({ pool: getPool() }),
  });
  return db;
}

export async function sqlQuery<T extends QueryResultRow = Record<string, unknown>>(text: string, values: unknown[] = []) {
  const result = await getPool().query<T>(text, values);
  return result;
}

export async function closeSqlPool() {
  if (!pool) return;
  await pool.end();
  pool = null;
}
