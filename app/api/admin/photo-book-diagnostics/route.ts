import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bookId = request.nextUrl.searchParams.get('bookId') ?? 'book-2026';

  // 1. DB rows for this book
  const { data: dbRows, error: dbErr } = await supabaseAdmin
    .from('photo_book_pages')
    .select('id, sort_order, layout, photos')
    .eq('book_id', bookId)
    .order('sort_order');

  // 2. All files in storage for this book's prefix
  const { data: storageFiles, error: storageErr } = await supabaseAdmin.storage
    .from('photo-books')
    .list(bookId, { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });

  // 3. Find orphaned storage files (no matching DB row)
  const dbUrls = new Set(
    (dbRows ?? []).flatMap(row => {
      const photos = Array.isArray(row.photos) ? row.photos as { src: string }[] : [];
      return photos.map(p => p.src);
    })
  );

  const { data: { publicUrl: baseUrl } } = supabaseAdmin.storage
    .from('photo-books')
    .getPublicUrl(`${bookId}/placeholder`);
  const urlPrefix = baseUrl.replace('/placeholder', '/');

  const orphaned = (storageFiles ?? []).filter(f => {
    const fileUrl = `${urlPrefix}${f.name}`;
    return !dbUrls.has(fileUrl);
  });

  return NextResponse.json({
    bookId,
    db: {
      error: dbErr?.message ?? null,
      rowCount: dbRows?.length ?? 0,
      rows: (dbRows ?? []).map(r => ({
        id: r.id,
        sort_order: r.sort_order,
        layout: r.layout,
        src: (r.photos as { src: string }[])?.[0]?.src ?? null,
      })),
    },
    storage: {
      error: storageErr?.message ?? null,
      fileCount: storageFiles?.length ?? 0,
      files: (storageFiles ?? []).map(f => ({
        name: f.name,
        size: f.metadata?.size ?? null,
        createdAt: f.created_at,
        url: `${urlPrefix}${f.name}`,
      })),
    },
    orphanedStorageFiles: orphaned.map(f => ({
      name: f.name,
      size: f.metadata?.size ?? null,
      createdAt: f.created_at,
      url: `${urlPrefix}${f.name}`,
    })),
  });
}
