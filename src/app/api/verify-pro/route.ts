import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { signProToken, COOKIE_NAME as PRO_COOKIE } from '@/lib/pro-token';

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

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const customers = await stripe.customers.list({ email: normalizedEmail, limit: 5 });

    if (customers.data.length === 0) {
      return NextResponse.json({ isPro: false });
    }

    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'active',
        limit: 1,
      });
      if (subscriptions.data.length > 0) {
        const res = NextResponse.json({ isPro: true });
        res.cookies.set(PRO_COOKIE, signProToken(normalizedEmail), {
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 365, // 1 year
          path: '/',
        });
        return res;
      }
    }

    return NextResponse.json({ isPro: false });
  } catch (err) {
    console.error('[/api/verify-pro] Stripe error:', err);
    return NextResponse.json({ error: 'Verification failed.' }, { status: 500 });
  }
}
