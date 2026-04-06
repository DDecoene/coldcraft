import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export async function getDb(): Promise<Pool> {
  const db = getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS usage (
      fingerprint_id TEXT NOT NULL,
      usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
      count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (fingerprint_id, usage_date)
    )
  `);
  return db;
}
