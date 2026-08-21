import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';

// Registers an already-uploaded file in the site_images DB table.
// The file was uploaded directly from the browser to Supabase storage via a
// signed URL — this function only handles the DB insert/update logic.
export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { context, altText, path, publicUrl } = await request.json() as {
      context?: string;
      altText?: string;
      path?: string;
      publicUrl?: string;
    };

    if (!context || !path || !publicUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Hero slot: if a row already exists for this alt_text, update it and delete the old file.
    if (context === 'hero' && altText) {
      const { data: matches, error: matchError } = await supabaseAdmin
        .from('site_images')
        .select('id, storage_path, sort_order')
        .eq('context', 'hero')
        .eq('alt_text', altText)
        .limit(1);
      if (matchError) throw matchError;

      const existing = matches?.[0];
      if (existing) {
        const { data, error } = await supabaseAdmin
          .from('site_images')
          .update({ storage_path: path, public_url: publicUrl, caption: null, alt_text: altText })
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

    // Gallery upload or new hero slot: insert a new row.
    const { data: existingRows } = await supabaseAdmin
      .from('site_images')
      .select('sort_order')
      .eq('context', context)
      .order('sort_order', { ascending: false })
      .limit(1);
    const nextOrder = existingRows?.length ? existingRows[0].sort_order + 1 : 0;

    const { data, error } = await supabaseAdmin
      .from('site_images')
      .insert({
        context,
        storage_path: path,
        public_url: publicUrl,
        caption: null,
        alt_text: altText ?? null,
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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
