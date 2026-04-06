import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.PRO_TOKEN_SECRET ?? 'fallback-dev-secret';
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
