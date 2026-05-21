'use server';

import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

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
