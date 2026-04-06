import { NextRequest, NextResponse } from 'next/server';
import getSupabaseClient from '@/lib/supabase';

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

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('pro_users')
    .select('email, active')
    .eq('email', email)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    console.error('[/api/verify-pro] Supabase error:', error);
    return NextResponse.json({ error: 'Database error.' }, { status: 500 });
  }

  return NextResponse.json({ isPro: data !== null });
}
