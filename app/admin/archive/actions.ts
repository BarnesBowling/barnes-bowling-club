'use server';

import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

function revalidateAll() {
  revalidatePath('/admin/archive');
  revalidatePath('/members/archive/presidents');
  revalidatePath('/members/archive/captains');
}

export async function updateArchiveRole(
  id: string,
  name: string,
  note: string,
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const { error } = await supabaseAdmin
      .from('archive_roles')
      .update({ name: name.trim() || 'TBD', note: note.trim() || null, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return { error: error.message };
    revalidateAll();
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Save failed' };
  }
}

export async function addArchiveRole(
  role_type: 'president' | 'captain',
  year: number,
  name: string,
  note: string,
): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    const { error } = await supabaseAdmin.from('archive_roles').insert({
      role_type,
      year,
      name: name.trim() || 'TBD',
      note: note.trim() || null,
    });
    if (error) return { error: error.message };
    revalidateAll();
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Add failed' };
  }
}
