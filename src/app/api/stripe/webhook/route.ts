import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import getSupabaseClient from '@/lib/supabase';
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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const email = session.metadata?.email;
    const stripeCustomerId =
      typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;

    if (!email) {
      console.error('[/api/stripe/webhook] No email in session metadata:', session.id);
      return NextResponse.json({ error: 'No email in metadata.' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.from('pro_users').upsert(
      {
        email,
        stripe_customer_id: stripeCustomerId,
        created_at: new Date().toISOString(),
        active: true,
      },
      { onConflict: 'email' }
    );

    if (error) {
      console.error('[/api/stripe/webhook] Supabase upsert error:', error);
      return NextResponse.json({ error: 'Database error.' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
