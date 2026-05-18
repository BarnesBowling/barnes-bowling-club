'use server';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyMemberSession, SESSION_COOKIE } from '@/lib/memberSession';

type ActionResult = { error?: string; success?: boolean } | null;

async function getSessionEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie) return null;
  const session = await verifyMemberSession(cookie.value);
  return session?.email ?? null;
}

export async function savePersonalDetails(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = await getSessionEmail();
  if (!email) return { error: 'Not authenticated.' };

  const { error } = await supabaseAdmin.from('member_profiles').upsert({
    member_email:  email,
    title:         String(formData.get('title')         ?? ''),
    first_name:    String(formData.get('first_name')    ?? ''),
    last_name:     String(formData.get('last_name')     ?? ''),
    mobile:        String(formData.get('mobile')        ?? ''),
    address_line1: String(formData.get('address_line1') ?? ''),
    address_line2: String(formData.get('address_line2') ?? ''),
    city:          String(formData.get('city')          ?? ''),
    postcode:      String(formData.get('postcode')      ?? ''),
    updated_at:    new Date().toISOString(),
  }, { onConflict: 'member_email' });

  if (error) return { error: error.message };
  return { success: true };
}

export async function saveEmergencyContact(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = await getSessionEmail();
  if (!email) return { error: 'Not authenticated.' };

  const { error } = await supabaseAdmin.from('member_profiles').upsert({
    member_email:                   email,
    emergency_contact_name:         String(formData.get('ec_name')         ?? ''),
    emergency_contact_relationship: String(formData.get('ec_relationship') ?? ''),
    emergency_contact_phone:        String(formData.get('ec_phone')        ?? ''),
    emergency_contact_email:        String(formData.get('ec_email')        ?? ''),
    updated_at:                     new Date().toISOString(),
  }, { onConflict: 'member_email' });

  if (error) return { error: error.message };
  return { success: true };
}
