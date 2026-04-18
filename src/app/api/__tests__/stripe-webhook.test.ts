import { describe, test, expect, beforeEach } from 'vitest';
import Stripe from 'stripe';

const SECRET = 'whsec_test_secret';

beforeEach(() => {
  process.env.STRIPE_WEBHOOK_SECRET = SECRET;
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
});

async function callWebhook(body: string, signature: string) {
  const { POST } = await import('@/app/api/stripe/webhook/route');
  const { NextRequest } = await import('next/server');
  const req = new NextRequest('http://localhost/api/stripe/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': signature, 'Content-Type': 'application/json' },
    body,
  });
  return POST(req);
}

function buildSignedPayload(secret: string) {
  const event = {
    id: 'evt_test',
    object: 'event',
    type: 'checkout.session.completed',
    data: { object: { metadata: { email: 'a@b.com' }, customer: 'cus_x' } },
  };
  const payload = JSON.stringify(event);
  const stripe = new Stripe(secret, { apiVersion: '2026-03-25.dahlia' });
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret } as Parameters<typeof stripe.webhooks.generateTestHeaderString>[0]);
  return { payload, signature };
}

describe('/api/stripe/webhook', () => {
  test('accepts valid signature and returns 200', async () => {
    const { payload, signature } = buildSignedPayload(SECRET);
    const res = await callWebhook(payload, signature);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);
  });

  test('rejects wrong-secret signature with 400', async () => {
    const { payload } = buildSignedPayload(SECRET);
    const stripe = new Stripe('whsec_WRONG', { apiVersion: '2026-03-25.dahlia' });
    const badSig = stripe.webhooks.generateTestHeaderString({ payload, secret: 'whsec_WRONG' } as Parameters<typeof stripe.webhooks.generateTestHeaderString>[0]);
    const res = await callWebhook(payload, badSig);
    expect(res.status).toBe(400);
  });

  test('rejects missing signature header with 400', async () => {
    const res = await callWebhook('{}', '');
    expect(res.status).toBe(400);
  });
});
