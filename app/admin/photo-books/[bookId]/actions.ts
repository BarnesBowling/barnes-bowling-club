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

  const { data: last } = await supabaseAdmin
    .from('photo_book_pages')
    .select('sort_order')
    .eq('book_id', bookId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (last?.sort_order ?? -1) + 1;
  const photos = caption
    ? [{ src: url, caption }]
    : [{ src: url }];

  const { error } = await supabaseAdmin.from('photo_book_pages').insert({
    book_id: bookId,
    sort_order: nextOrder,
    layout: 'single',
    photos,
  });

  if (error) return { error: error.message };
  revalidatePath(`/admin/photo-books/${bookId}`);
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

  // Up: nearest page with lower sort_order (descending, take first)
  // Down: nearest page with higher sort_order (ascending, take first)
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
