import { NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try { await requireAdminSession(); } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let fd: FormData;
  try { fd = await req.formData(); } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  const id = String(fd.get('id') ?? '').trim();
  const photo = fd.get('photo');

  if (!id || !(photo instanceof File) || photo.size === 0) {
    return Response.json({ error: 'Missing id or photo' }, { status: 400 });
  }

  const buffer = await photo.arrayBuffer();
  const path = `${id}.jpg`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('member-photos')
    .upload(path, buffer, { contentType: 'image/jpeg', upsert: true });

  if (uploadError) {
    console.error('Member photo upload error:', uploadError);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }

  const { error: dbError } = await supabaseAdmin
    .from('club_members')
    .update({ photo_id_filename: path, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (dbError) {
    console.error('Member photo DB update error:', dbError);
    return Response.json({ error: 'Failed to save photo path' }, { status: 500 });
  }

  const { data: signed } = await supabaseAdmin.storage
    .from('member-photos')
    .createSignedUrl(path, 3600);

  return Response.json({ ok: true, signedUrl: signed?.signedUrl ?? null, path });
}
