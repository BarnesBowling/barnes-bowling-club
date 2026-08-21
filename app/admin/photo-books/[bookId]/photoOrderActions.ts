'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function movePhotoWithinPage(
  pageId: string,
  fromIndex: number,
  toIndex: number
): Promise<{ error?: string }> {
  await requireAdminSession();

  if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex)) {
    return { error: 'Invalid photo position' };
  }

  const { data: page, error: fetchError } = await supabaseAdmin
    .from('photo_book_pages')
    .select('photos, book_id')
    .eq('id', pageId)
    .single();

  if (fetchError || !page) return { error: fetchError?.message ?? 'Page not found' };

  const photos = Array.isArray(page.photos)
    ? [...page.photos as Record<string, unknown>[]]
    : [];

  if (
    fromIndex < 0 ||
    fromIndex >= photos.length ||
    toIndex < 0 ||
    toIndex >= photos.length
  ) {
    return { error: 'Photo position is out of range' };
  }

  if (fromIndex === toIndex) return {};

  const [moved] = photos.splice(fromIndex, 1);
  photos.splice(toIndex, 0, moved);

  const { error } = await supabaseAdmin
    .from('photo_book_pages')
    .update({ photos })
    .eq('id', pageId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/photo-books/${page.book_id}`);
  revalidatePath('/members/archive/years-in-photos');
  return {};
}
