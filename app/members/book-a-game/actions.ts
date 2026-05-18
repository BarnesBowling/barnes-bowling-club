'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyMemberSession, SESSION_COOKIE } from '@/lib/memberSession';

async function getSession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie) return null;
  return verifyMemberSession(cookie.value);
}

export interface FixtureBooking {
  id: string;
  competition: string;
  player1: string;
  player2: string;
  player3: string | null;
  player4: string | null;
  date: string;
  time_slot: string;
  member_email: string;
}

export type RangeBooking = FixtureBooking & { isOwn: boolean };

export async function getBookingsForDate(date: string): Promise<FixtureBooking[]> {
  const { data } = await supabaseAdmin
    .from('fixture_bookings')
    .select('id, competition, player1, player2, player3, player4, date, time_slot, member_email')
    .eq('date', date)
    .order('time_slot');
  return (data ?? []) as FixtureBooking[];
}

export async function getBookingsForRange(startDate: string, endDate: string): Promise<RangeBooking[]> {
  const session = await getSession();
  const { data } = await supabaseAdmin
    .from('fixture_bookings')
    .select('id, competition, player1, player2, player3, player4, date, time_slot, member_email')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')
    .order('time_slot');
  const email = session?.email ?? null;
  return (data ?? []).map(b => ({ ...b, isOwn: b.member_email === email })) as RangeBooking[];
}

export async function getMemberBookings(): Promise<FixtureBooking[]> {
  const session = await getSession();
  if (!session) return [];
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabaseAdmin
    .from('fixture_bookings')
    .select('id, competition, player1, player2, player3, player4, date, time_slot, member_email')
    .eq('member_email', session.email)
    .gte('date', today)
    .order('date')
    .order('time_slot');
  return (data ?? []) as FixtureBooking[];
}

export async function getMyUpcomingBookings(): Promise<FixtureBooking[]> {
  return getMemberBookings();
}

export interface MemberOption {
  email: string;
  name: string;
}

export async function getCurrentMember(): Promise<MemberOption | null> {
  const session = await getSession();
  if (!session) return null;

  // Prefer member_profiles — has structured first/last name if member visited My Details
  const { data: mp } = await supabaseAdmin
    .from('member_profiles')
    .select('first_name, last_name, member_email')
    .eq('member_email', session.email)
    .maybeSingle();

  if (mp) {
    const name = `${mp.first_name ?? ''} ${mp.last_name ?? ''}`.trim();
    if (name) return { email: mp.member_email, name };
  }

  // Fall back to auth user record (set at invitation time)
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const authUser = users.find(u => u.email === session.email);
  const fullName = authUser?.user_metadata?.full_name as string | undefined;

  return { email: session.email, name: fullName || session.email };
}

export async function getMembersList(): Promise<MemberOption[]> {
  // Use auth.admin.listUsers — the authoritative source for all invited members,
  // identical to what the Admin Members page uses. Avoids public.profiles RLS
  // issues and membership_status NULL edge-cases that silently empty the list.
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error) {
    console.error('[getMembersList] auth.admin.listUsers failed:', error);
    return [];
  }

  return (data?.users ?? [])
    .filter(u => !!u.email)
    .map(u => ({
      email: u.email as string,
      name: (u.user_metadata?.full_name as string | undefined) ?? (u.email as string),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getHandicapNames(): Promise<string[]> {
  // The handicaps table is the authoritative list of club members and is
  // publicly readable. Use it for player selectors — it has all 27 members
  // regardless of whether they have auth accounts yet.
  const { data } = await supabaseAdmin
    .from('handicaps')
    .select('name')
    .order('name');
  const seen = new Set<string>();
  return (data ?? [])
    .map(r => r.name as string)
    .filter(n => { if (seen.has(n)) return false; seen.add(n); return true; });
}

export async function createFixtureBooking(input: {
  competition: string;
  player1: string;
  player2: string;
  player3: string | null;
  player4: string | null;
  date: string;
  time_slot: string;
}): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Not authenticated.' };

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
      member_email: session.email,
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
    console.error('[createFixtureBooking] Supabase error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    if (error.code === '23505') {
      return { success: false, error: 'That time slot was just taken. Please choose another.' };
    }
    return { success: false, error: `Could not save booking: ${error.message}` };
  }

  revalidatePath('/members/calendar');
  revalidatePath('/members/book-a-game');
  return { success: true, id: data.id };
}

export async function cancelFixtureBooking(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Not authenticated.' };

  const { error } = await supabaseAdmin
    .from('fixture_bookings')
    .delete()
    .eq('id', id)
    .eq('member_email', session.email);

  if (error) return { success: false, error: 'Failed to cancel booking.' };

  revalidatePath('/members/calendar');
  revalidatePath('/members/book-a-game');
  return { success: true };
}
