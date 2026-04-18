import { describe, test, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import { Pool } from 'pg';
import { NextRequest } from 'next/server';
import { initDb } from '@/lib/db';

vi.mock('@/lib/claude-cli', () => ({
  runClaude: vi.fn().mockResolvedValue(JSON.stringify({
    emails: [
      { subject: 'a', body: 'b', framework: 'Problem-Solution' },
      { subject: 'a', body: 'b', framework: 'AIDA' },
      { subject: 'a', body: 'b', framework: 'Pattern Interrupt' },
    ],
  })),
}));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

beforeAll(async () => {
  await initDb();
});

beforeEach(async () => {
  await pool.query('TRUNCATE usage');
});

afterAll(async () => {
  await pool.end();
});

async function callGenerate(fp = 'test-fp-1') {
  const { POST } = await import('@/app/api/generate/route');
  const req = new NextRequest('http://localhost/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: `coldcraft_fp=${fp}` },
    body: JSON.stringify({
      product: 'X', prospectRole: 'CFO', prospectIndustry: 'SaaS',
      valueProposition: 'faster', tone: 'professional', length: 'short',
    }),
  });
  return POST(req);
}

describe('/api/generate rate limit', () => {
  test('first 3 requests succeed, 4th is limited', async () => {
    for (let i = 0; i < 3; i++) {
      const res = await callGenerate();
      expect(res.status).toBe(200);
    }
    const res4 = await callGenerate();
    expect(res4.status).toBe(429);

    const { rows } = await pool.query<{ count: number }>(
      `SELECT count FROM usage WHERE fingerprint_id = 'test-fp-1'`,
    );
    expect(rows[0].count).toBe(3);
  });

  test('different fingerprints each get their own counter', async () => {
    for (let i = 0; i < 3; i++) {
      expect((await callGenerate('fp-a')).status).toBe(200);
    }
    expect((await callGenerate('fp-b')).status).toBe(200);
  });
});
