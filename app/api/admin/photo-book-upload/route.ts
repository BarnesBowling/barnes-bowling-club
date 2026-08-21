import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';

async function ensurePhotoBooksBucket(): Promise<void> {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const exists = (buckets ?? []).some(b => b.name === 'photo-books');
  if (!exists) {
    await supabaseAdmin.storage.createBucket('photo-books', { public: true });
  }
}

// Returns a short-lived signed upload URL. The browser then PUTs the file
// directly to Supabase storage — the file never passes through this function.
export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { bookId, filename } = await request.json() as { bookId?: string; filename?: string };

    if (!bookId || !filename) {
      return NextResponse.json({ error: 'Missing bookId or filename' }, { status: 400 });
    }

    await ensurePhotoBooksBucket();

    const ext = String(filename).split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${bookId}/${Date.now()}.${ext}`;

    const { data, error } = await supabaseAdmin.storage
      .from('photo-books')
      .createSignedUploadUrl(path);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: error?.message ?? 'Failed to create signed upload URL' },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('photo-books')
      .getPublicUrl(path);

    return NextResponse.json({ signedUrl: data.signedUrl, publicUrl });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unexpected error' },
      { status: 500 }
    );
  }
}
