'use server';

import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function addTransaction(formData: FormData): Promise<void> {
  const adminSession = await requireAdminSession();

  const member_email = String(formData.get('member_email')).trim();
  const date         = String(formData.get('date')).trim();
  const description  = String(formData.get('description')).trim();
  const category     = String(formData.get('category')).trim();
  const rawAmount    = String(formData.get('amount')).trim();
  const type         = String(formData.get('type'));
  const metaRaw      = formData.get('metadata_json');

  if (!member_email || !date || !description || !category || !rawAmount) return;

  const absAmount = parseFloat(rawAmount);
  if (isNaN(absAmount) || absAmount <= 0) return;

  const amount   = type === 'credit' ? -absAmount : absAmount;
  let   metadata: Record<string, unknown> | null = null;

  if (metaRaw) {
    try { metadata = JSON.parse(String(metaRaw)); } catch { /* ignore */ }
  }

  await supabaseAdmin.from('member_transactions').insert({
    member_email,
    date,
    description,
    category,
    amount,
    metadata,
    created_by: adminSession.email,
  });

  revalidatePath('/members/account');
  revalidatePath('/admin/accounts');
}

export async function deleteTransaction(formData: FormData): Promise<void> {
  await requireAdminSession();
  const id = String(formData.get('id'));
  await supabaseAdmin.from('member_transactions').delete().eq('id', id);
  revalidatePath('/admin/accounts');
  revalidatePath('/members/account');
}
