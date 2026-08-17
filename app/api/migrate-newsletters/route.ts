import sharp from 'sharp';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const BUCKET = 'newsletters';

async function fetchPublicFile(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadBuffer(filePath: string, buf: Buffer, mimeType: string): Promise<string> {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(filePath, buf, { contentType: mimeType, upsert: true });
  if (error) throw new Error(`Storage upload failed for ${filePath}: ${error.message}`);
  return supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath).data.publicUrl;
}

async function insertNewsletterRow(row: {
  title: string;
  issueLabel: string;
  issueDate: string;
  sortOrder: number;
  pdfPath: string;
  pdfUrl: string;
  thumbPath: string;
  thumbUrl: string;
  thumbSource: 'auto' | 'custom';
}): Promise<{ skipped: boolean; id?: string }> {
  const { data: existing } = await supabaseAdmin
    .from('newsletters')
    .select('id')
    .eq('thumbnail_storage_path', row.thumbPath)
    .maybeSingle();

  if (existing) return { skipped: true, id: existing.id };

  const { data, error } = await supabaseAdmin.from('newsletters').insert({
    title: row.title,
    issue_label: row.issueLabel,
    issue_date: row.issueDate,
    sort_order: row.sortOrder,
    pdf_storage_path: row.pdfPath,
    pdf_public_url: row.pdfUrl,
    thumbnail_storage_path: row.thumbPath,
    thumbnail_public_url: row.thumbUrl,
    thumbnail_source: row.thumbSource,
  }).select('id').single();

  if (error) throw new Error(`DB insert failed: ${error.message}`);
  return { skipped: false, id: data.id };
}

export async function GET(request: Request) {
  try {
    await requireAdminSession();
  } catch {
    return Response.json({ error: 'Admin session required. Log in as admin first.' }, { status: 401 });
  }

  const origin = new URL(request.url).origin;
  const log: string[] = [];

  try {
    // ── Vol 1: PDF + JPEG thumbnail ───────────────────────────────────────────
    log.push('Fetching Vol 1 files…');
    const [vol1Pdf, vol1Thumb] = await Promise.all([
      fetchPublicFile(`${origin}/newsletters/2026-05-vol1.pdf`),
      fetchPublicFile(`${origin}/newsletters/newsletter-may-2026.jpg`),
    ]);

    log.push('Uploading Vol 1 to storage…');
    const [v1PdfUrl, v1ThumbUrl] = await Promise.all([
      uploadBuffer('pdfs/2026-05-vol1.pdf', vol1Pdf, 'application/pdf'),
      uploadBuffer('thumbnails/2026-05-vol1.jpg', vol1Thumb, 'image/jpeg'),
    ]);

    const v1 = await insertNewsletterRow({
      title: 'On the Green — Vol. 1',
      issueLabel: 'Vol. 1',
      issueDate: '2026-05-09',
      sortOrder: 10,
      pdfPath: 'pdfs/2026-05-vol1.pdf',
      pdfUrl: v1PdfUrl,
      thumbPath: 'thumbnails/2026-05-vol1.jpg',
      thumbUrl: v1ThumbUrl,
      thumbSource: 'custom',
    });
    log.push(`Vol 1 — ${v1.skipped ? `already in DB (id=${v1.id})` : `inserted id=${v1.id}`}`);

    // ── Vol 2: PDF only — generate green placeholder thumbnail ────────────────
    log.push('Fetching Vol 2 PDF…');
    const vol2Pdf = await fetchPublicFile(`${origin}/newsletters/newsletter-vol2-may2026.pdf`);

    log.push('Generating Vol 2 placeholder thumbnail…');
    const vol2PlaceholderBuf = await sharp({
      create: { width: 600, height: 800, channels: 3, background: { r: 27, g: 59, b: 38 } },
    }).jpeg({ quality: 80 }).toBuffer();

    log.push('Uploading Vol 2 to storage…');
    const [v2PdfUrl, v2ThumbUrl] = await Promise.all([
      uploadBuffer('pdfs/2026-05-vol2.pdf', vol2Pdf, 'application/pdf'),
      uploadBuffer('thumbnails/2026-05-vol2-placeholder.jpg', vol2PlaceholderBuf, 'image/jpeg'),
    ]);

    const v2 = await insertNewsletterRow({
      title: 'On the Green — Vol. 2',
      issueLabel: 'Vol. 2',
      issueDate: '2026-05-20',
      sortOrder: 20,
      pdfPath: 'pdfs/2026-05-vol2.pdf',
      pdfUrl: v2PdfUrl,
      thumbPath: 'thumbnails/2026-05-vol2-placeholder.jpg',
      thumbUrl: v2ThumbUrl,
      thumbSource: 'custom',
    });
    log.push(`Vol 2 — ${v2.skipped ? `already in DB (id=${v2.id})` : `inserted id=${v2.id}`}`);

    // ── Vol 3: image only — no PDF ────────────────────────────────────────────
    log.push('Fetching Vol 3 image…');
    const vol3Thumb = await fetchPublicFile(`${origin}/newsletters/newsletter-vol3.jpg`);

    log.push('Uploading Vol 3 to storage…');
    const v3ThumbUrl = await uploadBuffer('thumbnails/2026-05-vol3.jpg', vol3Thumb, 'image/jpeg');

    const v3 = await insertNewsletterRow({
      title: 'On the Green — Vol. 3',
      issueLabel: 'Vol. 3',
      issueDate: '2026-05-30',
      sortOrder: 30,
      pdfPath: 'thumbnails/2026-05-vol3.jpg',   // image-only; reuse thumb path
      pdfUrl: v3ThumbUrl,
      thumbPath: 'thumbnails/2026-05-vol3.jpg',
      thumbUrl: v3ThumbUrl,
      thumbSource: 'custom',
    });
    log.push(`Vol 3 — ${v3.skipped ? `already in DB (id=${v3.id})` : `inserted id=${v3.id}`}`);

    log.push('Migration complete.');
    return Response.json({ ok: true, log });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.push(`ERROR: ${msg}`);
    return Response.json({ ok: false, log, error: msg }, { status: 500 });
  }
}
