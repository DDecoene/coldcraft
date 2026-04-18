import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

let pool: Pool | null = null;
let ddlRan = false;

function getPool(): Pool {
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}

export async function initDb(): Promise<void> {
  const schema = readFileSync(join(process.cwd(), 'src/lib/schema.sql'), 'utf8');
  await getPool().query(schema);
  ddlRan = true;
}

// Returns the pool. On first call after boot, runs DDL as a safety net
// in case instrumentation.ts didn't fire.
export async function getDb(): Promise<Pool> {
  const db = getPool();
  if (!ddlRan) {
    try {
      await initDb();
    } catch (err) {
      console.error('[db] initDb safety-net failed:', err);
    }
  }
  return db;
}
