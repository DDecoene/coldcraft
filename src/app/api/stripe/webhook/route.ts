import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('[/api/stripe/webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
  }

  // Stripe is the source of truth — no DB needed.
  // verify-pro queries Stripe directly for active subscriptions.
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('[webhook] New Pro subscription:', session.metadata?.email, session.customer);
  }

  return NextResponse.json({ received: true });
}
