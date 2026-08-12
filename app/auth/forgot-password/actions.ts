'use server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';

type ActionResult = { sent?: boolean; error?: string; noPassword?: boolean } | null;

export async function sendPasswordReset(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const identifier = String(formData.get('identifier') ?? '').trim();
  if (!identifier) return { error: 'Please enter your email address or membership number.' };

  try {
    let email = identifier.toLowerCase();

    // If no @ symbol, treat as membership number and resolve to email
    if (!identifier.includes('@')) {
      const { data: memberByNumber } = await supabaseAdmin
        .from('club_members')
        .select('email')
        .ilike('membership_number', identifier.toUpperCase())
        .maybeSingle();

      if (!memberByNumber?.email) {
        // Don't reveal whether the membership number exists
        return { sent: true };
      }
      email = memberByNumber.email.toLowerCase();
    }

    const { data: member } = await supabaseAdmin
      .from('club_members')
      .select('auth_user_id, membership_number, password_set')
      .eq('email', email)
      .maybeSingle();

    if (member && !member.password_set) {
      return { noPassword: true };
    }

    if (member?.auth_user_id && member.password_set) {
      // Sync first_name + membership_number into auth user metadata for the email template.
      const { data: profile } = await supabaseAdmin
        .from('member_profiles')
        .select('first_name')
        .eq('member_email', email)
        .maybeSingle();

      const firstName        = profile?.first_name ?? null;
      const membershipNumber = member.membership_number ?? null;
      if (firstName || membershipNumber) {
        await supabaseAdmin.auth.admin.updateUserById(member.auth_user_id, {
          user_metadata: {
            ...(firstName        ? { first_name: firstName }               : {}),
            ...(membershipNumber ? { membership_number: membershipNumber } : {}),
          },
        });
      }

      // Use flowType: 'implicit' so Supabase sends a token_hash link rather than a
      // PKCE code. PKCE codes require the code verifier cookie to be present in the
      // same browser — they break when the member opens the reset link on a different
      // device. The callback handles token_hash via verifyOtp which works anywhere.
      const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { flowType: 'implicit', persistSession: false } },
      );
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback`,
      });
    }
  } catch (err) {
    console.error('[forgot-password] sendPasswordReset error:', err);
  }

  // Always return success — never reveal whether the email/number is registered.
  return { sent: true };
}
