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
  member_email?: string;
}): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: 'Admin access required.' };

  const { count } = await supabaseAdmin
    .from('fixture_bookings')
    .select('id', { count: 'exact', head: true })
    .eq('date', input.date);

  if ((count ?? 0) >= 3) {
    return { success: false, error: 'A maximum of 3 matches can be booked per day. Please choose a different date.' };
  }

  const { data, error } = await supabaseAdmin
    .from('fixture_bookings')
    .insert({
      member_email: input.member_email ?? 'admin-booking@barnesbowlingclub.org',
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

export async function createGreenBookingAsAdmin(input: {
  organisation_name: string;
  booked_by: string;
  date: string;
  start_time: string;
  end_time: string;
  notes: string | null;
}): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: 'Admin access required.' };

  if (input.start_time >= input.end_time) {
    return { success: false, error: 'End time must be after start time.' };
  }

  // Check for fixture bookings whose time_slot falls within the new window
  const { data: clashingFixtures } = await supabaseAdmin
    .from('fixture_bookings')
    .select('id, time_slot')
    .eq('date', input.date)
    .gte('time_slot', input.start_time)
    .lt('time_slot', input.end_time);

  if (clashingFixtures && clashingFixtures.length > 0) {
    return { success: false, error: `A match is already booked at ${clashingFixtures[0].time_slot} — resolve that booking first.` };
  }

  // Check for overlapping green bookings (interval overlap: new_start < existing_end && new_end > existing_start)
  const { data: clashingGreen } = await supabaseAdmin
    .from('green_bookings')
    .select('id, organisation_name, start_time, end_time')
    .eq('date', input.date)
    .lt('start_time', input.end_time)
    .gt('end_time', input.start_time);

  if (clashingGreen && clashingGreen.length > 0) {
    const c = clashingGreen[0];
    return { success: false, error: `Overlaps with existing booking for ${c.organisation_name} (${c.start_time}–${c.end_time}).` };
  }

  const { data, error } = await supabaseAdmin
    .from('green_bookings')
    .insert({
      organisation_name: input.organisation_name,
      booked_by: input.booked_by,
      date: input.date,
      start_time: input.start_time,
      end_time: input.end_time,
      notes: input.notes,
      created_by_email: admin.email,
    })
    .select('id')
    .single();

  if (error) {
    return { success: false, error: `Could not save booking: ${error.message}` };
  }

  revalidatePath('/admin/book-a-game');
  revalidatePath('/members/book-a-game');
  revalidatePath('/members/calendar');
  return { success: true, id: data.id };
}
