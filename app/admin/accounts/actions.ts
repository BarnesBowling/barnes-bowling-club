'use server';

import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateTransaction(
  id: string,
  data: { date: string; description: string; category: string; amount: number; type: string },
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const { error } = await supabaseAdmin
      .from('member_ledger')
      .update(data)
      .eq('id', id);
    if (error) return { error: error.message };
    revalidatePath('/admin/accounts');
    revalidatePath('/members/account');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Update failed' };
  }
}

export async function deleteTransactionById(id: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const { error } = await supabaseAdmin.from('member_ledger').delete().eq('id', id);
    if (error) return { error: error.message };
    revalidatePath('/admin/accounts');
    revalidatePath('/members/account');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Delete failed' };
  }
}

export async function updateMemberBasics(
  id: string,
  data: { email: string; membership_number: string; status: string },
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const { error } = await supabaseAdmin
      .from('club_members')
      .update({
        email: data.email || null,
        membership_number: data.membership_number || null,
        status: data.status,
      })
      .eq('id', id);
    if (error) return { error: error.message };
    revalidatePath('/admin/accounts');
    revalidatePath('/admin/club-members');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Update failed' };
  }
}

export async function addTransaction(formData: FormData): Promise<void> {
  const adminSession = await requireAdminSession();

  const member_id   = String(formData.get('member_id')).trim();
  const date        = String(formData.get('date')).trim();
  const description = String(formData.get('description')).trim();
  const category    = String(formData.get('category')).trim();
  const rawAmount   = String(formData.get('amount')).trim();
  const type        = String(formData.get('type'));
  const metaRaw     = formData.get('metadata_json');
  const guestNamesRaw = String(formData.get('guest_names') ?? '').trim();

  if (!member_id || !date || !description || !category || !rawAmount) return;

  const amount = parseFloat(rawAmount);
  if (isNaN(amount) || amount <= 0) return;

  let metadata: Record<string, unknown> | null = null;
  if (metaRaw) {
    try { metadata = JSON.parse(String(metaRaw)); } catch { /* ignore */ }
  }

  await supabaseAdmin.from('member_ledger').insert({
    member_id,
    date,
    description,
    category,
    amount,
    type,
    metadata,
    guest_names: guestNamesRaw || null,
    ...(category === 'guest_fee' && metadata ? {
      num_guests:    (metadata.num_guests as number)    ?? null,
      cost_per_guest:(metadata.cost_per_guest as number) ?? null,
    } : {}),
    created_by: adminSession.email,
  });

  revalidatePath('/members/account');
  revalidatePath('/admin/accounts');
}

export async function addAdjustmentTransaction(params: {
  member_id: string;
  amount: number;
  type: 'debit' | 'credit';
  description: string;
  date: string;
}): Promise<{ error?: string; row?: { id: string; member_id: string; date: string; description: string; category: string; amount: number; type: 'debit' | 'credit'; metadata: null; club_members: null } }> {
  try {
    const adminSession = await requireAdminSession();
    const { data, error } = await supabaseAdmin
      .from('member_ledger')
      .insert({
        member_id:   params.member_id,
        date:        params.date,
        description: params.description,
        category:    'miscellaneous',
        amount:      params.amount,
        type:        params.type,
        created_by:  adminSession.email,
      })
      .select('id, member_id, date, description, category, amount, type, metadata')
      .single();
    if (error) return { error: error.message };
    revalidatePath('/admin/accounts');
    revalidatePath('/members/account');
    return { row: { ...data, type: data.type as 'debit' | 'credit', club_members: null } };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to add adjustment' };
  }
}

export async function deleteTransaction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = String(formData.get('id'));
  await supabaseAdmin.from('member_ledger').delete().eq('id', id);
  revalidatePath('/admin/accounts');
  revalidatePath('/members/account');
}
