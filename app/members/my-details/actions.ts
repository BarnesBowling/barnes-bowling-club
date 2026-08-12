'use server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyMemberSession, createMemberSession, SESSION_COOKIE, SESSION_MAX_AGE } from '@/lib/memberSession';

type ActionResult = { error?: string; success?: boolean } | null;

async function getSessionEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie) return null;
  const session = await verifyMemberSession(cookie.value);
  return session?.email ?? null;
}

export async function saveName(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = await getSessionEmail();
  if (!email) return { error: 'Not authenticated.' };

  const title      = String(formData.get('title')      ?? '').trim();
  const first_name = String(formData.get('first_name') ?? '').trim();
  const last_name  = String(formData.get('last_name')  ?? '').trim();

  if (!first_name || !last_name) return { error: 'First and last name are required.' };

  const { error } = await supabaseAdmin.from('member_profiles').upsert({
    member_email: email,
    title,
    first_name,
    last_name,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'member_email' });

  if (error) return { error: error.message };
  return { success: true };
}

export async function saveMobile(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = await getSessionEmail();
  if (!email) return { error: 'Not authenticated.' };

  const mobile = String(formData.get('mobile') ?? '').trim();

  const { error } = await supabaseAdmin.from('member_profiles').upsert({
    member_email: email,
    mobile,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'member_email' });

  if (error) return { error: error.message };

  const { error: syncErr } = await supabaseAdmin
    .from('club_members')
    .update({ phone: mobile || null })
    .eq('email', email);
  if (syncErr) console.error('[my-details] club_members mobile sync failed:', syncErr.message);

  return { success: true };
}

export async function saveAddress(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = await getSessionEmail();
  if (!email) return { error: 'Not authenticated.' };

  const address_line1 = String(formData.get('address_line1') ?? '').trim();
  const address_line2 = String(formData.get('address_line2') ?? '').trim();
  const city          = String(formData.get('city')          ?? '').trim();
  const postcode      = String(formData.get('postcode')      ?? '').trim();

  const { error } = await supabaseAdmin.from('member_profiles').upsert({
    member_email: email,
    address_line1,
    address_line2,
    city,
    postcode,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'member_email' });

  if (error) return { error: error.message };

  const { error: syncErr } = await supabaseAdmin
    .from('club_members')
    .update({
      address_line1: address_line1 || null,
      address_line2: address_line2 || null,
      city:          city          || null,
      postcode:      postcode      || null,
    })
    .eq('email', email);
  if (syncErr) console.error('[my-details] club_members address sync failed:', syncErr.message);

  return { success: true };
}

export async function savePersonalDetails(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = await getSessionEmail();
  if (!email) return { error: 'Not authenticated.' };

  const mobile = String(formData.get('mobile') ?? '');

  const { error } = await supabaseAdmin.from('member_profiles').upsert({
    member_email:  email,
    title:         String(formData.get('title')         ?? ''),
    first_name:    String(formData.get('first_name')    ?? ''),
    last_name:     String(formData.get('last_name')     ?? ''),
    mobile,
    address_line1: String(formData.get('address_line1') ?? ''),
    address_line2: String(formData.get('address_line2') ?? ''),
    city:          String(formData.get('city')          ?? ''),
    postcode:      String(formData.get('postcode')      ?? ''),
    updated_at:    new Date().toISOString(),
  }, { onConflict: 'member_email' });

  if (error) return { error: error.message };

  // Sync phone + address to club_members roster
  const { error: syncErr } = await supabaseAdmin
    .from('club_members')
    .update({
      phone:         mobile.trim()                                        || null,
      address_line1: String(formData.get('address_line1') ?? '').trim()  || null,
      address_line2: String(formData.get('address_line2') ?? '').trim()  || null,
      city:          String(formData.get('city')          ?? '').trim()  || null,
      postcode:      String(formData.get('postcode')      ?? '').trim()  || null,
    })
    .eq('email', email);
  if (syncErr) console.error('[my-details] club_members sync failed:', syncErr.message);

  return { success: true };
}

export async function saveEmail(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie) return { error: 'Not authenticated.' };
  const session = await verifyMemberSession(cookie.value);
  if (!session) return { error: 'Not authenticated.' };
  const currentEmail = session.email;

  const newEmail = String(formData.get('email') ?? '').trim().toLowerCase();
  if (!newEmail) return { error: 'Email address is required.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) return { error: 'Please enter a valid email address.' };
  if (newEmail === currentEmail) return { success: true };

  // Check the new email isn't already in use
  const { data: existing } = await supabaseAdmin
    .from('club_members')
    .select('id')
    .eq('email', newEmail)
    .maybeSingle();
  if (existing) return { error: 'That email address is already registered to another member.' };

  // Look up auth_user_id so we can update Supabase Auth
  const { data: memberRow } = await supabaseAdmin
    .from('club_members')
    .select('auth_user_id')
    .eq('email', currentEmail)
    .maybeSingle();

  // Update Supabase Auth user email (if linked)
  if (memberRow?.auth_user_id) {
    const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(
      memberRow.auth_user_id,
      { email: newEmail, email_confirm: true },
    );
    if (authErr) return { error: `Auth update failed: ${authErr.message}` };
  }

  // Update member_profiles (member_email is the PK/conflict key)
  const { error: profileErr } = await supabaseAdmin
    .from('member_profiles')
    .update({ member_email: newEmail, updated_at: new Date().toISOString() })
    .eq('member_email', currentEmail);
  if (profileErr) console.error('[my-details] member_profiles email update failed:', profileErr.message);

  // Update club_members email
  const { error: memberErr } = await supabaseAdmin
    .from('club_members')
    .update({ email: newEmail })
    .eq('email', currentEmail);
  if (memberErr) return { error: memberErr.message };

  // Reissue session cookie with new email
  const newSession = await createMemberSession(newEmail);
  cookieStore.set(SESSION_COOKIE, newSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return { success: true };
}

export async function saveEmergencyContact(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = await getSessionEmail();
  if (!email) return { error: 'Not authenticated.' };

  const ec_name  = String(formData.get('ec_name')  ?? '');
  const ec_phone = String(formData.get('ec_phone') ?? '');

  const { error } = await supabaseAdmin.from('member_profiles').upsert({
    member_email:                   email,
    emergency_contact_name:         ec_name,
    emergency_contact_relationship: String(formData.get('ec_relationship') ?? ''),
    emergency_contact_phone:        ec_phone,
    emergency_contact_email:        String(formData.get('ec_email')        ?? ''),
    updated_at:                     new Date().toISOString(),
  }, { onConflict: 'member_email' });

  if (error) return { error: error.message };

  // Sync emergency contact to club_members roster
  const { error: syncErr } = await supabaseAdmin
    .from('club_members')
    .update({
      emergency_contact_name:  ec_name.trim()  || null,
      emergency_contact_phone: ec_phone.trim() || null,
    })
    .eq('email', email);
  if (syncErr) console.error('[my-details] club_members emergency contact sync failed:', syncErr.message);

  return { success: true };
}

export async function changePassword(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = await getSessionEmail();
  if (!email) return { error: 'Session expired. Please sign in again.' };

  const pwCurrent = String(formData.get('current_password') ?? '');
  const pwNew     = String(formData.get('new_password')     ?? '');

  if (pwNew.length < 8) return { error: 'New password must be at least 8 characters.' };

  // Verify the current password against Supabase Auth (same pattern as login action)
  const authRes = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ email, password: pwCurrent }),
    },
  );
  if (!authRes.ok) return { error: 'Current password is incorrect.' };

  // Look up the auth user ID for this member
  const { data: member } = await supabaseAdmin
    .from('club_members')
    .select('auth_user_id')
    .eq('email', email)
    .maybeSingle();
  if (!member?.auth_user_id) return { error: 'Account not found. Please contact the club.' };

  // Update password via admin API — no browser session required
  const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
    member.auth_user_id,
    { password: pwNew },
  );
  if (updateErr) return { error: updateErr.message };

  return { success: true };
}
