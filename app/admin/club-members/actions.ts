'use server';

import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

function normalizeUKMobile(raw: string): string | null {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0044')) digits = '0' + digits.slice(4);
  else if (digits.startsWith('44')) digits = '0' + digits.slice(2);
  if (digits.length !== 11 || !digits.startsWith('07')) return null;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

type MemberPayload = {
  full_name: string;
  email: string;
  membership_number: string;
  handicap: number;
  status: string;
  joined_date: string;
  notes: string;
};

export async function addClubMember(data: MemberPayload): Promise<string> {
  await requireAdminSession();
  const { data: inserted, error } = await supabaseAdmin
    .from('club_members')
    .insert({
      full_name: data.full_name.trim(),
      email: data.email.trim() || null,
      membership_number: data.membership_number.trim() || null,
      handicap: data.handicap,
      status: data.status,
      joined_date: data.joined_date || null,
      notes: data.notes.trim() || null,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/admin/club-members');
  revalidatePath('/members/handicaps');
  return inserted.id;
}

export async function updateClubMember(id: string, data: MemberPayload): Promise<void> {
  await requireAdminSession();
  const { error } = await supabaseAdmin
    .from('club_members')
    .update({
      full_name: data.full_name.trim(),
      email: data.email.trim() || null,
      membership_number: data.membership_number.trim() || null,
      handicap: data.handicap,
      status: data.status,
      joined_date: data.joined_date || null,
      notes: data.notes.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/club-members');
  revalidatePath('/members/handicaps');
}

export async function deleteClubMember(id: string): Promise<void> {
  await requireAdminSession();
  const { error } = await supabaseAdmin.from('club_members').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/club-members');
  revalidatePath('/members/handicaps');
}

export async function savePhotoId(id: string, filename: string | null): Promise<void> {
  await requireAdminSession();
  const { error } = await supabaseAdmin
    .from('club_members')
    .update({ photo_id_filename: filename, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/club-members');
}

export async function clearMemberPhoto(id: string): Promise<void> {
  await requireAdminSession();
  const { error } = await supabaseAdmin
    .from('club_members')
    .update({ photo_id_filename: null, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/club-members');
}

export async function checkMemberHasLedger(id: string): Promise<boolean> {
  await requireAdminSession();
  const { count } = await supabaseAdmin
    .from('member_ledger')
    .select('id', { count: 'exact', head: true })
    .eq('member_id', id);
  return (count ?? 0) > 0;
}

export async function updateMemberPhone(id: string, raw: string): Promise<{ error?: string }> {
  await requireAdminSession();
  const trimmed = raw.trim();
  let phone: string | null = null;
  if (trimmed) {
    phone = normalizeUKMobile(trimmed);
    if (!phone) return { error: 'Please enter a valid UK mobile number (e.g. 07957 224527).' };
  }
  const { data: member } = await supabaseAdmin.from('club_members').select('email').eq('id', id).single();
  const { error } = await supabaseAdmin
    .from('club_members')
    .update({ phone: phone ?? null, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };
  if (member?.email) {
    await supabaseAdmin.from('member_profiles')
      .update({ mobile: phone ?? '', updated_at: new Date().toISOString() })
      .eq('member_email', member.email);
  }
  revalidatePath('/admin/club-members');
  return {};
}

export async function toggleMemberKey(id: string, value: boolean): Promise<void> {
  await requireAdminSession();
  const { error } = await supabaseAdmin
    .from('club_members')
    .update({ has_key: value, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/club-members');
}

export async function setMemberCard(id: string, issued: boolean, date: string | null): Promise<void> {
  await requireAdminSession();
  const { error } = await supabaseAdmin
    .from('club_members')
    .update({ card_issued: issued, card_issued_date: date, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/club-members');
}

export async function inviteClubMember(id: string, email: string): Promise<void> {
  await requireAdminSession();

  // Create Supabase auth user and send magic link invite
  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/set-password`,
  });
  if (inviteError) throw new Error(inviteError.message);

  // Link the new auth user to this club_members record
  await supabaseAdmin
    .from('club_members')
    .update({ auth_user_id: inviteData.user.id, updated_at: new Date().toISOString() })
    .eq('id', id);

  revalidatePath('/admin/club-members');
}
