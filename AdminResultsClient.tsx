'use client';

import { useState, useTransition, useEffect } from 'react';
import { MEMBERS } from '@/lib/handicapData';
import {
  addMatch,
  updateMatch,
  deleteMatch,
  addPairTeam,
  deletePairTeam,
} from './actions';

// ── Types ────────────────────────────────────────────────────────────────────

type Competition = {
  id: string;
  slug: string;
  name: string;
  format: 'knockout' | 'one_day' | 'round_robin' | 'final';
  handicap_rule: string | null;
  eligibility: string | null;
  active: boolean;
  target_score_early: number | null;
  target_score_late: number | null;
  scoring_unit: 'points' | 'ends';
};

type PairTeam = {
  id: string;
  season: number;
  player_a: string;
  player_b: string;
  team_name: string;
  combined_handicap: number;
  team_handicap: number;
  created_at: string;
};

type MatchRow = {
  id: string;
  competition_slug: string;
  round: string | null;
  match_date: string;
  side_a: string;
  side_b: string;
  side_a_pair_id: string | null;
  side_b_pair_id: string | null;
  side_a_score: number;
  side_b_score: number;
  winner_side: 'a' | 'b' | 'draw';
  manser_adjusted_a: number | null;
  manser_adjusted_b: number | null;
  notes: string | null;
  created_at: string;
  created_by: string | null;
};

type Props = {
  competitions: Competition[];
  pairs: PairTeam[];
  recentMatches: MatchRow[];
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const ROUND_OPTIONS = [
  'Round 0', 'Round 1', 'Round 2', 'Round 3', 'Round 4', 'Semi-Final', 'Final',
];

/** Members active in 2026, sorted by surname */
const MEMBERS_2026 = [...MEMBERS]
  .filter(m => m.h[2026] !== undefined)
  .sort((a, b) => a.surname.localeCompare(b.surname));

/** Plus players (h >= 0), sorted highest plus first (descending) */
const PLUS_MEMBERS = [...MEMBERS]
  .filter(m => m.h[2026] !== undefined && (m.h[2026] as number) >= 0)
  .sort((a, b) => (b.h[2026] as number) - (a.h[2026] as number));

/** Minus players (h <= 0), sorted most minus first (ascending) */
const MINUS_MEMBERS = [...MEMBERS]
  .filter(m => m.h[2026] !== undefined && (m.h[2026] as number) <= 0)
  .sort((a, b) => (a.h[2026] as number) - (b.h[2026] as number));

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtHcp(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

function calcManserClient(
  sideA: string,
  sideB: string,
  scoreA: number,
  scoreB: number,
): { a: number; b: number } {
  const mA = MEMBERS.find(m => `${m.firstname} ${m.surname}` === sideA);
  const mB = MEMBERS.find(m => `${m.firstname} ${m.surname}` === sideB);
  const hA = (mA?.h[2026] as number) ?? 0;
  const hB = (mB?.h[2026] as number) ?? 0;
  if (hA < hB) return { a: Math.max(0, scoreA - hB), b: scoreB };
  if (hB < hA) return { a: scoreA, b: Math.max(0, scoreB - hA) };
  return { a: scoreA, b: scoreB };
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: '#fff',
  boxShadow: '3px 3px 0 rgba(45,90,61,.08), 0 4px 20px rgba(0,0,0,.04)',
  padding: '2rem 2rem 2.5rem',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--green-mid)',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  height: '44px',
  padding: '0 12px',
  border: '1.5px solid rgba(45,90,61,.2)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '16px',
  color: 'var(--green-deep)',
  background: '#fff',
  width: '100%',
  boxSizing: 'border-box',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 28px',
  height: '48px',
  background: 'var(--green-mid)',
  color: '#fff',
  border: 'none',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  fontWeight: 700,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  minWidth: '140px',
};

const btnSecondary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 20px',
  height: '48px',
  background: '#fff',
  color: 'var(--green-mid)',
  border: '1.5px solid var(--green-mid)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  letterSpacing: '.07em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

const btnDanger: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 14px',
  height: '36px',
  background: '#c00',
  color: '#fff',
  border: 'none',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

const btnSecondarySmall: React.CSSProperties = {
  ...btnSecondary,
  height: '36px',
  padding: '0 14px',
  fontSize: '12px',
};

const noticeBase: React.CSSProperties = {
  padding: '12px 16px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '14px',
  marginBottom: '1.5rem',
};

// ── SectionHeader ─────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '22px',
        fontWeight: 500,
        color: 'var(--green-deep)',
        margin: '0 0 0.5rem',
      }}>
        {title}
      </h2>
      <div style={{ width: '48px', height: '2px', background: 'var(--gold)' }} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AdminResultsClient({ competitions, pairs, recentMatches }: Props) {
  // ── Match form state ──────────────────────────────────────────────────────
  const [editMatch, setEditMatch] = useState<MatchRow | null>(null);
  const [competitionSlug, setCompetitionSlug] = useState('');
  const [round, setRound] = useState('');
  const [matchDate, setMatchDate] = useState('');
  const [sideAPairId, setSideAPairId] = useState('');
  const [sideBPairId, setSideBPairId] = useState('');
  const [sideAMember, setSideAMember] = useState('');
  const [sideBMember, setSideBMember] = useState('');
  const [sideAScore, setSideAScore] = useState('');
  const [sideBScore, setSideBScore] = useState('');
  const [notes, setNotes] = useState('');
  const [matchMsg, setMatchMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [matchPending, startMatchTransition] = useTransition();

  // ── Pair registration state ───────────────────────────────────────────────
  const [pairPlayerA, setPairPlayerA] = useState('');
  const [pairPlayerB, setPairPlayerB] = useState('');
  const [pairMsg, setPairMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pairPending, startPairTransition] = useTransition();

  // ── Auto-dismiss success banners ──────────────────────────────────────────
  useEffect(() => {
    if (matchMsg?.ok) {
      const t = setTimeout(() => setMatchMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, [matchMsg]);

  useEffect(() => {
    if (pairMsg?.ok) {
      const t = setTimeout(() => setPairMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, [pairMsg]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const selectedComp = competitions.find(c => c.slug === competitionSlug) ?? null;
  const isPairs = competitionSlug === 'pairs';
  const isManser = competitionSlug === 'manser';
  const showRound = selectedComp?.format === 'knockout' || selectedComp?.format === 'final';
  const isSilverFox = competitionSlug === 'silver-fox';
  const isLateRound = ['Semi-Final', 'Final'].includes(round);
  const maxScore: number | null = selectedComp
    ? (isPairs && isLateRound
        ? (selectedComp.target_score_late ?? selectedComp.target_score_early ?? null)
        : selectedComp.target_score_early ?? null)
    : null;
  const scoreLabel = isSilverFox ? 'Ends Won' : 'Score';
  const scoringHint = maxScore
    ? isSilverFox
      ? `Best of ${maxScore} ends`
      : isPairs
        ? isLateRound
          ? `First to ${maxScore} points (semi/final)`
          : `First to ${maxScore} points (early round) · ${selectedComp?.target_score_late ?? 21} in semi/final`
        : `First to ${maxScore} points`
    : null;

  // Manser inline preview
  const manserPreview = isManser && sideAMember && sideBMember && sideAScore && sideBScore
    ? calcManserClient(sideAMember, sideBMember, Number(sideAScore), Number(sideBScore))
    : null;

  // Pairs handicap
  const hA = pairPlayerA ? (MEMBERS.find(m => `${m.firstname} ${m.surname}` === pairPlayerA)?.h[2026] ?? 0) : null;
  const hB = pairPlayerB ? (MEMBERS.find(m => `${m.firstname} ${m.surname}` === pairPlayerB)?.h[2026] ?? 0) : null;
  const combinedHcp = hA !== null && hB !== null ? hA + hB : null;
  const teamHcp = combinedHcp !== null ? Math.round(combinedHcp / 2) : null;

  // ── Populate form when editing ────────────────────────────────────────────
  function startEditing(row: MatchRow) {
    setEditMatch(row);
    setCompetitionSlug(row.competition_slug);
    setRound(row.round ?? '');
    setMatchDate(row.match_date);
    if (row.side_a_pair_id) {
      setSideAPairId(row.side_a_pair_id);
      setSideAMember('');
    } else {
      setSideAMember(row.side_a);
      setSideAPairId('');
    }
    if (row.side_b_pair_id) {
      setSideBPairId(row.side_b_pair_id);
      setSideBMember('');
    } else {
      setSideBMember(row.side_b);
      setSideBPairId('');
    }
    setSideAScore(String(row.side_a_score));
    setSideBScore(String(row.side_b_score));
    setNotes(row.notes ?? '');
    setMatchMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetMatchForm() {
    setCompetitionSlug('');
    setRound('');
    setMatchDate('');
    setSideAPairId('');
    setSideBPairId('');
    setSideAMember('');
    setSideBMember('');
    setSideAScore('');
    setSideBScore('');
    setNotes('');
    setEditMatch(null);
  }

  // ── Submit match ──────────────────────────────────────────────────────────
  function handleMatchSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (maxScore !== null) {
      const a = Number(sideAScore);
      const b = Number(sideBScore);
      if (a > maxScore || b > maxScore) {
        setMatchMsg({ ok: false, text: `Scores cannot exceed ${maxScore} for ${selectedComp?.name ?? 'this competition'} (${scoringHint}).` });
        return;
      }
      if (isSilverFox && (a > 6 || b > 6)) {
        setMatchMsg({ ok: false, text: 'Silver Fox is played over 6 ends — ends won cannot exceed 6.' });
        return;
      }
    }

    const sideA = isPairs
      ? (pairs.find(p => p.id === sideAPairId)?.team_name ?? '')
      : sideAMember;
    const sideB = isPairs
      ? (pairs.find(p => p.id === sideBPairId)?.team_name ?? '')
      : sideBMember;

    const payload = {
      competitionSlug,
      round: round || null,
      matchDate,
      sideA,
      sideB,
      sideAPairId: isPairs ? sideAPairId || null : null,
      sideBPairId: isPairs ? sideBPairId || null : null,
      sideAScore: Number(sideAScore),
      sideBScore: Number(sideBScore),
      notes,
    };

    startMatchTransition(async () => {
      try {
        if (editMatch) {
          await updateMatch(editMatch.id, payload);
          setMatchMsg({ ok: true, text: 'Match updated successfully.' });
        } else {
          await addMatch(payload);
          setMatchMsg({ ok: true, text: 'Result saved successfully.' });
        }
        resetMatchForm();
      } catch (err: unknown) {
        setMatchMsg({ ok: false, text: err instanceof Error ? err.message : 'An error occurred.' });
      }
    });
  }

  // ── Submit pair ───────────────────────────────────────────────────────────
  function handlePairSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (combinedHcp === null || teamHcp === null) return;
    startPairTransition(async () => {
      try {
        await addPairTeam({
          playerA: pairPlayerA,
          playerB: pairPlayerB,
          combinedHandicap: combinedHcp,
          teamHandicap: teamHcp,
        });
        setPairMsg({ ok: true, text: 'Pair team registered.' });
        setPairPlayerA('');
        setPairPlayerB('');
      } catch (err: unknown) {
        setPairMsg({ ok: false, text: err instanceof Error ? err.message : 'An error occurred.' });
      }
    });
  }

  // ── Delete match ──────────────────────────────────────────────────────────
  function handleDeleteMatch(id: string) {
    if (!confirm('Delete this match result? This cannot be undone.')) return;
    startMatchTransition(async () => {
      try {
        await deleteMatch(id);
      } catch {
        // silently ignore
      }
    });
  }

  // ── Delete pair ───────────────────────────────────────────────────────────
  function handleDeletePair(id: string) {
    if (!confirm('Delete this pair team?')) return;
    startPairTransition(async () => {
      try {
        await deletePairTeam(id);
        setPairMsg({ ok: true, text: 'Pair deleted.' });
      } catch (err: unknown) {
        setPairMsg({ ok: false, text: err instanceof Error ? err.message : 'An error occurred.' });
      }
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── Section A: Enter / Edit Match Result ──────────────────────────── */}
      <section style={card}>
        <SectionHeader title={editMatch ? 'Edit Match Result' : 'Enter Match Result'} />

        {matchMsg && (
          <div style={{
            ...noticeBase,
            background: matchMsg.ok ? 'rgba(45,90,61,.08)' : 'rgba(192,0,0,.06)',
            borderLeft: `4px solid ${matchMsg.ok ? 'var(--green-mid)' : '#c00'}`,
            color: matchMsg.ok ? 'var(--green-deep)' : '#900',
          }}>
            {matchMsg.text}
          </div>
        )}

        <form onSubmit={handleMatchSubmit}>

          {/* Competition toggle buttons */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={labelStyle}>Competition</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '6px' }}>
              {competitions.map(c => {
                const isActive = competitionSlug === c.slug;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCompetitionSlug(c.slug);
                      setRound('');
                      setSideAPairId('');
                      setSideBPairId('');
                      setSideAMember('');
                      setSideBMember('');
                    }}
                    style={{
                      padding: '0 20px',
                      height: '44px',
                      background: isActive ? 'var(--green-mid)' : '#fff',
                      color: isActive ? '#fff' : 'var(--green-mid)',
                      border: `1.5px solid ${isActive ? 'var(--green-mid)' : 'rgba(45,90,61,.25)'}`,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '14px',
                      fontWeight: isActive ? 700 : 500,
                      letterSpacing: '.03em',
                      cursor: 'pointer',
                      transition: 'all .15s',
                    }}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Round + Date */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: showRound ? '1fr 1fr' : '200px',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}>
            {showRound && (
              <div>
                <label style={labelStyle}>Round</label>
                <select value={round} onChange={e => setRound(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select round…</option>
                  {ROUND_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            )}
            <div>
              <label style={labelStyle}>Match Date</label>
              <input type="date" required value={matchDate} onChange={e => setMatchDate(e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* Side A vs Side B */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '1rem',
            alignItems: 'end',
            marginBottom: '1.25rem',
          }}>
            <div>
              <label style={labelStyle}>Side A</label>
              {isPairs ? (
                <select required value={sideAPairId} onChange={e => setSideAPairId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select pair…</option>
                  {pairs.map(p => <option key={p.id} value={p.id}>{p.team_name}</option>)}
                </select>
              ) : (
                <select required value={sideAMember} onChange={e => setSideAMember(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select player…</option>
                  {MEMBERS_2026.map(m => {
                    const name = `${m.firstname} ${m.surname}`;
                    return <option key={name} value={name}>{name}</option>;
                  })}
                </select>
              )}
            </div>

            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '18px',
              color: 'var(--text-muted)',
              paddingBottom: '10px',
              textAlign: 'center',
              minWidth: '36px',
            }}>
              vs
            </div>

            <div>
              <label style={labelStyle}>Side B</label>
              {isPairs ? (
                <select required value={sideBPairId} onChange={e => setSideBPairId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select pair…</option>
                  {pairs.map(p => <option key={p.id} value={p.id}>{p.team_name}</option>)}
                </select>
              ) : (
                <select required value={sideBMember} onChange={e => setSideBMember(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select player…</option>
                  {MEMBERS_2026.map(m => {
                    const name = `${m.firstname} ${m.surname}`;
                    return <option key={name} value={name}>{name}</option>;
                  })}
                </select>
              )}
            </div>
          </div>

          {/* Scores + Notes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '120px 120px 1fr',
            gap: '1rem',
            alignItems: 'end',
            marginBottom: '0.75rem',
          }}>
            <div>
              <label style={labelStyle}>{scoreLabel} A</label>
              <input type="number" min="0" max={maxScore ?? 99} required value={sideAScore} onChange={e => setSideAScore(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{scoreLabel} B</label>
              <input type="number" min="0" max={maxScore ?? 99} required value={sideBScore} onChange={e => setSideBScore(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Notes (optional)</label>
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)} style={inputStyle} placeholder="e.g. weather conditions, venue" />
            </div>
          </div>

          {/* Scoring hint */}
          {scoringHint && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--gold)', margin: '0 0 1rem', letterSpacing: '.03em' }}>
              ⓘ {scoringHint}
            </p>
          )}

          {/* Manser handicap inline preview */}
          {manserPreview && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2rem',
              padding: '12px 16px',
              background: 'rgba(45,90,61,.05)',
              borderLeft: '3px solid var(--green-mid)',
              marginBottom: '1.25rem',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              color: 'var(--green-deep)',
            }}>
              <strong>Manser adjusted:</strong>
              <span>{sideAMember.split(' ').pop()} — {manserPreview.a}</span>
              <span>{sideBMember.split(' ').pop()} — {manserPreview.b}</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
            <button type="submit" style={{ ...btnPrimary, opacity: matchPending ? .65 : 1 }} disabled={matchPending}>
              {matchPending ? 'Saving…' : editMatch ? 'Update Result' : 'Save Result'}
            </button>
            {editMatch && (
              <button type="button" onClick={resetMatchForm} style={btnSecondary}>Cancel</button>
            )}
          </div>

        </form>
      </section>

      {/* ── Section B: Register Pairs Team (visible only when Pairs selected) ── */}
      {isPairs && (
        <section style={card}>
          <SectionHeader title="Register Pairs Team" />

          {pairMsg && (
            <div style={{
              ...noticeBase,
              background: pairMsg.ok ? 'rgba(45,90,61,.08)' : 'rgba(192,0,0,.06)',
              borderLeft: `4px solid ${pairMsg.ok ? 'var(--green-mid)' : '#c00'}`,
              color: pairMsg.ok ? 'var(--green-deep)' : '#900',
            }}>
              {pairMsg.text}
            </div>
          )}

          <form onSubmit={handlePairSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={labelStyle}>Player A (plus or scratch)</label>
                <select required value={pairPlayerA} onChange={e => setPairPlayerA(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select player A…</option>
                  {PLUS_MEMBERS.map(m => {
                    const name = `${m.firstname} ${m.surname}`;
                    return <option key={name} value={name}>{name} ({fmtHcp(m.h[2026] as number)})</option>;
                  })}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Player B (minus or scratch)</label>
                <select required value={pairPlayerB} onChange={e => setPairPlayerB(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Select player B…</option>
                  {MINUS_MEMBERS.map(m => {
                    const name = `${m.firstname} ${m.surname}`;
                    return <option key={name} value={name}>{name} ({fmtHcp(m.h[2026] as number)})</option>;
                  })}
                </select>
              </div>
            </div>

            {combinedHcp !== null && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '2.5rem',
                padding: '12px 16px',
                background: 'rgba(45,90,61,.05)',
                borderLeft: '3px solid var(--green-mid)',
                marginBottom: '1.25rem',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                color: 'var(--green-deep)',
              }}>
                <span><strong>Combined handicap:</strong> {fmtHcp(combinedHcp)}</span>
                <span><strong>Team handicap:</strong> {fmtHcp(teamHcp as number)}</span>
              </div>
            )}

            <button type="submit" style={{ ...btnPrimary, opacity: pairPending ? .65 : 1 }} disabled={pairPending}>
              {pairPending ? 'Registering…' : 'Register Team'}
            </button>
          </form>

          {/* Registered pairs table */}
          {pairs.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green-mid)', marginBottom: '0.75rem' }}>
                Registered Pairs
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                  <thead>
                    <tr>
                      {['Team Name', 'Combined Hcp', 'Team Hcp', ''].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '2px solid rgba(45,90,61,.15)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pairs.map((p, i) => (
                      <tr key={p.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(45,90,61,.025)' }}>
                        <td style={{ padding: '10px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-dark)', borderBottom: '1px solid rgba(45,90,61,.07)' }}>{p.team_name}</td>
                        <td style={{ padding: '10px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-mid)', borderBottom: '1px solid rgba(45,90,61,.07)' }}>{fmtHcp(p.combined_handicap)}</td>
                        <td style={{ padding: '10px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-mid)', borderBottom: '1px solid rgba(45,90,61,.07)' }}>{fmtHcp(p.team_handicap)}</td>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(45,90,61,.07)', textAlign: 'right' }}>
                          <button onClick={() => handleDeletePair(p.id)} style={btnDanger}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Section C: Recent Results ──────────────────────────────────────── */}
      <section style={card}>
        <SectionHeader title="Recent Results" />

        {recentMatches.length === 0 ? (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No match results recorded yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '680px' }}>
              <thead>
                <tr>
                  {['Date', 'Competition', 'Round', 'Side A', 'Score', 'Side B', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '2px solid rgba(45,90,61,.15)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentMatches.map((m, i) => {
                  const compName = competitions.find(c => c.slug === m.competition_slug)?.name ?? m.competition_slug;
                  return (
                    <tr key={m.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(45,90,61,.025)' }}>
                      <td style={{ padding: '11px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-dark)', borderBottom: '1px solid rgba(45,90,61,.07)', whiteSpace: 'nowrap' }}>{formatDate(m.match_date)}</td>
                      <td style={{ padding: '11px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-dark)', borderBottom: '1px solid rgba(45,90,61,.07)' }}>{compName}</td>
                      <td style={{ padding: '11px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-muted)', borderBottom: '1px solid rgba(45,90,61,.07)', whiteSpace: 'nowrap' }}>{m.round ?? '—'}</td>
                      <td style={{ padding: '11px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-dark)', borderBottom: '1px solid rgba(45,90,61,.07)' }}>{m.side_a}</td>
                      <td style={{ padding: '11px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '15px', fontWeight: 700, color: 'var(--green-mid)', borderBottom: '1px solid rgba(45,90,61,.07)', whiteSpace: 'nowrap' }}>{m.side_a_score} – {m.side_b_score}</td>
                      <td style={{ padding: '11px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-dark)', borderBottom: '1px solid rgba(45,90,61,.07)' }}>{m.side_b}</td>
                      <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(45,90,61,.07)', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => startEditing(m)} style={btnSecondarySmall}>Edit</button>
                          <button onClick={() => handleDeleteMatch(m.id)} style={btnDanger}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
