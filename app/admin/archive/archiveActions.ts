'use server';

import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { MEMBERS } from '@/lib/handicapData';
import { revalidatePath } from 'next/cache';

// ── Types ──────────────────────────────────────────────────────────────────────

type MatchRow = {
  id: string;
  competition_slug: string;
  round: string | null;
  match_date: string;
  side_a: string;
  side_b: string;
  side_a_score: number;
  side_b_score: number;
  winner_side: 'a' | 'b' | 'draw';
  manser_adjusted_a: number | null;
  manser_adjusted_b: number | null;
  notes: string | null;
};

type PairRow = {
  id: string;
  season: number;
  player_a: string;
  player_b: string;
  team_name: string;
  combined_handicap: number;
  team_handicap: number;
};

// ── Winner computation helpers ─────────────────────────────────────────────────

function knockoutResult(matches: MatchRow[], slug: string) {
  const comp = matches.filter(m => m.competition_slug === slug);
  if (comp.length === 0) return undefined;

  const finalMatch = comp.find(m => {
    const r = (m.round ?? '').toLowerCase();
    return r.includes('final') && !r.includes('semi');
  });

  const winner   = finalMatch
    ? (finalMatch.winner_side === 'a' ? finalMatch.side_a : finalMatch.side_b)
    : undefined;
  const runnerUp = finalMatch
    ? (finalMatch.winner_side === 'a' ? finalMatch.side_b : finalMatch.side_a)
    : undefined;

  const semis = comp.filter(m => (m.round ?? '').toLowerCase().includes('semi'));
  const semifinalists = semis.length >= 2
    ? [
        semis[0].winner_side === 'a' ? semis[0].side_b : semis[0].side_a,
        semis[1].winner_side === 'a' ? semis[1].side_b : semis[1].side_a,
      ] as [string, string]
    : undefined;

  return { winner, runnerUp, semifinalists };
}

function manserResult(matches: MatchRow[]) {
  const comp = matches.filter(m => m.competition_slug === 'manser');
  const map = new Map<string, { games: number; totalPoints: number }>();

  for (const m of comp) {
    const a = map.get(m.side_a) ?? { games: 0, totalPoints: 0 };
    a.games++; a.totalPoints += m.manser_adjusted_a ?? 0;
    map.set(m.side_a, a);

    const b = map.get(m.side_b) ?? { games: 0, totalPoints: 0 };
    b.games++; b.totalPoints += m.manser_adjusted_b ?? 0;
    map.set(m.side_b, b);
  }

  const leaderboard = Array.from(map.entries())
    .map(([player, s]) => {
      const member = MEMBERS.find(m => `${m.firstname} ${m.surname}` === player);
      return {
        player,
        handicap: member?.h[2026] ?? null,
        games: s.games,
        totalPoints: s.totalPoints,
        avgPoints: s.games > 0 ? Math.round((s.totalPoints / s.games) * 100) / 100 : 0,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return { winner: leaderboard[0]?.player, leaderboard };
}

function roundRobinResult(matches: MatchRow[], slug: string, useAverage = false) {
  const comp = matches.filter(m => m.competition_slug === slug);
  const map = new Map<string, { games: number; total: number }>();

  for (const m of comp) {
    const a = map.get(m.side_a) ?? { games: 0, total: 0 };
    a.games++; a.total += m.side_a_score;
    map.set(m.side_a, a);

    const b = map.get(m.side_b) ?? { games: 0, total: 0 };
    b.games++; b.total += m.side_b_score;
    map.set(m.side_b, b);
  }

  const leaderboard = Array.from(map.entries())
    .map(([player, s]) => ({
      player,
      games: s.games,
      totalPoints: s.total,
      avgPoints: s.games > 0 ? Math.round((s.total / s.games) * 100) / 100 : 0,
    }))
    .sort((a, b) => useAverage ? b.avgPoints - a.avgPoints : b.totalPoints - a.totalPoints);

  return { winner: leaderboard[0]?.player, leaderboard };
}

function overallLeaderboard(matches: MatchRow[]) {
  const map = new Map<string, { played: number; wins: number; losses: number; draws: number }>();

  for (const m of matches) {
    for (const [player, side] of [[m.side_a, 'a'], [m.side_b, 'b']] as [string, string][]) {
      const e = map.get(player) ?? { played: 0, wins: 0, losses: 0, draws: 0 };
      e.played++;
      if (m.winner_side === 'draw') e.draws++;
      else if (m.winner_side === side) e.wins++;
      else e.losses++;
      map.set(player, e);
    }
  }

  return Array.from(map.entries())
    .map(([player, e]) => ({
      player,
      played: e.played,
      wins: e.wins,
      losses: e.losses,
      draws: e.draws,
      winPct: e.played > 0 ? Math.round((e.wins / e.played) * 10000) / 100 : 0,
    }))
    .sort((a, b) => b.wins - a.wins || b.winPct - a.winPct);
}

// ── Public actions ─────────────────────────────────────────────────────────────

export async function getSeasonPreview(): Promise<{
  counts: { slug: string; name: string; count: number }[];
  totalMatches: number;
  alreadyArchived: boolean;
}> {
  await requireAdminSession();

  const [{ data: matches }, { data: existing }] = await Promise.all([
    supabaseAdmin.from('matches').select('competition_slug'),
    supabaseAdmin.from('archived_seasons').select('year').eq('year', 2026).maybeSingle(),
  ]);

  const countMap = new Map<string, number>();
  for (const m of matches ?? []) {
    countMap.set(m.competition_slug, (countMap.get(m.competition_slug) ?? 0) + 1);
  }

  const slugNames: Record<string, string> = {
    cup: 'Cup', shield: 'Shield', pairs: 'Pairs', manser: 'Manser',
    'silver-fox': 'Silver Fox', 'plus-cup': 'Plus Cup', 'ladies-day': 'Ladies Day',
    'wrong-bias': 'Wrong Bias', 'murray-johnson': 'Murray Johnson',
  };

  const counts = Array.from(countMap.entries()).map(([slug, count]) => ({
    slug, name: slugNames[slug] ?? slug, count,
  })).sort((a, b) => b.count - a.count);

  return {
    counts,
    totalMatches: (matches ?? []).length,
    alreadyArchived: !!existing,
  };
}

export async function fetchMatchesForBackup(): Promise<{
  matches: MatchRow[];
  pairs: PairRow[];
  error?: string;
}> {
  try {
    await requireAdminSession();
    const [{ data: matches }, { data: pairs }] = await Promise.all([
      supabaseAdmin.from('matches').select('*').order('match_date', { ascending: true }),
      supabaseAdmin.from('pairs_teams').select('*'),
    ]);
    return { matches: (matches ?? []) as MatchRow[], pairs: (pairs ?? []) as PairRow[] };
  } catch (e) {
    return { matches: [], pairs: [], error: e instanceof Error ? e.message : 'Failed to fetch data' };
  }
}

export async function archiveSeasonAndReset(year: number): Promise<{ error?: string }> {
  try {
    const session = await requireAdminSession();

    // Check not already archived
    const { data: existing } = await supabaseAdmin
      .from('archived_seasons')
      .select('year')
      .eq('year', year)
      .maybeSingle();
    if (existing) return { error: `Season ${year} has already been archived.` };

    // Fetch all current data
    const [{ data: matchesRaw }, { data: pairsRaw }] = await Promise.all([
      supabaseAdmin.from('matches').select('*').order('match_date', { ascending: true }),
      supabaseAdmin.from('pairs_teams').select('*'),
    ]);

    const matches = (matchesRaw ?? []) as MatchRow[];
    const pairs   = (pairsRaw   ?? []) as PairRow[];

    // Compute all results
    const cup       = knockoutResult(matches, 'cup');
    const shield    = knockoutResult(matches, 'shield');
    const pairsRes  = knockoutResult(matches, 'pairs');
    const silverFox = knockoutResult(matches, 'silver-fox');
    const manser    = manserResult(matches);
    const plusCup   = roundRobinResult(matches, 'plus-cup', false);
    const ladiesDay = roundRobinResult(matches, 'ladies-day', true);
    const overall   = overallLeaderboard(matches);

    // Write archive record
    const { error: insertErr } = await supabaseAdmin
      .from('archived_seasons')
      .insert({
        year,
        cup:                 cup       ?? null,
        shield:              shield    ?? null,
        pairs:               pairsRes  ?? null,
        silver_fox:          silverFox ?? null,
        manser:              manser.leaderboard.length ? manser : null,
        plus_cup:            plusCup.leaderboard.length ? plusCup : null,
        ladies_day:          ladiesDay.leaderboard.length ? ladiesDay : null,
        overall_leaderboard: overall.length ? overall : null,
        matches_backup:      matches,
        pairs_backup:        pairs,
        archived_by:         session.email,
      });

    if (insertErr) return { error: insertErr.message };

    // Reset — delete all matches and pairs_teams for the current season
    const [{ error: matchesErr }, { error: pairsErr }] = await Promise.all([
      supabaseAdmin.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabaseAdmin.from('pairs_teams').delete().eq('season', year),
    ]);

    if (matchesErr) return { error: `Archived but failed to reset matches: ${matchesErr.message}` };
    if (pairsErr)   return { error: `Archived but failed to reset pairs: ${pairsErr.message}` };

    revalidatePath('/admin/results');
    revalidatePath('/members/results');
    revalidatePath('/members/competition-sheets');
    revalidatePath('/members/archive');
    revalidatePath(`/members/archive/results/${year}`);

    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Archive failed' };
  }
}
