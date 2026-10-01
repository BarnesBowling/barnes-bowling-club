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
  const path = `${id}/photo.jpg`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('application-photos')
    .upload(path, buffer, { contentType: 'image/jpeg', upsert: true });

  if (uploadError) {
    console.error('Admin photo upload error:', uploadError);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }

  const { error: dbError } = await supabaseAdmin
    .from('membership_applications')
    .update({ passport_photo: path })
    .eq('id', id);

  if (dbError) {
    console.error('Admin photo DB update error:', dbError);
    return Response.json({ error: 'Failed to save photo path' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
