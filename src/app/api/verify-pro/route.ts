import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';

export async function POST(req: NextRequest) {
  let body: { email: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { email } = body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
  }

  try {
    // Find customers with this email
    const customers = await stripe.customers.list({ email, limit: 5 });

    if (customers.data.length === 0) {
      return NextResponse.json({ isPro: false });
    }

    // Check if any customer has an active subscription
    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1,
      });
      if (subscriptions.data.length > 0) {
        return NextResponse.json({ isPro: true });
      }
    }

    return NextResponse.json({ isPro: false });
  } catch (err) {
    console.error('[/api/verify-pro] Stripe error:', err);
    return NextResponse.json({ error: 'Verification failed.' }, { status: 500 });
  }
}
