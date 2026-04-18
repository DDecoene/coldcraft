import { describe, test, expect, afterEach, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.resetModules();
});

describe('pro-token', () => {
  test('sign then verify returns true for the same email', async () => {
    process.env.PRO_TOKEN_SECRET = 'test-secret-long-enough';
    const { signProToken, verifyProToken } = await import('../pro-token');
    const token = signProToken('alice@example.com');
    expect(verifyProToken(token)).toBe(true);
  });

  test('tampered token fails verification', async () => {
    process.env.PRO_TOKEN_SECRET = 'test-secret-long-enough';
    const { signProToken, verifyProToken } = await import('../pro-token');
    const token = signProToken('alice@example.com');
    const [payload, hmac] = token.split(':');
    const flipped = (parseInt(hmac[0], 16) ^ 1).toString(16) + hmac.slice(1);
    expect(verifyProToken(`${payload}:${flipped}`)).toBe(false);
  });

  test('malformed token returns false, never throws', async () => {
    process.env.PRO_TOKEN_SECRET = 'test-secret-long-enough';
    const { verifyProToken } = await import('../pro-token');
    expect(verifyProToken('no-colon-here')).toBe(false);
    expect(verifyProToken('')).toBe(false);
  });

  test('module import throws when PRO_TOKEN_SECRET missing in production', async () => {
    (process.env as { [key: string]: string }).NODE_ENV = 'production';
    delete process.env.PRO_TOKEN_SECRET;
    await expect(import('../pro-token')).rejects.toThrow(
      /PRO_TOKEN_SECRET is required in production/,
    );
  });

  test('module import warns but does not throw in dev when secret missing', async () => {
    (process.env as { [key: string]: string }).NODE_ENV = 'development';
    delete process.env.PRO_TOKEN_SECRET;
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(import('../pro-token')).resolves.toBeDefined();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('PRO_TOKEN_SECRET'));
  });
});
