'use server';

import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function updateLedgerEntry(
  id: string,
  memberId: string,
  data: {
    date: string;
    description: string;
    category: string;
    amount: number;
    type: 'debit' | 'credit';
    num_guests: number | null;
    cost_per_guest: number | null;
    guest_names: string | null;
  },
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();

    const { count, error } = await supabaseAdmin
      .from('member_ledger')
      .update(
        {
          date:           data.date,
          description:    data.description,
          category:       data.category,
          amount:         data.amount,
          type:           data.type,
          num_guests:     data.num_guests,
          cost_per_guest: data.cost_per_guest,
          guest_names:    data.guest_names,
        },
        { count: 'exact' },
      )
      .eq('id', id);

    if (error) return { error: error.message };
    if (count === 0) return { error: 'Entry not found — it may have already been deleted.' };

    revalidatePath(`/admin/members/${memberId}/statement`);
    revalidatePath('/admin/accounts');
    revalidatePath('/admin/statements');
    revalidatePath('/members/account');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Update failed' };
  }
}

export async function deleteLedgerEntry(
  id: string,
  memberId: string,
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();

    const { count, error } = await supabaseAdmin
      .from('member_ledger')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) return { error: error.message };
    if (count === 0) return { error: 'Entry not found — it may have already been deleted.' };

    revalidatePath(`/admin/members/${memberId}/statement`);
    revalidatePath('/admin/accounts');
    revalidatePath('/admin/statements');
    revalidatePath('/members/account');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Delete failed' };
  }
}
