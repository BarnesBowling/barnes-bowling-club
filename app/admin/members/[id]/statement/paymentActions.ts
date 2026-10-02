'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';

export type PaymentRow = {
  id: string;
  member_id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'debit' | 'credit';
  metadata: Record<string, unknown> | null;
  club_members: null;
};

export async function recordPayment(
  memberId: string,
  data: { amount: number; method: string; date: string; notes?: string },
): Promise<{ ok: boolean; error?: string; row?: PaymentRow }> {
  const session = await requireAdminSession();

  if (!memberId)                                            return { ok: false, error: 'Member ID is required.' };
  if (!Number.isFinite(data.amount) || data.amount <= 0)  return { ok: false, error: 'Amount must be a positive number.' };
  if (!data.date)                                          return { ok: false, error: 'Date is required.' };

  const { data: row, error } = await supabaseAdmin
    .from('member_ledger')
    .insert({
      member_id:   memberId,
      description: `Payment received – ${data.method}`,
      category:    'payment',
      amount:      data.amount,
      type:        'credit',
      date:        data.date,
      notes:       data.notes || null,
      metadata:    { method: data.method },
      created_by:  session.email,
    })
    .select('id, member_id, date, description, category, amount, type, metadata')
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/members/${memberId}/statement`);
  revalidatePath('/admin/accounts');

  return {
    ok: true,
    row: {
      id:           row.id,
      member_id:    row.member_id,
      date:         row.date,
      description:  row.description,
      category:     row.category,
      amount:       Number(row.amount),
      type:         'credit',
      metadata:     row.metadata as Record<string, unknown> | null,
      club_members: null,
    },
  };
}
