// lib/images.ts
// ─────────────────────────────────────────────────────────────────────────────
// Central image abstraction layer.
// All reads/writes go through here — swap this file to change the backend.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@/client';

export type ImageContext = 'gallery' | 'history' | 'hero' | 'member_avatar';

export type SiteImage = {
  id: string;
  context: ImageContext;
  storage_path: string;
  public_url: string;
  caption: string | null;
  alt_text: string | null;
  sort_order: number;
  uploaded_at: string;
};

const BUCKET = 'site-images';

// ── Reads ────────────────────────────────────────────────────────────────────

export async function getImagesByContext(context: ImageContext): Promise<SiteImage[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('site_images')
    .select('*')
    .eq('context', context)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ── Writes ───────────────────────────────────────────────────────────────────

export async function uploadImage(
  file: File,
  context: ImageContext,
  caption?: string,
  altText?: string
): Promise<SiteImage> {
  const supabase = createClient();

  // 1. Upload file to storage
  const ext = file.name.split('.').pop();
  const path = `${context}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
  if (uploadError) throw uploadError;

  // 2. Get public URL
  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

  // 3. Get current max sort_order for this context
  const { data: existing } = await supabase
    .from('site_images')
    .select('sort_order')
    .eq('context', context)
    .order('sort_order', { ascending: false })
    .limit(1);
  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  // 4. Insert row
  const { data, error } = await supabase
    .from('site_images')
    .insert({ context, storage_path: path, public_url: publicUrl, caption: caption ?? null, alt_text: altText ?? null, sort_order: nextOrder })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateImageMeta(
  id: string,
  fields: Partial<Pick<SiteImage, 'caption' | 'alt_text'>>
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('site_images').update(fields).eq('id', id);
  if (error) throw error;
}

export async function deleteImage(id: string, storagePath: string): Promise<void> {
  const supabase = createClient();
  await supabase.storage.from(BUCKET).remove([storagePath]);
  const { error } = await supabase.from('site_images').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderImages(orderedIds: string[]): Promise<void> {
  const supabase = createClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from('site_images').update({ sort_order: index }).eq('id', id)
    )
  );
}

export async function getImageByLabel(label: string): Promise<SiteImage | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('site_images')
    .select('*')
    .eq('context', 'hero')
    .eq('alt_text', label)
    .single();
  return data ?? null;
}

export async function getHeroImages(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data } = await supabase
    .from('site_images')
    .select('*')
    .eq('context', 'hero');
  const map: Record<string, string> = {};
  for (const img of data ?? []) {
    if (img.alt_text) map[img.alt_text] = img.public_url;
  }
  return map;
}
