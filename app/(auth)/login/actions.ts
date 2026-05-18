'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createMemberSession, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/memberSession';

type ActionResult = { error?: string } | null;

export async function signIn(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const memberNumber = String(formData.get('member_number') ?? '').trim().toUpperCase();
  const email        = String(formData.get('email')         ?? '').trim().toLowerCase();
  const redirectPath = String(formData.get('redirect')      ?? '').trim();

  if (!memberNumber || !email) return { error: 'Both fields are required.' };

  const { data } = await supabaseAdmin
    .from('member_profiles')
    .select('member_email')
    .eq('membership_number', memberNumber)
    .eq('member_email', email)
    .maybeSingle();

  if (!data) return { error: 'Membership number and email do not match our records.' };

  const sessionValue = await createMemberSession(email);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  const dest = redirectPath.startsWith('/') && !redirectPath.startsWith('//')
    ? redirectPath
    : '/members/dashboard';
  redirect(dest);
}
