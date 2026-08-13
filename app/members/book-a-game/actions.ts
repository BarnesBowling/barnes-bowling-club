'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { verifyMemberSession, SESSION_COOKIE } from '@/lib/memberSession';
import { Resend } from 'resend';

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

export async function getAllUpcomingBookings(): Promise<FixtureBooking[]> {
  const { data } = await supabaseAdmin
    .from('fixture_bookings')
    .select('id, competition, player1, player2, player3, player4, date, time_slot, member_email')
    .order('date')
    .order('time_slot');
  return (data ?? []) as FixtureBooking[];
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

  if ((count ?? 0) >= 3) {
    return { success: false, error: 'A maximum of 3 matches can be booked per day. Please choose a different date.' };
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

  // Fire-and-forget alert email — must not block or fail the booking
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data: cm } = await supabaseAdmin
      .from('club_members')
      .select('full_name')
      .eq('email', session.email)
      .maybeSingle();
    const bookerName = cm?.full_name || session.email;
    const players = [input.player1, input.player2, input.player3, input.player4]
      .filter((p): p is string => !!p);
    const formattedDate = new Date(input.date + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    resend.emails.send({
      from:    'Barnes Bowling Club <noreply@barnesbowlingclub.com>',
      to:      'info@barnesbowling.club',
      subject: `New booking — ${input.competition} — ${formattedDate}`,
      html: `
        <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1a3a2a">
          <div style="background:#1a3a2a;padding:28px 32px">
            <h1 style="margin:0;font-size:20px;color:#f5f0e8;letter-spacing:.02em">Barnes Bowling Club</h1>
            <p style="margin:6px 0 0;font-size:12px;color:rgba(245,240,232,.6);font-family:Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase">Match Booking</p>
          </div>
          <div style="padding:32px">
            <h2 style="font-size:20px;font-weight:500;margin:0 0 20px;color:#1a3a2a">New booking made by ${bookerName}</h2>
            <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px">
              <tr style="border-bottom:1px solid #e8e4dc">
                <td style="padding:10px 0;color:#6b7280;font-family:Arial,sans-serif;width:40%">Competition</td>
                <td style="padding:10px 0;color:#1a3a2a;font-weight:600">${input.competition}</td>
              </tr>
              <tr style="border-bottom:1px solid #e8e4dc">
                <td style="padding:10px 0;color:#6b7280;font-family:Arial,sans-serif">Date</td>
                <td style="padding:10px 0;color:#1a3a2a">${formattedDate}</td>
              </tr>
              <tr style="border-bottom:1px solid #e8e4dc">
                <td style="padding:10px 0;color:#6b7280;font-family:Arial,sans-serif">Time</td>
                <td style="padding:10px 0;color:#1a3a2a">${input.time_slot}</td>
              </tr>
              <tr style="border-bottom:1px solid #e8e4dc">
                <td style="padding:10px 0;color:#6b7280;font-family:Arial,sans-serif">Players</td>
                <td style="padding:10px 0;color:#1a3a2a">${players.join(', ')}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#6b7280;font-family:Arial,sans-serif">Booked by</td>
                <td style="padding:10px 0;color:#1a3a2a">${bookerName} &lt;${session.email}&gt;</td>
              </tr>
            </table>
          </div>
          <div style="background:#f5f1ea;padding:20px 32px;border-top:1px solid #e8e4dc">
            <p style="margin:0;font-size:12px;color:#9ca3af;font-family:Arial,sans-serif">
              Barnes Bowling Club · Sun Inn, Church Road, Barnes, London SW13 9HE
            </p>
          </div>
        </div>
      `,
    }).then(undefined, err => console.error('[booking-alert] email failed:', err));
  }

  revalidatePath('/members/calendar');
  revalidatePath('/members/book-a-game');
  return { success: true, id: data.id };
}

export async function cancelFixtureBooking(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { success: false, error: 'Not authenticated.' };

  // Fetch the booking to check ownership before deleting
  const { data: booking } = await supabaseAdmin
    .from('fixture_bookings')
    .select('member_email')
    .eq('id', id)
    .single();

  if (!booking) return { success: false, error: 'Booking not found.' };

  const isOwner = booking.member_email === session.email;

  if (!isOwner) {
    // Allow admins to cancel any booking
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('email', session.email)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return { success: false, error: 'You can only cancel your own bookings.' };
    }
  }

  const { error } = await supabaseAdmin
    .from('fixture_bookings')
    .delete()
    .eq('id', id);

  if (error) return { success: false, error: 'Failed to cancel booking.' };

  revalidatePath('/members/calendar');
  revalidatePath('/members/book-a-game');
  return { success: true };
}
