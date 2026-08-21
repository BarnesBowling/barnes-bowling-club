import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';

// Returns a short-lived signed upload URL for the site-images bucket.
// The browser PUTs the file directly to Supabase — no file passes through this function.
export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { context, filename } = await request.json() as { context?: string; filename?: string };
    if (!context || !filename) {
      return NextResponse.json({ error: 'Missing context or filename' }, { status: 400 });
    }

    const ext = String(filename).split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${context}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await supabaseAdmin.storage
      .from('site-images')
      .createSignedUploadUrl(path);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: error?.message ?? 'Failed to create signed upload URL' },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('site-images')
      .getPublicUrl(path);

    return NextResponse.json({ signedUrl: data.signedUrl, path, publicUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unexpected error' },
      { status: 500 }
    );
  }
}
