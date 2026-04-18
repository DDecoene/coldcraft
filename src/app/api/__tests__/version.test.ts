import { describe, test, expect, beforeEach, afterEach } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  process.env.GIT_SHA = 'abc1234';
  process.env.BUILD_AT = '2026-04-18T12:00:00Z';
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe('/api/version', () => {
  test('returns sha, builtAt, nodeEnv from env', async () => {
    const { GET } = await import('@/app/api/version/route');
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.sha).toBe('abc1234');
    expect(json.builtAt).toBe('2026-04-18T12:00:00Z');
    expect(typeof json.nodeEnv).toBe('string');
  });

  test('falls back to "unknown" when env vars missing', async () => {
    delete process.env.GIT_SHA;
    delete process.env.BUILD_AT;
    const { GET } = await import('@/app/api/version/route');
    const res = await GET();
    const json = await res.json();
    expect(json.sha).toBe('unknown');
    expect(json.builtAt).toBe('unknown');
  });
});
