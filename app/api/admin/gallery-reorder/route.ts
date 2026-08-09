import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { requireAdminSession } from '@/lib/adminAuth';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderedIds } = await request.json() as { orderedIds: string[] };
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json({ error: 'orderedIds must be a non-empty array' }, { status: 400 });
    }

    await Promise.all(
      orderedIds.map((id, index) =>
        supabaseAdmin.from('site_images').update({ sort_order: index }).eq('id', id)
      )
    );

    revalidatePath('/gallery');
    return NextResponse.json({ saved: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
