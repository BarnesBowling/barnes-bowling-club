'use server';

import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

const BUCKET = 'committee';

export async function getPhotoUploadUrl(officerId: string, originalFilename: string): Promise<{
  storagePath: string;
  signedUrl: string;
  error?: string;
}> {
  try {
    await requireAdminSession();
    const ext = originalFilename.split('.').pop()?.toLowerCase() ?? 'jpg';
    const storagePath = `photos/${Date.now()}-${officerId}.${ext}`;
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath);
    if (error) return { storagePath: '', signedUrl: '', error: error.message };
    return { storagePath, signedUrl: data.signedUrl };
  } catch (e) {
    return { storagePath: '', signedUrl: '', error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function saveOfficerPhoto(officerId: string, storagePath: string): Promise<{
  storagePath: string;
  publicUrl: string;
  error?: string;
}> {
  try {
    await requireAdminSession();
    const publicUrl = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
    const { error } = await supabaseAdmin.from('officers').update({
      photo_storage_path: storagePath,
      photo_public_url: publicUrl,
    }).eq('id', officerId);
    if (error) return { storagePath: '', publicUrl: '', error: error.message };
    revalidatePath('/general-committee');
    revalidatePath('/handicap-committee');
    revalidatePath('/admin/committee');
    return { storagePath, publicUrl };
  } catch (e) {
    return { storagePath: '', publicUrl: '', error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function deleteOfficerPhoto(officerId: string, storagePath: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
    await supabaseAdmin.storage.from(BUCKET).remove([storagePath]);
    const { error } = await supabaseAdmin.from('officers').update({
      photo_storage_path: null,
      photo_public_url: null,
    }).eq('id', officerId);
    if (error) return { error: error.message };
    revalidatePath('/general-committee');
    revalidatePath('/handicap-committee');
    revalidatePath('/admin/committee');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed' };
  }
}
