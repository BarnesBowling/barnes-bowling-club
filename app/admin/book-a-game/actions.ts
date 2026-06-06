'use server';

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { verifyMemberSession, SESSION_COOKIE } from '@/lib/memberSession';

async function getSession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie) return null;
  return verifyMemberSession(cookie.value);
}

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('email', session.email)
    .maybeSingle();
  return profile?.role === 'admin' ? session : null;
}

export async function createFixtureBookingAsAdmin(input: {
  competition: string;
  player1: string;
  player2: string;
  player3: string | null;
  player4: string | null;
  date: string;
  time_slot: string;
  member_email: string;
}): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: 'Admin access required.' };

  const { count } = await supabaseAdmin
    .from('fixture_bookings')
    .select('id', { count: 'exact', head: true })
    .eq('date', input.date);

  if ((count ?? 0) >= 2) {
    return { success: false, error: 'A maximum of 2 matches can be booked per day. Please choose a different date.' };
  }

  const { data, error } = await supabaseAdmin
    .from('fixture_bookings')
    .insert({
      member_email: input.member_email,
      competition: input.competition,
      player1: input.player1,
      player2: input.player2,
      player3: input.player3,
      player4: input.player4,
      date: input.date,
      time_slot: input.time_slot,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'That time slot was just taken. Please choose another.' };
    }
    return { success: false, error: `Could not save booking: ${error.message}` };
  }

  revalidatePath('/members/calendar');
  revalidatePath('/members/book-a-game');
  revalidatePath('/admin/book-a-game');
  return { success: true, id: data.id };
}
