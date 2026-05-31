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
    const { id, storagePath } = await request.json();
    if (!id || !storagePath) {
      return NextResponse.json({ error: 'Missing id or storagePath' }, { status: 400 });
    }

    await supabaseAdmin.storage.from('site-images').remove([storagePath]);

    const { error } = await supabaseAdmin.from('site_images').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ deleted: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
