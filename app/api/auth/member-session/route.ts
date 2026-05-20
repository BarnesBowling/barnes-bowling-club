import { NextResponse } from 'next/server';
import { createMemberSession, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/memberSession';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { email } = await request.json() as { email?: string };
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

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
