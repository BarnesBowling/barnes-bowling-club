'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { createSetupToken, SETUP_COOKIE, SETUP_MAX_AGE } from '@/lib/memberSession';

type ActionResult = { error?: string } | null;

export async function beginSetup(_prev: ActionResult, _formData: FormData): Promise<ActionResult> {
  // Get the authenticated user from the Supabase session — never trust form input for email
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      error: 'Your invite link has expired. Please ask the club secretary for a new invite at info@barnesbowling.club.',
    };
  }

  // Look up club member by session email, case-insensitively
  const { data: member } = await supabaseAdmin
    .from('club_members')
    .select('id, email, auth_user_id, password_set')
    .ilike('email', user.email)
    .maybeSingle();

  if (!member) {
    return {
      error: "We couldn't find your membership record for this email address. Please contact the club secretary at info@barnesbowling.club.",
    };
  }

  if (member.password_set) {
    return {
      error: "You've already set up your password. Please sign in with your email and password instead.",
    };
  }

  // Link the Supabase auth user to the club_members row if not already done
  if (!member.auth_user_id) {
    await supabaseAdmin
      .from('club_members')
      .update({ auth_user_id: user.id })
      .eq('id', member.id);
  }

  // Issue a short-lived signed setup token using the canonical stored email
  const token = await createSetupToken(member.email);
  const cookieStore = await cookies();
  cookieStore.set(SETUP_COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   SETUP_MAX_AGE,
    path:     '/',
  });

  redirect('/auth/setup-password');
}
