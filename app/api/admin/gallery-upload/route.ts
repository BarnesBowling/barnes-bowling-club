import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const context = String(formData.get('context') ?? 'gallery');
    const altTextRaw = String(formData.get('alt_text') ?? '').trim();
    const altText = altTextRaw || null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${context}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('site-images')
      .upload(path, file);
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('site-images')
      .getPublicUrl(path);

    // Hero/home-page image slots are named by alt_text. Replacing a slot should
    // update that slot rather than creating an ever-growing list of duplicates.
    if (context === 'hero' && altText) {
      const { data: matches, error: matchError } = await supabaseAdmin
        .from('site_images')
        .select('id,storage_path,sort_order')
        .eq('context', 'hero')
        .eq('alt_text', altText)
        .limit(1);
      if (matchError) throw matchError;

      const existing = matches?.[0];
      if (existing) {
        const { data, error } = await supabaseAdmin
          .from('site_images')
          .update({
            storage_path: path,
            public_url: publicUrl,
            caption: null,
            alt_text: altText,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) {
          await supabaseAdmin.storage.from('site-images').remove([path]);
          throw error;
        }

        if (existing.storage_path && existing.storage_path !== path) {
          await supabaseAdmin.storage.from('site-images').remove([existing.storage_path]);
        }

        revalidatePath('/');
        revalidatePath('/club-app');
        revalidatePath('/admin/hero-images');
        return NextResponse.json(data);
      }
    }

    const { data: existingRows } = await supabaseAdmin
      .from('site_images')
      .select('sort_order')
      .eq('context', context)
      .order('sort_order', { ascending: false })
      .limit(1);
    const nextOrder = existingRows && existingRows.length > 0 ? existingRows[0].sort_order + 1 : 0;

    const { data, error } = await supabaseAdmin
      .from('site_images')
      .insert({
        context,
        storage_path: path,
        public_url: publicUrl,
        caption: null,
        alt_text: altText,
        sort_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      await supabaseAdmin.storage.from('site-images').remove([path]);
      throw error;
    }

    revalidatePath('/');
    revalidatePath('/club-app');
    revalidatePath('/admin/hero-images');
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
