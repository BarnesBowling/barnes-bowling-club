'use server';

import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function getUploadUrls(title: string): Promise<{
  pdfPath: string;
  pdfSignedUrl: string;
  thumbPath: string;
  thumbSignedUrl: string;
  error?: string;
}> {
  try {
    await requireAdminSession();
    const ts = Date.now();
    const slug = slugify(title) || 'newsletter';
    const pdfPath = `pdfs/${ts}-${slug}.pdf`;
    const thumbPath = `thumbnails/${ts}-${slug}.jpg`;

    const [pdfRes, thumbRes] = await Promise.all([
      supabaseAdmin.storage.from('newsletters').createSignedUploadUrl(pdfPath),
      supabaseAdmin.storage.from('newsletters').createSignedUploadUrl(thumbPath),
    ]);

    if (pdfRes.error) return { pdfPath: '', pdfSignedUrl: '', thumbPath: '', thumbSignedUrl: '', error: pdfRes.error.message };
    if (thumbRes.error) return { pdfPath: '', pdfSignedUrl: '', thumbPath: '', thumbSignedUrl: '', error: thumbRes.error.message };

    return {
      pdfPath,
      pdfSignedUrl: pdfRes.data.signedUrl,
      thumbPath,
      thumbSignedUrl: thumbRes.data.signedUrl,
    };
  } catch (e) {
    return { pdfPath: '', pdfSignedUrl: '', thumbPath: '', thumbSignedUrl: '', error: e instanceof Error ? e.message : 'Failed' };
  }
}

export async function createNewsletter(data: {
  title: string;
  issueDate: string;
  issueLabel: string;
  pdfPath: string;
  thumbPath: string;
  thumbnailSource: 'auto' | 'custom';
  sortOrder: number;
}): Promise<{ error?: string }> {
  try {
    await requireAdminSession();

    const pdfUrl = supabaseAdmin.storage.from('newsletters').getPublicUrl(data.pdfPath).data.publicUrl;
    const thumbUrl = supabaseAdmin.storage.from('newsletters').getPublicUrl(data.thumbPath).data.publicUrl;

    const { error } = await supabaseAdmin.from('newsletters').insert({
      title: data.title,
      issue_date: data.issueDate,
      issue_label: data.issueLabel,
      pdf_storage_path: data.pdfPath,
      pdf_public_url: pdfUrl,
      thumbnail_storage_path: data.thumbPath,
      thumbnail_public_url: thumbUrl,
      thumbnail_source: data.thumbnailSource,
      sort_order: data.sortOrder,
    });

    if (error) return { error: error.message };
    revalidatePath('/admin/newsletters');
    revalidatePath('/newsletter');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to save newsletter' };
  }
}

export async function deleteNewsletter(id: string, pdfPath: string, thumbPath: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession();

    // Delete storage files first (fire-and-forget errors — row delete is the important one)
    await Promise.all([
      supabaseAdmin.storage.from('newsletters').remove([pdfPath]),
      supabaseAdmin.storage.from('newsletters').remove([thumbPath]),
    ]);

    const { error } = await supabaseAdmin.from('newsletters').delete().eq('id', id);
    if (error) return { error: error.message };

    revalidatePath('/admin/newsletters');
    revalidatePath('/newsletter');
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to delete newsletter' };
  }
}
