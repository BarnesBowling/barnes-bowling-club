'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';

async function ensurePhotoBooksBucket(): Promise<void> {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const exists = (buckets ?? []).some(b => b.name === 'photo-books');
  if (!exists) {
    await supabaseAdmin.storage.createBucket('photo-books', { public: true });
  }
}

async function nextSortOrder(bookId: string): Promise<number> {
  const { data: last } = await supabaseAdmin
    .from('photo_book_pages')
    .select('sort_order')
    .eq('book_id', bookId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (last?.sort_order ?? -1) + 1;
}

export async function uploadPhoto(
  formData: FormData
): Promise<{ url?: string; error?: string }> {
  await requireAdminSession();
  await ensurePhotoBooksBucket();

  const file = formData.get('file') as File | null;
  const bookId = String(formData.get('bookId') ?? '');
  if (!file || !bookId) return { error: 'Missing file or bookId' };

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${bookId}/${Date.now()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabaseAdmin.storage
    .from('photo-books')
    .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };

  const { data } = supabaseAdmin.storage.from('photo-books').getPublicUrl(path);
  return { url: data.publicUrl };
}

export async function addPage(
  bookId: string,
  url: string,
  caption?: string
): Promise<{ error?: string }> {
  await requireAdminSession();

  const photos = caption
    ? [{ src: url, caption }]
    : [{ src: url }];

  const { error } = await supabaseAdmin.from('photo_book_pages').insert({
    book_id: bookId,
    sort_order: await nextSortOrder(bookId),
    layout: 'single',
    photos,
  });

  if (error) return { error: error.message };
  revalidatePath(`/admin/photo-books/${bookId}`);
  revalidatePath('/members/archive/years-in-photos');
  return {};
}

export async function addBlankPage(bookId: string): Promise<{ error?: string }> {
  await requireAdminSession();

  const { error } = await supabaseAdmin.from('photo_book_pages').insert({
    book_id: bookId,
    sort_order: await nextSortOrder(bookId),
    layout: 'single',
    photos: [],
  });

  if (error) return { error: error.message };
  revalidatePath(`/admin/photo-books/${bookId}`);
  revalidatePath('/members/archive/years-in-photos');
  return {};
}

export async function addPhotoToPage(
  pageId: string,
  url: string,
  caption?: string
): Promise<{ error?: string }> {
  await requireAdminSession();

  const { data: page, error: fetchError } = await supabaseAdmin
    .from('photo_book_pages')
    .select('photos, book_id')
    .eq('id', pageId)
    .single();

  if (fetchError || !page) return { error: fetchError?.message ?? 'Page not found' };

  const photos = Array.isArray(page.photos)
    ? [...page.photos as Record<string, unknown>[]]
    : [];

  if (photos.length >= 4) return { error: 'A page can contain up to 4 photos.' };

  photos.push(caption ? { src: url, caption } : { src: url });

  const { error } = await supabaseAdmin
    .from('photo_book_pages')
    .update({ photos })
    .eq('id', pageId);

  if (error) return { error: error.message };
  revalidatePath(`/admin/photo-books/${page.book_id}`);
  revalidatePath('/members/archive/years-in-photos');
  return {};
}

export async function deletePage(pageId: string): Promise<{ error?: string }> {
  await requireAdminSession();

  const { error } = await supabaseAdmin
    .from('photo_book_pages')
    .delete()
    .eq('id', pageId);

  if (error) return { error: error.message };
  revalidatePath('/admin/photo-books');
  revalidatePath('/members/archive/years-in-photos');
  return {};
}

export async function updatePhotoStyle(
  pageId: string,
  photoIndex: number,
  style: { captionFont?: string; captionSize?: string; objectPosition?: string }
): Promise<{ error?: string }> {
  await requireAdminSession();

  const { data: page } = await supabaseAdmin
    .from('photo_book_pages')
    .select('photos, book_id')
    .eq('id', pageId)
    .single();

  if (!page) return { error: 'Page not found' };

  const photos = Array.isArray(page.photos)
    ? [...(page.photos as { src: string; caption?: string; captionFont?: string; captionSize?: string; objectPosition?: string }[])]
    : [];

  if (photoIndex < 0 || photoIndex >= photos.length) return { error: 'Photo not found' };
  photos[photoIndex] = { ...photos[photoIndex], ...style };

  const { error } = await supabaseAdmin
    .from('photo_book_pages')
    .update({ photos })
    .eq('id', pageId);

  if (error) return { error: error.message };
  revalidatePath(`/admin/photo-books/${page.book_id}`);
  revalidatePath('/members/archive/years-in-photos');
  return {};
}

export async function deletePhoto(
  pageId: string,
  photoIndex: number
): Promise<{ error?: string; pageDeleted?: boolean }> {
  await requireAdminSession();

  const { data: page } = await supabaseAdmin
    .from('photo_book_pages')
    .select('photos, book_id')
    .eq('id', pageId)
    .single();

  if (!page) return { error: 'Page not found' };

  const photos = Array.isArray(page.photos)
    ? [...(page.photos as { src: string; caption?: string }[])]
    : [];

  if (photoIndex < 0 || photoIndex >= photos.length) return { error: 'Photo not found' };

  const removedSrc = photos[photoIndex].src;
  photos.splice(photoIndex, 1);

  if (photos.length === 0) {
    const { error } = await supabaseAdmin.from('photo_book_pages').delete().eq('id', pageId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabaseAdmin.from('photo_book_pages').update({ photos }).eq('id', pageId);
    if (error) return { error: error.message };
  }

  const storageMatch = removedSrc.match(/\/storage\/v1\/object\/public\/photo-books\/(.+)$/);
  if (storageMatch) {
    await supabaseAdmin.storage.from('photo-books').remove([storageMatch[1]]).catch(() => {});
  }

  revalidatePath(`/admin/photo-books/${page.book_id}`);
  revalidatePath('/members/archive/years-in-photos');
  return { pageDeleted: photos.length === 0 };
}

export async function reorderPage(
  pageId: string,
  newPosition: number  // 1-based
): Promise<{ error?: string }> {
  await requireAdminSession();

  const { data: page } = await supabaseAdmin
    .from('photo_book_pages')
    .select('id, book_id')
    .eq('id', pageId)
    .single();

  if (!page) return { error: 'Page not found' };

  const { data: allPages } = await supabaseAdmin
    .from('photo_book_pages')
    .select('id')
    .eq('book_id', page.book_id)
    .order('sort_order', { ascending: true });

  if (!allPages || allPages.length === 0) return {};

  const clamped = Math.max(1, Math.min(newPosition, allPages.length));
  const without = allPages.filter(p => p.id !== pageId);
  without.splice(clamped - 1, 0, { id: pageId });

  await Promise.all(
    without.map((p, i) =>
      supabaseAdmin.from('photo_book_pages').update({ sort_order: i }).eq('id', p.id)
    )
  );

  revalidatePath(`/admin/photo-books/${page.book_id}`);
  revalidatePath('/members/archive/years-in-photos');
  return {};
}

export async function movePage(
  pageId: string,
  direction: 'up' | 'down'
): Promise<{ error?: string }> {
  await requireAdminSession();

  const { data: page } = await supabaseAdmin
    .from('photo_book_pages')
    .select('id, book_id, sort_order')
    .eq('id', pageId)
    .single();

  if (!page) return { error: 'Page not found' };

  const neighbourQuery = direction === 'up'
    ? supabaseAdmin.from('photo_book_pages').select('id, sort_order').eq('book_id', page.book_id).lt('sort_order', page.sort_order).order('sort_order', { ascending: false }).limit(1).maybeSingle()
    : supabaseAdmin.from('photo_book_pages').select('id, sort_order').eq('book_id', page.book_id).gt('sort_order', page.sort_order).order('sort_order', { ascending: true }).limit(1).maybeSingle();

  const { data: neighbour } = await neighbourQuery;

  if (!neighbour) return {};

  await Promise.all([
    supabaseAdmin.from('photo_book_pages').update({ sort_order: neighbour.sort_order }).eq('id', page.id),
    supabaseAdmin.from('photo_book_pages').update({ sort_order: page.sort_order }).eq('id', neighbour.id),
  ]);

  revalidatePath(`/admin/photo-books/${page.book_id}`);
  revalidatePath('/members/archive/years-in-photos');
  return {};
}

export async function reorderPages(
  bookId: string,
  pageIds: string[]
): Promise<{ error?: string }> {
  await requireAdminSession();

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from('photo_book_pages')
    .select('id')
    .eq('book_id', bookId);

  if (fetchError) return { error: fetchError.message };

  const existingIds = (existing ?? []).map(page => page.id);
  const uniquePageIds = new Set(pageIds);
  if (
    pageIds.length !== existingIds.length ||
    uniquePageIds.size !== pageIds.length ||
    existingIds.some(id => !uniquePageIds.has(id))
  ) {
    return { error: 'The page list changed. Please refresh and try again.' };
  }

  // Move rows onto temporary unique values first so the UNIQUE(book_id, sort_order)
  // constraint cannot be tripped while pages are being reordered.
  const temporaryResults = await Promise.all(
    pageIds.map((id, index) =>
      supabaseAdmin
        .from('photo_book_pages')
        .update({ sort_order: 100000 + index })
        .eq('id', id)
        .eq('book_id', bookId)
    )
  );

  const temporaryError = temporaryResults.find(result => result.error)?.error;
  if (temporaryError) return { error: temporaryError.message };

  const results = await Promise.all(
    pageIds.map((id, index) =>
      supabaseAdmin
        .from('photo_book_pages')
        .update({ sort_order: index })
        .eq('id', id)
        .eq('book_id', bookId)
    )
  );

  const updateError = results.find(result => result.error)?.error;
  if (updateError) return { error: updateError.message };

  revalidatePath(`/admin/photo-books/${bookId}`);
  revalidatePath('/members/archive/years-in-photos');
  return {};
}

export async function updateCaption(
  pageId: string,
  caption: string
): Promise<{ error?: string }> {
  await requireAdminSession();

  const { data: page } = await supabaseAdmin
    .from('photo_book_pages')
    .select('photos, book_id')
    .eq('id', pageId)
    .single();

  if (!page) return { error: 'Page not found' };

  const photos = Array.isArray(page.photos) ? [...page.photos as { src: string; caption?: string }[]] : [];
  if (photos.length > 0) {
    photos[0] = { ...photos[0], caption };
  }

  const { error } = await supabaseAdmin
    .from('photo_book_pages')
    .update({ photos })
    .eq('id', pageId);

  if (error) return { error: error.message };
  revalidatePath(`/admin/photo-books/${page.book_id}`);
  revalidatePath('/members/archive/years-in-photos');
  return {};
}

export async function addBook(formData: FormData): Promise<void> {
  await requireAdminSession();

  const title = String(formData.get('title') ?? '').trim();
  const spineColour = String(formData.get('spineColour') ?? '#2D5A3D');
  if (!title) return;

  const { data: last } = await supabaseAdmin
    .from('photo_books')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const id = `book-${Date.now()}`;
  await supabaseAdmin.from('photo_books').insert({
    id,
    title,
    spine_colour: spineColour,
    sort_order: (last?.sort_order ?? -1) + 1,
  });

  revalidatePath('/admin/photo-books');
  revalidatePath('/members/archive/years-in-photos');
}

export async function updateBook(
  bookId: string,
  title: string,
  spineColour: string
): Promise<{ error?: string }> {
  await requireAdminSession();

  const { error } = await supabaseAdmin
    .from('photo_books')
    .update({ title, spine_colour: spineColour })
    .eq('id', bookId);

  if (error) return { error: error.message };
  revalidatePath('/admin/photo-books');
  revalidatePath('/members/archive/years-in-photos');
  return {};
}
