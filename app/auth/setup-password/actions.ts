'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  verifySetupToken,
  createMemberSession,
  SETUP_COOKIE,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from '@/lib/memberSession';

type ActionResult = { error?: string } | null;

export async function setupPassword(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const cookieStore = await cookies();
  const tokenValue  = cookieStore.get(SETUP_COOKIE)?.value;
  if (!tokenValue) return { error: 'Setup session expired. Please start again.' };

  const tokenData = await verifySetupToken(tokenValue);
  if (!tokenData) return { error: 'Setup session expired or invalid. Please start again.' };

  const { email } = tokenData;
  const password = String(formData.get('password')       ?? '');
  const confirm  = String(formData.get('confirm_password') ?? '');

  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (password !== confirm)  return { error: 'Passwords do not match.' };

  // Find the member's auth_user_id
  const { data: member } = await supabaseAdmin
    .from('club_members')
    .select('id, auth_user_id')
    .eq('email', email)
    .maybeSingle();

  if (!member) return { error: 'Member record not found. Please contact the club.' };

  let authUserId = member.auth_user_id;

  // If auth user wasn't linked yet, create or find one
  if (!authUserId) {
    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    if (createErr) {
      // User already exists in Supabase Auth — find their ID and link it
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const existing = users.find(u => u.email === email);
      if (!existing) {
        console.error('[setup-password/setupPassword] createUser failed and no existing user found:', JSON.stringify(createErr));
        return { error: 'Unable to create your account. Please contact the club.' };
      }
      authUserId = existing.id;
    } else {
      authUserId = newUser.user.id;
    }

    await supabaseAdmin.from('club_members').update({ auth_user_id: authUserId }).eq('id', member.id);
  }

  // Set the password
  const { error: pwErr } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
    password,
    email_confirm: true,
  });
  if (pwErr) return { error: pwErr.message };

  // Mark password as set
  await supabaseAdmin
    .from('club_members')
    .update({ password_set: true })
    .eq('id', member.id);

  // Delete setup token cookie
  cookieStore.delete(SETUP_COOKIE);

  // Issue HMAC member session
  const sessionValue = await createMemberSession(email);
  cookieStore.set(SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   SESSION_MAX_AGE,
    path:     '/',
  });

  redirect('/members/dashboard');
}
