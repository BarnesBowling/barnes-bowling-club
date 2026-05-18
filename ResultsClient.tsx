'use client';

import { useState, useMemo, useEffect, Fragment } from 'react';
import { MEMBERS, fmt } from '@/lib/handicapData';
import { createClient } from '@/lib/supabase/client';

// ── Types ────────────────────────────────────────────────────────────────────

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

type Competition = {
  slug: string;
  name: string;
  format: string;
};

type Props = {
  matches: MatchRow[];
  competitions: Competition[];
};

type ManserSortKey   = 'rank' | 'player' | 'handicap' | 'games' | 'totalPoints' | 'avgPoints';
type OverallSortKey  = 'rank' | 'player' | 'played' | 'wins' | 'losses' | 'winPct';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function compRules(slug: string, name: string): string | null {
  const s = (slug + ' ' + name).toLowerCase();
  if (s.includes('shield'))     return 'Full handicap · games to 21 points';
  if (s.includes('cup'))        return 'No handicap · games to 21 points';
  if (s.includes('pair'))       return 'Combined half handicap · early rounds to 15 pts, semi-finals & final to 21 pts';
  if (s.includes('manser'))     return 'Round robin · games to 11 points';
  if (s.includes('silver-fox') || s.includes('silver fox')) return 'Handicap −6 only · played over 6 ends';
  return null;
}

// ── Shared style constants ───────────────────────────────────────────────────

const filterInputStyle: React.CSSProperties = {
  padding: '9px 12px',
  border: '1.5px solid rgba(45,90,61,.2)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '14px',
  color: 'var(--green-deep)',
  background: 'white',
  borderRadius: '2px',
};

const thStyle: React.CSSProperties = {
  padding: '10px 10px',
  textAlign: 'left',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '11px 10px',
  fontFamily: "'Libre Baskerville', serif",
  fontSize: '14px',
  color: 'var(--text-dark)',
  borderBottom: '1px solid rgba(45,90,61,.07)',
};

const dividerStyle: React.CSSProperties = {
  borderTop: '1.5px solid rgba(45,90,61,.12)',
  paddingTop: '2.5rem',
  marginTop: '3rem',
};

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  fontSize: '22px',
  fontWeight: 500,
  color: 'var(--green-deep)',
  marginTop: 0,
  marginBottom: '0.5rem',
};

// ── Main component ────────────────────────────────────────────────────────────

export function ResultsClient({ matches: initialMatches, competitions }: Props) {
  // ── Live data (starts from server-fetched, kept fresh by realtime) ─────────
  const [matches, setMatches] = useState<MatchRow[]>(initialMatches);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('matches-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        payload => {
          if (payload.eventType === 'INSERT') {
            setMatches(prev => [payload.new as MatchRow, ...prev].sort(
              (a, b) => b.match_date.localeCompare(a.match_date)
            ));
          } else if (payload.eventType === 'UPDATE') {
            setMatches(prev => prev.map(m => m.id === (payload.new as MatchRow).id ? payload.new as MatchRow : m));
          } else if (payload.eventType === 'DELETE') {
            setMatches(prev => prev.filter(m => m.id !== (payload.old as { id: string }).id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Filter state ──────────────────────────────────────────────────────────
  const [search, setSearch]       = useState('');
  const [filterSlug, setFilterSlug] = useState('');
  const [fromDate, setFromDate]   = useState('');
  const [toDate, setToDate]       = useState('');

  // ── Selected match (click-to-expand) ─────────────────────────────────────
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function toggleRow(id: string) {
    setSelectedId(prev => prev === id ? null : id);
  }

  // ── Manser sort state ──────────────────────────────────────────────────────
  const [manserSortKey, setManserSortKey] = useState<ManserSortKey>('totalPoints');
  const [manserSortAsc, setManserSortAsc] = useState(false);

  // ── Overall leaderboard sort state ────────────────────────────────────────
  const [overallSortKey, setOverallSortKey] = useState<OverallSortKey>('wins');
  const [overallSortAsc, setOverallSortAsc] = useState(false);

  // ── Player detail view ────────────────────────────────────────────────────
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  const playerMatches = useMemo(() => {
    if (!selectedPlayer) return [];
    return matches
      .filter(m => m.side_a === selectedPlayer || m.side_b === selectedPlayer)
      .sort((a, b) => b.match_date.localeCompare(a.match_date))
      .map(m => {
        const isA      = m.side_a === selectedPlayer;
        const opponent = isA ? m.side_b : m.side_a;
        const myScore  = isA ? m.side_a_score : m.side_b_score;
        const opScore  = isA ? m.side_b_score : m.side_a_score;
        const result   = m.winner_side === 'draw'
          ? 'Draw'
          : (m.winner_side === 'a') === isA ? 'Win' : 'Loss';
        return { id: m.id, match_date: m.match_date, competition_slug: m.competition_slug, round: m.round, opponent, myScore, opScore, result };
      });
  }, [matches, selectedPlayer]);

  const playerStats = useMemo(() => {
    const wins   = playerMatches.filter(m => m.result === 'Win').length;
    const losses = playerMatches.filter(m => m.result === 'Loss').length;
    const draws  = playerMatches.filter(m => m.result === 'Draw').length;
    const played = playerMatches.length;
    return { played, wins, losses, draws, winPct: played > 0 ? (wins / played) * 100 : 0 };
  }, [playerMatches]);

  // ── Filtered match list (newest first) ───────────────────────────────────
  const filteredMatches = useMemo(() => {
    const q = search.trim().toLowerCase();
    return matches
      .filter(m => {
        if (q && !m.side_a.toLowerCase().includes(q) && !m.side_b.toLowerCase().includes(q)) return false;
        if (filterSlug && m.competition_slug !== filterSlug) return false;
        if (fromDate && m.match_date < fromDate) return false;
        if (toDate && m.match_date > toDate) return false;
        return true;
      })
      .sort((a, b) => b.match_date.localeCompare(a.match_date));
  }, [matches, search, filterSlug, fromDate, toDate]);

  // ── Competition name lookup ────────────────────────────────────────────────
  function compName(slug: string): string {
    return competitions.find(c => c.slug === slug)?.name ?? slug;
  }

  // ── Overall leaderboard (all competitions) ────────────────────────────────
  const overallEntries = useMemo(() => {
    const map = new Map<string, { played: number; wins: number; losses: number; draws: number }>();
    for (const m of matches) {
      for (const [player, side] of [[m.side_a, 'a'], [m.side_b, 'b']] as [string, string][]) {
        const e = map.get(player) ?? { played: 0, wins: 0, losses: 0, draws: 0 };
        e.played += 1;
        if (m.winner_side === 'draw')      e.draws  += 1;
        else if (m.winner_side === side)   e.wins   += 1;
        else                               e.losses += 1;
        map.set(player, e);
      }
    }
    return Array.from(map.entries()).map(([player, e]) => ({
      player,
      played: e.played,
      wins:   e.wins,
      losses: e.losses,
      draws:  e.draws,
      winPct: e.played > 0 ? (e.wins / e.played) * 100 : 0,
    }));
  }, [matches]);

  const sortedOverallEntries = useMemo(() => {
    return [...overallEntries].sort((a, b) => {
      let cmp = 0;
      switch (overallSortKey) {
        case 'player': cmp = a.player.localeCompare(b.player); break;
        case 'played': cmp = a.played - b.played; break;
        case 'wins':   cmp = a.wins   - b.wins;   break;
        case 'losses': cmp = a.losses - b.losses; break;
        case 'winPct': cmp = a.winPct - b.winPct; break;
        default:       cmp = a.wins   - b.wins;   break;
      }
      // Secondary sort: win% when primary is wins, wins when primary is winPct
      if (cmp === 0 && overallSortKey === 'wins')   cmp = a.winPct - b.winPct;
      if (cmp === 0 && overallSortKey === 'winPct') cmp = a.wins   - b.wins;
      return overallSortAsc ? cmp : -cmp;
    });
  }, [overallEntries, overallSortKey, overallSortAsc]);

  function handleOverallSort(key: OverallSortKey) {
    if (key === overallSortKey) {
      setOverallSortAsc(prev => !prev);
    } else {
      setOverallSortKey(key);
      setOverallSortAsc(key === 'player');
    }
  }

  function overallSortIndicator(key: OverallSortKey): string {
    if (key !== overallSortKey) return '';
    return overallSortAsc ? ' ▲' : ' ▼';
  }

  // ── Manser leaderboard (recalculates whenever matches updates) ────────────
  const manserEntries = useMemo(() => {
    const map = new Map<string, { games: number; totalPoints: number }>();

    for (const m of matches) {
      if (m.competition_slug !== 'manser') continue;

      const aPoints = m.manser_adjusted_a ?? 0;
      const bPoints = m.manser_adjusted_b ?? 0;

      const aEntry = map.get(m.side_a) ?? { games: 0, totalPoints: 0 };
      aEntry.games += 1;
      aEntry.totalPoints += aPoints;
      map.set(m.side_a, aEntry);

      const bEntry = map.get(m.side_b) ?? { games: 0, totalPoints: 0 };
      bEntry.games += 1;
      bEntry.totalPoints += bPoints;
      map.set(m.side_b, bEntry);
    }

    return Array.from(map.entries()).map(([player, stats]) => {
      const member = MEMBERS.find(m => `${m.firstname} ${m.surname}` === player);
      return {
        player,
        games: stats.games,
        totalPoints: stats.totalPoints,
        avgPoints: stats.games > 0 ? stats.totalPoints / stats.games : 0,
        handicap: member?.h[2026],
      };
    });
  }, [matches]);

  const sortedManserEntries = useMemo(() => {
    return [...manserEntries].sort((a, b) => {
      let cmp = 0;
      switch (manserSortKey) {
        case 'player':    cmp = a.player.localeCompare(b.player); break;
        case 'handicap':  cmp = (a.handicap ?? 999) - (b.handicap ?? 999); break;
        case 'games':     cmp = a.games - b.games; break;
        case 'avgPoints': cmp = a.avgPoints - b.avgPoints; break;
        default:          cmp = a.totalPoints - b.totalPoints; break;
      }
      return manserSortAsc ? cmp : -cmp;
    });
  }, [manserEntries, manserSortKey, manserSortAsc]);

  function handleManserSort(key: ManserSortKey) {
    if (key === manserSortKey) {
      setManserSortAsc(prev => !prev);
    } else {
      setManserSortKey(key);
      setManserSortAsc(key === 'player');
    }
  }

  function sortIndicator(key: ManserSortKey): string {
    if (key !== manserSortKey) return '';
    return manserSortAsc ? ' ▲' : ' ▼';
  }

  // ── Shared player name button style ──────────────────────────────────────
  const playerBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: "'Libre Baskerville', serif",
    fontSize: '15px',
    color: 'var(--green-mid)',
    cursor: 'pointer',
    textDecoration: 'underline',
    textDecorationColor: 'rgba(45,90,61,.3)',
    textUnderlineOffset: '3px',
    textAlign: 'left',
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  // ── Player detail view ────────────────────────────────────────────────────
  if (selectedPlayer) {
    return (
      <div>
        <button
          onClick={() => setSelectedPlayer(null)}
          style={{ background: 'none', border: 'none', padding: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--green-mid)', cursor: 'pointer', letterSpacing: '.05em', marginBottom: '2rem', display: 'inline-block' }}
        >
          ← Back to leaderboard
        </button>

        <h2 style={{ ...sectionHeadingStyle, fontSize: '26px', marginBottom: '0.25rem' }}>
          {selectedPlayer}
        </h2>

        {/* Stats bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', marginTop: '0.75rem' }}>
          {[
            { label: 'Played', value: playerStats.played },
            { label: 'Wins',   value: playerStats.wins   },
            { label: 'Losses', value: playerStats.losses },
            { label: 'Win %',  value: `${playerStats.winPct.toFixed(0)}%` },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '3px' }}>
                {stat.label}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '22px', fontWeight: 700, color: 'var(--green-deep)' }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {playerMatches.length === 0 ? (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No matches recorded for this player yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(45,90,61,.15)' }}>
                  {['Date', 'Competition', 'Round', 'Opponent', 'Score', 'Result'].map(col => (
                    <th key={col} style={{ ...thStyle, textAlign: col === 'Score' ? 'center' : 'left' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {playerMatches.map(m => (
                  <tr key={m.id}>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{formatDate(m.match_date)}</td>
                    <td style={tdStyle}>
                      <div>{compName(m.competition_slug)}</div>
                      {compRules(m.competition_slug, compName(m.competition_slug)) && (
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                          {compRules(m.competition_slug, compName(m.competition_slug))}
                        </div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--text-mid)' }}>{m.round ?? '—'}</td>
                    <td style={tdStyle}>{m.opponent}</td>
                    <td style={{ ...tdStyle, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '14px', textAlign: 'center', whiteSpace: 'nowrap', color: 'var(--green-deep)' }}>
                      {m.myScore} – {m.opScore}
                    </td>
                    <td style={{
                      ...tdStyle,
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: '13px',
                      color: m.result === 'Win' ? 'var(--green-mid)' : m.result === 'Loss' ? '#a00' : 'var(--text-muted)',
                    }}>
                      {m.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: '3rem' }}>
          <a href="/members/dashboard" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--green-mid)', textDecoration: 'none', letterSpacing: '.05em' }}>
            ← Back to dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>

      {/* ── Section A: Match Results ────────────────────────────────────── */}
      <section>
        <h2 style={{ ...sectionHeadingStyle, fontSize: '26px', marginBottom: '0.35rem' }}>
          Match Results
        </h2>
        <p style={{
          fontFamily: "'Libre Baskerville', serif",
          fontSize: '14px',
          lineHeight: 1.7,
          color: 'var(--text-mid)',
          marginTop: 0,
          marginBottom: '1.5rem',
        }}>
          Results for the 2026 season across all competitions. Entered by the Committee after each match.
        </p>

        {/* Filter bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1.5rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by player name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...filterInputStyle, minWidth: '200px', flex: '1 1 200px' }}
          />
          <select
            value={filterSlug}
            onChange={e => setFilterSlug(e.target.value)}
            style={{ ...filterInputStyle, flex: '0 0 auto' }}
          >
            <option value="">All competitions</option>
            {competitions.map(c => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              From
            </label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={filterInputStyle} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              To
            </label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} style={filterInputStyle} />
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {matches.length === 0
              ? 'No match results have been recorded yet for the 2026 season. Results are entered by the Committee after each match.'
              : 'No results match your current filters.'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(45,90,61,.15)' }}>
                  {['Date', 'Competition', 'Round', 'Side A', 'Score', 'Side B', 'Winner'].map(col => (
                    <th key={col} style={{ ...thStyle, textAlign: col === 'Score' ? 'center' : 'left' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredMatches.map(m => {
                  const winnerLabel = m.winner_side === 'a' ? m.side_a : m.winner_side === 'b' ? m.side_b : 'Draw';
                  const isDraw      = m.winner_side === 'draw';
                  const isSelected  = selectedId === m.id;
                  const isManser    = m.competition_slug === 'manser';

                  return (
                    <Fragment key={m.id}>
                      {/* ── Main row ── */}
                      <tr
                        onClick={() => toggleRow(m.id)}
                        style={{
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(45,90,61,.04)' : 'transparent',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(45,90,61,.025)'; }}
                        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                      >
                        <td style={{ ...tdStyle, whiteSpace: 'nowrap', borderBottom: isSelected ? 'none' : tdStyle.borderBottom }}>
                          {formatDate(m.match_date)}
                        </td>
                        <td style={{ ...tdStyle, borderBottom: isSelected ? 'none' : tdStyle.borderBottom }}>
                          <div>{compName(m.competition_slug)}</div>
                          {compRules(m.competition_slug, compName(m.competition_slug)) && (
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                              {compRules(m.competition_slug, compName(m.competition_slug))}
                            </div>
                          )}
                        </td>
                        <td style={{ ...tdStyle, color: 'var(--text-mid)', borderBottom: isSelected ? 'none' : tdStyle.borderBottom }}>
                          {m.round ?? '—'}
                        </td>
                        <td style={{ ...tdStyle, borderBottom: isSelected ? 'none' : tdStyle.borderBottom }}>
                          {m.side_a}
                        </td>
                        <td style={{ ...tdStyle, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '14px', textAlign: 'center', whiteSpace: 'nowrap', color: 'var(--green-deep)', borderBottom: isSelected ? 'none' : tdStyle.borderBottom }}>
                          {m.side_a_score} – {m.side_b_score}
                        </td>
                        <td style={{ ...tdStyle, borderBottom: isSelected ? 'none' : tdStyle.borderBottom }}>
                          {m.side_b}
                        </td>
                        <td style={{ ...tdStyle, fontFamily: "'DM Sans', sans-serif", fontWeight: isDraw ? 400 : 500, color: isDraw ? 'rgba(45,90,61,.4)' : 'var(--green-deep)', whiteSpace: 'nowrap', borderBottom: isSelected ? 'none' : tdStyle.borderBottom }}>
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            {winnerLabel}
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>
                              {isSelected ? '▲' : '▼'}
                            </span>
                          </span>
                        </td>
                      </tr>

                      {/* ── Expanded detail row ── */}
                      {isSelected && (
                        <tr key={`${m.id}-detail`}>
                          <td
                            colSpan={7}
                            style={{
                              padding: '0',
                              borderBottom: '1px solid rgba(45,90,61,.07)',
                              background: 'rgba(45,90,61,.04)',
                            }}
                          >
                            <div style={{ padding: '1rem 1.25rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>

                              {/* Score card */}
                              <div style={{ flex: '1 1 300px' }}>
                                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                                  Match Score
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', color: 'var(--text-dark)', marginBottom: '2px' }}>
                                      {m.side_a}
                                    </div>
                                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '24px', fontWeight: 700, color: m.winner_side === 'a' ? 'var(--green-mid)' : 'var(--text-muted)' }}>
                                      {m.side_a_score}
                                    </div>
                                    {isManser && m.manser_adjusted_a !== null && (
                                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                        adj. {m.manser_adjusted_a} pts
                                      </div>
                                    )}
                                  </div>
                                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>vs</div>
                                  <div style={{ flex: 1, textAlign: 'right' }}>
                                    <div style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', color: 'var(--text-dark)', marginBottom: '2px' }}>
                                      {m.side_b}
                                    </div>
                                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '24px', fontWeight: 700, color: m.winner_side === 'b' ? 'var(--green-mid)' : 'var(--text-muted)' }}>
                                      {m.side_b_score}
                                    </div>
                                    {isManser && m.manser_adjusted_b !== null && (
                                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                        adj. {m.manser_adjusted_b} pts
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Match info */}
                              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>
                                  Details
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', width: '80px', flexShrink: 0 }}>Competition</span>
                                  <span>
                                    <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', color: 'var(--text-dark)' }}>{compName(m.competition_slug)}</span>
                                    {compRules(m.competition_slug, compName(m.competition_slug)) && (
                                      <span style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                                        {compRules(m.competition_slug, compName(m.competition_slug))}
                                      </span>
                                    )}
                                  </span>
                                </div>
                                {m.round && (
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', width: '80px' }}>Round</span>
                                    <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', color: 'var(--text-dark)' }}>{m.round}</span>
                                  </div>
                                )}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', width: '80px' }}>Result</span>
                                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600, color: isDraw ? 'var(--text-muted)' : 'var(--green-mid)' }}>
                                    {isDraw ? 'Draw' : `${winnerLabel} won`}
                                  </span>
                                </div>
                                {isManser && (
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', width: '80px' }}>Scoring</span>
                                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-mid)' }}>Handicap adjusted</span>
                                  </div>
                                )}
                                {m.notes && (
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', width: '80px', flexShrink: 0 }}>Notes</span>
                                    <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', color: 'var(--text-mid)', fontStyle: 'italic' }}>{m.notes}</span>
                                  </div>
                                )}
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Section B: Overall Record ──────────────────────────────────── */}
      <section style={dividerStyle}>
        <h2 style={sectionHeadingStyle}>Overall Record</h2>
        <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', lineHeight: 1.7, color: 'var(--text-mid)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          Win/loss record across all competitions for the 2026 season. Click any column header to sort.
        </p>

        {sortedOverallEntries.length === 0 ? (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No results recorded yet for 2026.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(45,90,61,.15)' }}>
                  {(
                    [
                      { key: 'rank'   as OverallSortKey, label: 'Rank'   },
                      { key: 'player' as OverallSortKey, label: 'Player' },
                      { key: 'played' as OverallSortKey, label: 'Played' },
                      { key: 'wins'   as OverallSortKey, label: 'Wins'   },
                      { key: 'losses' as OverallSortKey, label: 'Losses' },
                      { key: 'winPct' as OverallSortKey, label: 'Win %'  },
                    ]
                  ).map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => handleOverallSort(key)}
                      style={{
                        ...thStyle,
                        cursor: 'pointer',
                        userSelect: 'none',
                        textAlign: key === 'player' ? 'left' : 'center',
                        color: overallSortKey === key ? 'var(--green-deep)' : 'var(--text-muted)',
                      }}
                    >
                      {label}{overallSortIndicator(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedOverallEntries.map((entry, i) => {
                  const isFirst = i === 0;
                  return (
                    <tr key={entry.player}>
                      <td style={{ ...tdStyle, textAlign: 'center', width: '48px' }}>
                        {isFirst ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gold)', color: 'var(--green-deep)', fontSize: '11px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                            1
                          </span>
                        ) : (
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
                            {i + 1}
                          </span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <button style={playerBtnStyle} onClick={() => setSelectedPlayer(entry.player)}>
                          {entry.player}
                        </button>
                      </td>
                      <td style={{ ...tdStyle, fontFamily: "'DM Sans', sans-serif", fontSize: '14px', textAlign: 'center', color: 'var(--text-mid)' }}>
                        {entry.played}
                      </td>
                      <td style={{ ...tdStyle, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '15px', textAlign: 'center', color: 'var(--green-deep)' }}>
                        {entry.wins}
                      </td>
                      <td style={{ ...tdStyle, fontFamily: "'DM Sans', sans-serif", fontSize: '14px', textAlign: 'center', color: entry.losses > 0 ? 'var(--text-mid)' : 'rgba(45,90,61,.3)' }}>
                        {entry.losses}
                      </td>
                      <td style={{ ...tdStyle, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '14px', textAlign: 'center', color: entry.winPct >= 50 ? 'var(--green-mid)' : 'var(--text-mid)' }}>
                        {entry.winPct.toFixed(0)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Section C: Manser Leaderboard ──────────────────────────────── */}
      <section style={dividerStyle}>
        <h2 style={sectionHeadingStyle}>Manser Leaderboard</h2>
        <p style={{
          fontFamily: "'Libre Baskerville', serif",
          fontSize: '14px',
          lineHeight: 1.7,
          color: 'var(--text-mid)',
          marginTop: '0.5rem',
          marginBottom: '1.5rem',
        }}>
          Points are adjusted by handicap. The better player must clear the worse player&apos;s handicap before their points count.
        </p>

        {sortedManserEntries.length === 0 ? (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No Manser results recorded yet for 2026.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(45,90,61,.15)' }}>
                  {(
                    [
                      { key: 'rank'        as ManserSortKey, label: 'Rank' },
                      { key: 'player'      as ManserSortKey, label: 'Player' },
                      { key: 'handicap'    as ManserSortKey, label: 'Handicap (2026)' },
                      { key: 'games'       as ManserSortKey, label: 'Games' },
                      { key: 'totalPoints' as ManserSortKey, label: 'Total Points' },
                      { key: 'avgPoints'   as ManserSortKey, label: 'Avg Points' },
                    ]
                  ).map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => handleManserSort(key)}
                      style={{
                        ...thStyle,
                        cursor: 'pointer',
                        userSelect: 'none',
                        textAlign: key === 'player' ? 'left' : 'center',
                        color: manserSortKey === key ? 'var(--green-deep)' : 'var(--text-muted)',
                      }}
                    >
                      {label}{sortIndicator(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedManserEntries.map((entry, i) => {
                  const isFirst = i === 0;
                  return (
                    <tr key={entry.player}>
                      <td style={{ ...tdStyle, textAlign: 'center', width: '48px' }}>
                        {isFirst ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gold)', color: 'var(--green-deep)', fontSize: '11px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
                            1
                          </span>
                        ) : (
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
                            {i + 1}
                          </span>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <button style={playerBtnStyle} onClick={() => setSelectedPlayer(entry.player)}>
                          {entry.player}
                        </button>
                      </td>
                      <td style={{ ...tdStyle, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '14px', textAlign: 'center', color: entry.handicap === undefined ? 'rgba(0,0,0,.25)' : 'var(--green-deep)' }}>
                        {fmt(entry.handicap)}
                      </td>
                      <td style={{ ...tdStyle, fontFamily: "'DM Sans', sans-serif", fontSize: '14px', textAlign: 'center', color: 'var(--text-mid)' }}>
                        {entry.games}
                      </td>
                      <td style={{ ...tdStyle, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '15px', textAlign: 'center', color: 'var(--green-deep)' }}>
                        {entry.totalPoints}
                      </td>
                      <td style={{ ...tdStyle, fontFamily: "'DM Sans', sans-serif", fontSize: '14px', textAlign: 'center', color: 'var(--text-mid)' }}>
                        {entry.avgPoints.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Section C: Back link ──────────────────────────────────────────── */}
      <div style={{ marginTop: '3rem' }}>
        <a
          href="/members/dashboard"
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--green-mid)', textDecoration: 'none', letterSpacing: '.05em' }}
        >
          ← Back to dashboard
        </a>
      </div>

    </div>
  );
}
