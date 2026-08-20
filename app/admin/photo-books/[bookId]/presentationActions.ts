'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export type CaptionPlacement = 'below' | 'above' | 'overlay-top' | 'overlay-bottom';
export type CaptionFont = 'Libre Baskerville' | 'Playfair Display' | 'DM Sans' | 'Josefin Sans' | 'Optima';
export type PhotoHorizontalPosition = 'left' | 'center' | 'right';
export type PhotoVerticalPosition = 'top' | 'center' | 'bottom';

export interface PhotoPresentationSettings {
  caption: string;
  captionFontSize: number;
  captionColor: string;
  captionPlacement: CaptionPlacement;
  captionFont: CaptionFont;
  photoScale: number;
  photoHorizontal: PhotoHorizontalPosition;
  photoVertical: PhotoVerticalPosition;
}

const LAYOUTS = new Set([
  'single',
  'sf-single',
  'sf-pair',
  'two-photos',
  'grid-2x2',
  'title-hero',
  'grid-left',
  'grid-right',
]);

const CAPTION_PLACEMENTS = new Set<CaptionPlacement>([
  'below',
  'above',
  'overlay-top',
  'overlay-bottom',
]);

const CAPTION_FONTS = new Set<CaptionFont>([
  'Libre Baskerville',
  'Playfair Display',
  'DM Sans',
  'Josefin Sans',
  'Optima',
]);

const PHOTO_HORIZONTAL_POSITIONS = new Set<PhotoHorizontalPosition>([
  'left',
  'center',
  'right',
]);

const PHOTO_VERTICAL_POSITIONS = new Set<PhotoVerticalPosition>([
  'top',
  'center',
  'bottom',
]);

export async function updatePageLayout(
  pageId: string,
  layout: string
): Promise<{ error?: string }> {
  await requireAdminSession();

  if (!LAYOUTS.has(layout)) return { error: 'Invalid page layout' };

  const { data: page } = await supabaseAdmin
    .from('photo_book_pages')
    .select('book_id')
    .eq('id', pageId)
    .single();

  if (!page) return { error: 'Page not found' };

  const { error } = await supabaseAdmin
    .from('photo_book_pages')
    .update({ layout })
    .eq('id', pageId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/photo-books/${page.book_id}`);
  revalidatePath('/members/archive/years-in-photos');
  return {};
}

export async function updatePhotoPresentation(
  pageId: string,
  photoIndex: number,
  settings: PhotoPresentationSettings
): Promise<{ error?: string }> {
  await requireAdminSession();

  const { data: page } = await supabaseAdmin
    .from('photo_book_pages')
    .select('photos, book_id')
    .eq('id', pageId)
    .single();

  if (!page) return { error: 'Page not found' };

  const photos = Array.isArray(page.photos)
    ? [...page.photos as Record<string, unknown>[]]
    : [];

  if (photoIndex < 0 || photoIndex >= photos.length) {
    return { error: 'Photo not found' };
  }

  const fontSize = Math.min(Math.max(Number(settings.captionFontSize) || 11, 8), 30);
  const photoScale = Math.min(Math.max(Number(settings.photoScale) || 100, 40), 100);
  const captionColor = /^#[0-9a-fA-F]{6}$/.test(settings.captionColor)
    ? settings.captionColor
    : '#888888';
  const captionPlacement = CAPTION_PLACEMENTS.has(settings.captionPlacement)
    ? settings.captionPlacement
    : 'below';
  const captionFont = CAPTION_FONTS.has(settings.captionFont)
    ? settings.captionFont
    : 'Libre Baskerville';
  const photoHorizontal = PHOTO_HORIZONTAL_POSITIONS.has(settings.photoHorizontal)
    ? settings.photoHorizontal
    : 'center';
  const photoVertical = PHOTO_VERTICAL_POSITIONS.has(settings.photoVertical)
    ? settings.photoVertical
    : 'center';

  photos[photoIndex] = {
    ...photos[photoIndex],
    caption: settings.caption ?? '',
    captionFontSize: fontSize,
    captionColor,
    captionPlacement,
    captionFont,
    photoScale,
    photoHorizontal,
    photoVertical,
  };

  const { error } = await supabaseAdmin
    .from('photo_book_pages')
    .update({ photos })
    .eq('id', pageId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/photo-books/${page.book_id}`);
  revalidatePath('/members/archive/years-in-photos');
  return {};
}
