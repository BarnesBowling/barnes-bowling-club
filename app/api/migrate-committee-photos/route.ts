import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const BUCKET = 'committee';

function mimeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
}

export async function GET(request: Request) {
  try {
    await requireAdminSession();
  } catch {
    return Response.json({ error: 'Admin session required.' }, { status: 401 });
  }

  const origin = new URL(request.url).origin;
  const log: string[] = [];

  try {
    const { data: officers, error: fetchErr } = await supabaseAdmin
      .from('officers')
      .select('id, name, group_name, photo_filename, photo_storage_path')
      .not('photo_filename', 'is', null)
      .is('photo_storage_path', null)
      .order('group_name')
      .order('sort_order');

    if (fetchErr) throw new Error(`DB fetch failed: ${fetchErr.message}`);

    const toMigrate = (officers ?? []).filter(o => o.photo_filename);
    log.push(`Found ${toMigrate.length} officer(s) to migrate.`);

    for (const o of toMigrate) {
      const filename = o.photo_filename!;
      const publicFileUrl = `${origin}/committee/${filename}`;
      log.push(`[${o.name} / ${o.group_name}] Fetching ${publicFileUrl}…`);

      const res = await fetch(publicFileUrl);
      if (!res.ok) {
        log.push(`  ⚠ Skipped — fetch returned ${res.status}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
      const storagePath = `photos/${o.id}.${ext}`;

      log.push(`  Uploading to ${storagePath}…`);
      const { error: upErr } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(storagePath, buf, { contentType: mimeFromFilename(filename), upsert: true });

      if (upErr) {
        log.push(`  ✗ Storage upload failed: ${upErr.message}`);
        continue;
      }

      const publicUrl = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;

      const { error: dbErr } = await supabaseAdmin.from('officers').update({
        photo_storage_path: storagePath,
        photo_public_url: publicUrl,
      }).eq('id', o.id);

      if (dbErr) {
        log.push(`  ✗ DB update failed: ${dbErr.message}`);
        continue;
      }

      log.push(`  ✓ Done — ${publicUrl}`);
    }

    if (toMigrate.length === 0) {
      log.push('Nothing to migrate — all officers with photos already have storage paths set.');
    } else {
      log.push('Migration complete.');
    }

    return Response.json({ ok: true, log });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.push(`ERROR: ${msg}`);
    return Response.json({ ok: false, log, error: msg }, { status: 500 });
  }
}
