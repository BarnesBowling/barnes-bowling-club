import { NextRequest, NextResponse } from 'next/server';
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
    const context = (formData.get('context') as string) ?? 'gallery';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = file.name.split('.').pop();
    const path = `${context}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('site-images')
      .upload(path, file);
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('site-images')
      .getPublicUrl(path);

    const { data: existing } = await supabaseAdmin
      .from('site_images')
      .select('sort_order')
      .eq('context', context)
      .order('sort_order', { ascending: false })
      .limit(1);
    const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

    const { data, error } = await supabaseAdmin
      .from('site_images')
      .insert({
        context,
        storage_path: path,
        public_url: publicUrl,
        caption: null,
        alt_text: null,
        sort_order: nextOrder,
      })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
