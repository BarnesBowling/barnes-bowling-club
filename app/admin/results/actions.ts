'use server';

import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { MEMBERS } from '@/lib/handicapData';
import { revalidatePath } from 'next/cache';

type WinnerSide = 'a' | 'b' | 'draw';

function calcManser(
  sideA: string,
  sideB: string,
  scoreA: number,
  scoreB: number,
): { a: number; b: number } {
  const mA = MEMBERS.find(m => `${m.firstname} ${m.surname}` === sideA);
  const mB = MEMBERS.find(m => `${m.firstname} ${m.surname}` === sideB);
  const hA = mA?.h[2026] ?? 0;
  const hB = mB?.h[2026] ?? 0;

  if (hA < hB) {
    return { a: Math.max(0, scoreA - hB), b: scoreB };
  } else if (hB < hA) {
    return { a: scoreA, b: Math.max(0, scoreB - hA) };
  }
  return { a: scoreA, b: scoreB };
}

type MatchPayload = {
  competitionSlug: string;
  round: string | null;
  matchDate: string;
  sideA: string;
  sideB: string;
  sideAPairId: string | null;
  sideBPairId: string | null;
  sideAScore: string | number;
  sideBScore: string | number;
  notes: string;
};

function buildMatchRecord(data: MatchPayload) {
  const { competitionSlug, round, matchDate, sideA, sideB, sideAPairId, sideBPairId, notes } = data;
  const sideAScore = parseInt(String(data.sideAScore), 10);
  const sideBScore = parseInt(String(data.sideBScore), 10);
  const winnerSide: WinnerSide = sideAScore > sideBScore ? 'a' : sideAScore < sideBScore ? 'b' : 'draw';

  let manser_adjusted_a: number | null = null;
  let manser_adjusted_b: number | null = null;
  if (competitionSlug === 'manser') {
    const m = calcManser(sideA, sideB, sideAScore, sideBScore);
    manser_adjusted_a = m.a;
    manser_adjusted_b = m.b;
  }

  return {
    competition_slug: competitionSlug,
    round: round || null,
    match_date: matchDate,
    side_a: sideA,
    side_b: sideB,
    side_a_pair_id: sideAPairId || null,
    side_b_pair_id: sideBPairId || null,
    side_a_score: sideAScore,
    side_b_score: sideBScore,
    winner_side: winnerSide,
    manser_adjusted_a,
    manser_adjusted_b,
    notes: notes || null,
  };
}

// Return-based error pattern instead of throw — prevents React 19 startTransition
// from propagating server action errors to the error boundary.

export async function addMatch(data: MatchPayload): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
  } catch {
    return { error: 'Not authorised. Please log in again.' };
  }
  try {
    const record = buildMatchRecord(data);
    const { error } = await supabaseAdmin.from('matches').insert({ ...record, created_by: 'admin' });
    if (error) {
      console.error('[addMatch] Supabase error:', JSON.stringify(error));
      return { error: error.message };
    }
    revalidatePath('/admin/results');
    revalidatePath('/members/results');
    return {};
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[addMatch] unexpected error:', msg);
    return { error: msg };
  }
}

export async function updateMatch(id: string, data: MatchPayload): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
  } catch {
    return { error: 'Not authorised. Please log in again.' };
  }
  try {
    const record = buildMatchRecord(data);
    const { error } = await supabaseAdmin.from('matches').update(record).eq('id', id);
    if (error) {
      console.error('[updateMatch] Supabase error:', JSON.stringify(error));
      return { error: error.message };
    }
    revalidatePath('/admin/results');
    revalidatePath('/members/results');
    return {};
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[updateMatch] unexpected error:', msg);
    return { error: msg };
  }
}

export async function deleteMatch(id: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
  } catch {
    return { error: 'Not authorised. Please log in again.' };
  }
  try {
    const { error } = await supabaseAdmin.from('matches').delete().eq('id', id);
    if (error) {
      console.error('[deleteMatch] Supabase error:', JSON.stringify(error));
      return { error: error.message };
    }
    revalidatePath('/admin/results');
    revalidatePath('/members/results');
    return {};
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[deleteMatch] unexpected error:', msg);
    return { error: msg };
  }
}

export async function addPairTeam(data: {
  playerA: string;
  playerB: string;
  combinedHandicap: number;
  teamHandicap: number;
}): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
  } catch {
    return { error: 'Not authorised. Please log in again.' };
  }
  try {
    const { playerA, playerB, combinedHandicap, teamHandicap } = data;
    const { error } = await supabaseAdmin.from('pairs_teams').insert({
      season: 2026,
      player_a: playerA,
      player_b: playerB,
      team_name: `${playerA} & ${playerB}`,
      combined_handicap: combinedHandicap,
      team_handicap: teamHandicap,
    });
    if (error) {
      console.error('[addPairTeam] Supabase error:', JSON.stringify(error));
      return { error: error.message };
    }
    revalidatePath('/admin/results');
    return {};
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[addPairTeam] unexpected error:', msg);
    return { error: msg };
  }
}

export async function deletePairTeam(id: string): Promise<{ error?: string }> {
  try {
    await requireAdminSession();
  } catch {
    return { error: 'Not authorised. Please log in again.' };
  }
  try {
    const { error } = await supabaseAdmin.from('pairs_teams').delete().eq('id', id);
    if (error) {
      console.error('[deletePairTeam] Supabase error:', JSON.stringify(error));
      return { error: error.message };
    }
    revalidatePath('/admin/results');
    return {};
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[deletePairTeam] unexpected error:', msg);
    return { error: msg };
  }
}
