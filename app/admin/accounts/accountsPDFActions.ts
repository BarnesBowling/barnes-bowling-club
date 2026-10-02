'use server';

import { requireViewerSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export type AccountsLedgerRow = {
  id: string;
  member_id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'debit' | 'credit';
  notes: string | null;
  metadata: Record<string, unknown> | null;
  club_members: { full_name: string; membership_number: string | null } | null;
};

export async function fetchAccountsLedger(): Promise<AccountsLedgerRow[]> {
  await requireViewerSession();

  const { data, error } = await supabaseAdmin
    .from('member_ledger')
    .select('*, club_members(full_name, membership_number)')
    .order('date', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map(r => ({
    id:          r.id,
    member_id:   r.member_id,
    date:        r.date,
    description: r.description,
    category:    r.category,
    amount:      Number(r.amount),
    type:        r.type as 'debit' | 'credit',
    notes:       (r.notes ?? null) as string | null,
    metadata:    r.metadata as Record<string, unknown> | null,
    club_members: (Array.isArray(r.club_members)
      ? (r.club_members[0] ?? null)
      : r.club_members) as { full_name: string; membership_number: string | null } | null,
  }));
}
