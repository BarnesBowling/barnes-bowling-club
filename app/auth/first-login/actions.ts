'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createSetupToken, SETUP_COOKIE, SETUP_MAX_AGE } from '@/lib/memberSession';

type ActionResult = { error?: string } | null;

export async function beginSetup(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const memberNumber = String(formData.get('member_number') ?? '').trim().toUpperCase();
  const email        = String(formData.get('email')         ?? '').trim().toLowerCase();

  if (!memberNumber || !email) return { error: 'Both fields are required.' };

  // Verify membership number + email
  const { data: member } = await supabaseAdmin
    .from('club_members')
    .select('id, email, auth_user_id, password_set')
    .eq('membership_number', memberNumber)
    .eq('email', email)
    .maybeSingle();

  if (!member) {
    return { error: 'Membership number and email do not match our records. Please check and try again.' };
  }

  if (member.password_set) {
    return {
      error: "You've already set up your password. Please sign in with your password instead. If you've forgotten it, use the 'Forgot your password?' link on the login page.",
    };
  }

  // Create a Supabase Auth user if not already linked
  if (!member.auth_user_id) {
    let authUserId: string | null = null;

    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    if (createErr) {
      // User already exists in Supabase Auth — find their ID and link it
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const existing = users.find(u => u.email === email);
      if (!existing) {
        console.error('[first-login/beginSetup] createUser failed and no existing user found:', JSON.stringify(createErr));
        return { error: 'Unable to create your account. Please contact the club administrator.' };
      }
      authUserId = existing.id;
    } else {
      authUserId = newUser?.user?.id ?? null;
    }

    if (authUserId) {
      await supabaseAdmin
        .from('club_members')
        .update({ auth_user_id: authUserId })
        .eq('id', member.id);
    }
  }

  // Issue a short-lived signed setup token
  const token = await createSetupToken(email);
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
