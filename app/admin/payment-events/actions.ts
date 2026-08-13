'use server';

import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function createEvent(data: {
  name: string; amount: number | null; is_tbc: boolean; sort_order: number;
}): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const { error } = await supabaseAdmin.from('payment_events').insert({
      name: data.name,
      amount: data.is_tbc ? null : data.amount,
      is_tbc: data.is_tbc,
      sort_order: data.sort_order,
      active: true,
    });
    if (error) return { error: error.message };
    revalidatePath('/admin/payment-events');
    revalidatePath('/members/payment');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to create event' };
  }
}

export async function updateEvent(
  id: string,
  data: { name: string; amount: number | null; is_tbc: boolean; sort_order: number; active: boolean },
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const { error } = await supabaseAdmin.from('payment_events').update({
      name: data.name,
      amount: data.is_tbc ? null : data.amount,
      is_tbc: data.is_tbc,
      sort_order: data.sort_order,
      active: data.active,
    }).eq('id', id);
    if (error) return { error: error.message };
    revalidatePath('/admin/payment-events');
    revalidatePath('/members/payment');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to update event' };
  }
}

export async function deleteEvent(id: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const { error } = await supabaseAdmin.from('payment_events').delete().eq('id', id);
    if (error) return { error: error.message };
    revalidatePath('/admin/payment-events');
    revalidatePath('/members/payment');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to delete event' };
  }
}
