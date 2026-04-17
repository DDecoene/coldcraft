import { createHmac, timingSafeEqual } from 'crypto';

function resolveSecret(): string {
  const fromEnv = process.env.PRO_TOKEN_SECRET;
  if (fromEnv && fromEnv.length > 0) return fromEnv;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('PRO_TOKEN_SECRET is required in production');
  }

  console.warn(
    '[pro-token] PRO_TOKEN_SECRET not set; using dev fallback. ' +
      'Set PRO_TOKEN_SECRET in .env.local to silence this warning.',
  );
  return 'fallback-dev-secret';
}

const SECRET = resolveSecret();
const COOKIE_NAME = 'coldcraft_pro_token';

export function signProToken(email: string): string {
  const payload = email.toLowerCase().trim();
  const hmac = createHmac('sha256', SECRET).update(payload).digest('hex');
  return `${payload}:${hmac}`;
}

export function verifyProToken(token: string): boolean {
  const sep = token.lastIndexOf(':');
  if (sep === -1) return false;
  const email = token.slice(0, sep);
  const hmac = token.slice(sep + 1);
  const expected = createHmac('sha256', SECRET).update(email).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
