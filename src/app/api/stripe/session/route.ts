import { NextRequest } from 'next/server';
import stripeClient from '@/lib/stripe';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return Response.json({ error: 'session_id is required' }, { status: 400 });
  }

  try {
    const session = await stripeClient.checkout.sessions.retrieve(sessionId);
    const email = session.customer_details?.email ?? session.customer_email ?? null;

    if (!email) {
      return Response.json({ error: 'No email found for this session' }, { status: 404 });
    }

    return Response.json({ email });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve session';
    return Response.json({ error: message }, { status: 500 });
  }
}
