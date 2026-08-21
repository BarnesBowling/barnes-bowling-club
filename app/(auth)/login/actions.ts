'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createMemberSession, SESSION_COOKIE, SESSION_MAX_AGE, createSetupToken, SETUP_COOKIE, SETUP_MAX_AGE } from '@/lib/memberSession';

type ActionResult = { error?: string } | null;

export async function signIn(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const memberNumber = String(formData.get('member_number') ?? '').trim().toUpperCase();
  const password     = String(formData.get('password')      ?? '').trim();
  const redirectPath = String(formData.get('redirect')      ?? '').trim();

  if (!memberNumber || !password) return { error: 'Both fields are required.' };

  // Resolve membership number → email + password_set flag
  const { data: member } = await supabaseAdmin
    .from('club_members')
    .select('email, password_set')
    .eq('membership_number', memberNumber)
    .maybeSingle();

  if (!member?.email) {
    return { error: 'Membership number not recognised. Check your membership card and try again.' };
  }

  if (!member.password_set) {
    // First-time members use their registered email address as their initial password.
    if (password.toLowerCase() === member.email.toLowerCase()) {
      const setupToken = await createSetupToken(member.email);
      const cookieStore = await cookies();
      cookieStore.set(SETUP_COOKIE, setupToken, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   SETUP_MAX_AGE,
        path:     '/',
      });
      redirect('/auth/setup-password');
    }
    return {
      error: "If this is your first login, enter your registered email address as your password. Otherwise use 'Logging on for the first time?' below to set up your account.",
    };
  }

  // Verify password against Supabase Auth
  const authRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ email: member.email, password }),
    },
  );

  if (!authRes.ok) {
    return { error: "Incorrect password. If you've forgotten it, use the 'Forgot your password?' link below." };
  }

  // Issue custom HMAC session
  const sessionValue = await createMemberSession(member.email);
  const cookieStore  = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   SESSION_MAX_AGE,
    path:     '/',
  });

  // Viewer accounts go straight to their restricted landing page
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('email', member.email)
    .maybeSingle();
  if (profile?.role === 'viewer') redirect('/admin/statements');

  const dest = redirectPath.startsWith('/') && !redirectPath.startsWith('//')
    ? redirectPath
    : '/members/dashboard';
  redirect(dest);
}
