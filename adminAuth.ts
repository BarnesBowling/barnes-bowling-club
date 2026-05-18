import { cookies } from 'next/headers';
import { verifyMemberSession, SESSION_COOKIE } from './memberSession';
import { supabaseAdmin } from './supabase/admin';

/**
 * Guards admin routes using the custom member session cookie.
 *
 * The site uses two auth systems: Supabase auth (for historical admin Supabase
 * accounts) and a custom HMAC cookie session (for all member logins via
 * membership number + email). The standard requireRole() uses supabase.auth.getUser()
 * which only works when a Supabase auth session exists — members who log in via the
 * member login form never get one.
 *
 * This function instead reads the members_session cookie, verifies it, extracts the
 * email, and looks up the profiles row by email using the service-role client.
 * That works for any member whose email appears in both member_profiles and profiles.
 */
export async function requireAdminSession(): Promise<{ email: string }> {
  const cookieStore = await cookies();
  const sc = cookieStore.get(SESSION_COOKIE);
  const session = sc ? await verifyMemberSession(sc.value) : null;
  if (!session) throw new Error('unauthenticated');

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('email', session.email)
    .maybeSingle();

  if (!profile || profile.role !== 'admin') throw new Error('forbidden');
  return { email: session.email };
}
