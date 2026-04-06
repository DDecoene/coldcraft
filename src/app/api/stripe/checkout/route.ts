import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';

interface CheckoutRequest {
  email: string;
  plan: 'monthly' | 'yearly';
}

// Prices in euro cents
const PRICES = {
  monthly: { amount: 1900, interval: 'month' as const, label: 'ColdCraft Pro – Monthly' },
  yearly: { amount: 14900, interval: 'year' as const, label: 'ColdCraft Pro – Yearly' },
};

export async function POST(req: NextRequest) {
  let body: CheckoutRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { email, plan } = body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
  }

  if (plan !== 'monthly' && plan !== 'yearly') {
    return NextResponse.json(
      { error: 'plan must be "monthly" or "yearly".' },
      { status: 400 }
    );
  }

  const price = PRICES[plan];
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: price.label,
            },
            recurring: {
              interval: price.interval,
            },
            unit_amount: price.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/`,
      metadata: {
        email,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[/api/stripe/checkout] Stripe error:', err);
    return NextResponse.json(
      { error: 'Failed to create checkout session.' },
      { status: 500 }
    );
  }
}
