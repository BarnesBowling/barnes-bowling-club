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
    const { id, fields } = await request.json();
    if (!id || !fields) {
      return NextResponse.json({ error: 'Missing id or fields' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('site_images').update(fields).eq('id', id);
    if (error) throw error;

    return NextResponse.json({ updated: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
