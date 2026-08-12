import { NextResponse } from 'next/server';
import { createMemberSession, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/memberSession';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { email } = await request.json() as { email?: string };
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

  // Mark password as set (idempotent — covers forgot-password and invite flows)
  await supabaseAdmin
    .from('club_members')
    .update({ password_set: true })
    .eq('email', email);

  const token = await createMemberSession(email);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return NextResponse.json({ ok: true });
}
