import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { notFound } from 'next/navigation';
import { getYearResults, VALID_YEARS, DB_YEARS, type CompetitionResult } from '@/data/past-results';
import { supabaseAdmin } from '@/lib/supabase/admin';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return VALID_YEARS.map((year) => ({ year: String(year) }));
}

export async function generateMetadata({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  return { title: `${year} Season Results — Barnes Bowling Club` };
}

// ── Types for DB archive data ──────────────────────────────────────────────────

type KnockoutResult = { winner?: string; runnerUp?: string; semifinalists?: [string, string] };
type ManserEntry    = { player: string; handicap: number | null; games: number; totalPoints: number; avgPoints: number };
type RREntry        = { player: string; games: number; totalPoints: number; avgPoints: number };
type OverallEntry   = { player: string; played: number; wins: number; losses: number; draws: number; winPct: number };

type DbRow = {
  cup:                KnockoutResult | null;
  shield:             KnockoutResult | null;
  pairs:              KnockoutResult | null;
  silver_fox:         KnockoutResult | null;
  manser:             { winner?: string; leaderboard: ManserEntry[] } | null;
  plus_cup:           { winner?: string; leaderboard: RREntry[] } | null;
  ladies_day:         { winner?: string; leaderboard: RREntry[] } | null;
  overall_leaderboard: OverallEntry[] | null;
};

// ── Shared styles ──────────────────────────────────────────────────────────────

const headingStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  fontSize: '20px',
  fontWeight: 500,
  color: 'var(--green-deep)',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const rulesStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginTop: '6px',
};

const goldDivider: React.CSSProperties = {
  height: '1px',
  background: 'var(--gold)',
  opacity: 0.35,
  margin: '2rem 0',
};

const noResultsStyle: React.CSSProperties = {
  fontFamily: "'Libre Baskerville', serif",
  fontSize: '14px',
  fontStyle: 'italic',
  color: 'var(--text-muted)',
  margin: '1rem 0 0',
};

const resultRowStyle: React.CSSProperties = {
  fontFamily: "'Libre Baskerville', serif",
  fontSize: '15px',
  color: 'var(--text-dark)',
  lineHeight: 1.7,
  marginTop: '1rem',
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color: 'var(--gold)',
  display: 'inline-block',
  minWidth: '90px',
};

const th: React.CSSProperties = {
  padding: '7px 12px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  textAlign: 'left',
  borderBottom: '2px solid rgba(45,90,61,.12)',
  whiteSpace: 'nowrap',
};

const td: React.CSSProperties = {
  padding: '8px 12px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  color: 'var(--text-dark)',
  borderBottom: '1px solid rgba(45,90,61,.06)',
};

// ── Component helpers ──────────────────────────────────────────────────────────

function SectionIcon({ icon }: { icon: string | null }) {
  if (icon) {
    return <Image src={icon} alt="" width={32} height={32} style={{ flexShrink: 0 }} />;
  }
  return (
    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--gold)', fontWeight: 500, lineHeight: 1 }}>
      ❧
    </span>
  );
}

function ResultBlock({ result }: { result?: CompetitionResult }) {
  if (!result || (!result.winner && !result.runnerUp && !result.note)) {
    return <p style={noResultsStyle}>No results recorded</p>;
  }
  return (
    <div style={resultRowStyle}>
      {result.winner && (
        <div><span style={labelStyle}>Winner</span>{result.winner}</div>
      )}
      {result.runnerUp && (
        <div><span style={labelStyle}>Runner-up</span>{result.runnerUp}</div>
      )}
      {result.semifinalists && (
        <div><span style={labelStyle}>Semi-finals</span>{result.semifinalists.join(' · ')}</div>
      )}
      {result.note && (
        <div style={{ marginTop: '6px', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '13px' }}>
          {result.note}
        </div>
      )}
    </div>
  );
}

function KnockoutBlock({ data }: { data: KnockoutResult | null }) {
  if (!data?.winner && !data?.runnerUp) return <p style={noResultsStyle}>No results recorded</p>;
  return (
    <div style={resultRowStyle}>
      {data?.winner && <div><span style={labelStyle}>Winner</span>{data.winner}</div>}
      {data?.runnerUp && <div><span style={labelStyle}>Runner-up</span>{data.runnerUp}</div>}
      {data?.semifinalists && <div><span style={labelStyle}>Semi-finals</span>{data.semifinalists.join(' · ')}</div>}
    </div>
  );
}

function ManserLeaderboard({ data }: { data: { winner?: string; leaderboard: ManserEntry[] } | null }) {
  if (!data || data.leaderboard.length === 0) return <p style={noResultsStyle}>No results recorded</p>;
  return (
    <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: '420px' }}>
        <thead>
          <tr>
            <th style={{ ...th, width: '28px', textAlign: 'center' }}>#</th>
            <th style={th}>Player</th>
            <th style={{ ...th, textAlign: 'right' }}>Hdcp</th>
            <th style={{ ...th, textAlign: 'right' }}>Games</th>
            <th style={{ ...th, textAlign: 'right' }}>Points</th>
            <th style={{ ...th, textAlign: 'right' }}>Avg</th>
          </tr>
        </thead>
        <tbody>
          {data.leaderboard.map((e, i) => (
            <tr key={e.player} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(45,90,61,.018)' }}>
              <td style={{ ...td, textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>{i + 1}</td>
              <td style={{ ...td, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? 'var(--green-deep)' : 'var(--text-dark)' }}>
                {e.player}{i === 0 && <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--gold)', fontWeight: 700 }}>WINNER</span>}
              </td>
              <td style={{ ...td, textAlign: 'right', color: 'var(--text-muted)', fontSize: '12px' }}>{e.handicap ?? '—'}</td>
              <td style={{ ...td, textAlign: 'right' }}>{e.games}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{e.totalPoints}</td>
              <td style={{ ...td, textAlign: 'right', color: 'var(--text-muted)' }}>{e.avgPoints.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RRLeaderboard({ data, label }: { data: { winner?: string; leaderboard: RREntry[] } | null; label: string }) {
  if (!data || data.leaderboard.length === 0) return <p style={noResultsStyle}>No results recorded</p>;
  return (
    <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: '380px' }}>
        <thead>
          <tr>
            <th style={{ ...th, width: '28px', textAlign: 'center' }}>#</th>
            <th style={th}>Player</th>
            <th style={{ ...th, textAlign: 'right' }}>Games</th>
            <th style={{ ...th, textAlign: 'right' }}>Points</th>
            <th style={{ ...th, textAlign: 'right' }}>Avg</th>
          </tr>
        </thead>
        <tbody>
          {data.leaderboard.map((e, i) => (
            <tr key={e.player} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(45,90,61,.018)' }}>
              <td style={{ ...td, textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>{i + 1}</td>
              <td style={{ ...td, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? 'var(--green-deep)' : 'var(--text-dark)' }}>
                {e.player}{i === 0 && <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--gold)', fontWeight: 700 }}>WINNER</span>}
              </td>
              <td style={{ ...td, textAlign: 'right' }}>{e.games}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{e.totalPoints}</td>
              <td style={{ ...td, textAlign: 'right', color: 'var(--text-muted)' }}>{e.avgPoints.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)', marginTop: '.5rem' }}>
        {label}
      </p>
    </div>
  );
}

function OverallLeaderboard({ data }: { data: OverallEntry[] | null }) {
  if (!data || data.length === 0) return <p style={noResultsStyle}>No results recorded</p>;
  return (
    <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: '480px' }}>
        <thead>
          <tr>
            <th style={{ ...th, width: '28px', textAlign: 'center' }}>#</th>
            <th style={th}>Player</th>
            <th style={{ ...th, textAlign: 'right' }}>Played</th>
            <th style={{ ...th, textAlign: 'right' }}>Won</th>
            <th style={{ ...th, textAlign: 'right' }}>Lost</th>
            <th style={{ ...th, textAlign: 'right' }}>Drawn</th>
            <th style={{ ...th, textAlign: 'right' }}>Win %</th>
          </tr>
        </thead>
        <tbody>
          {data.map((e, i) => (
            <tr key={e.player} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(45,90,61,.018)' }}>
              <td style={{ ...td, textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>{i + 1}</td>
              <td style={{ ...td, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? 'var(--green-deep)' : 'var(--text-dark)' }}>
                {e.player}{i === 0 && <span style={{ marginLeft: '6px', fontSize: '10px', color: 'var(--gold)', fontWeight: 700 }}>LEADER</span>}
              </td>
              <td style={{ ...td, textAlign: 'right', color: 'var(--text-muted)' }}>{e.played}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 600, color: '#2e7d32' }}>{e.wins}</td>
              <td style={{ ...td, textAlign: 'right', color: '#c0392b' }}>{e.losses}</td>
              <td style={{ ...td, textAlign: 'right', color: 'var(--text-muted)' }}>{e.draws}</td>
              <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{e.winPct.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function YearResultsPage({ params }: { params: Promise<{ year: string }> }) {
  const { year: yearParam } = await params;
  const year = Number(yearParam);

  if (!VALID_YEARS.includes(year)) notFound();

  const isDbYear = DB_YEARS.includes(year);

  // Fetch DB data for DB years
  let dbRow: DbRow | null = null;
  if (isDbYear) {
    const { data } = await supabaseAdmin
      .from('archived_seasons')
      .select('cup, shield, pairs, silver_fox, manser, plus_cup, ladies_day, overall_leaderboard')
      .eq('year', year)
      .maybeSingle();
    dbRow = data as DbRow | null;
  }

  // Static data for non-DB years
  const results = !isDbYear ? getYearResults(year) : undefined;

  const staticSections = [
    {
      id: 'cup',
      label: 'The Cup',
      fullName: 'The Fisher Cup',
      rules: 'No handicap · games to 21 points',
      icon: '/trophies/cup-icon.svg',
      result: results?.cup,
    },
    {
      id: 'shield',
      label: 'The Shield',
      fullName: 'The Hurlingham Shield',
      rules: 'Full handicap · games to 21 points',
      icon: '/trophies/shield-icon.svg',
      result: results?.shield,
    },
    {
      id: 'silver-fox',
      label: 'Silver Fox',
      fullName: 'The Silver Fox Trophy',
      rules: 'Handicap −6 only · first to 7 points',
      icon: '/trophies/silver-fox-icon.svg',
      result: results?.silverFox,
    },
    {
      id: 'manser',
      label: 'Manser Cup',
      fullName: 'The Manser Cup',
      rules: 'Round robin · games to 11 points · half handicap',
      icon: null,
      result: results?.manser,
    },
    {
      id: 'pairs',
      label: 'Pairs Cup',
      fullName: 'The Pairs Cup',
      rules: 'Combined half handicap · early rounds to 15 pts, semi-finals & final to 21 pts',
      icon: null,
      result: results?.pairs,
    },
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* ── Green header ── */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a
              href="/members/archive"
              className="section-tag"
              style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}
            >
              Archive
            </a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              {year} <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Season Results</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              Final competition results for the {year} season at Barnes Bowling Club.
            </p>
          </div>
        </div>

        {/* ── Competition sections ── */}
        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>

          {isDbYear ? (
            /* ── DB-backed year (2026+) with full leaderboards ── */
            dbRow ? (
              <>
                {/* Knockout competitions */}
                {[
                  { id: 'cup', fullName: 'The Fisher Cup', rules: 'No handicap · games to 21 points', icon: '/trophies/cup-icon.svg', data: dbRow.cup },
                  { id: 'shield', fullName: 'The Hurlingham Shield', rules: 'Full handicap · games to 21 points', icon: '/trophies/shield-icon.svg', data: dbRow.shield },
                  { id: 'pairs', fullName: 'The Pairs Cup', rules: 'Combined half handicap · early rounds to 15 pts, semi-finals & final to 21 pts', icon: null, data: dbRow.pairs },
                  { id: 'silver-fox', fullName: 'The Silver Fox Trophy', rules: 'Handicap −6 only · first to 7 points', icon: '/trophies/silver-fox-icon.svg', data: dbRow.silver_fox },
                ].map((s, i) => (
                  <section key={s.id} id={s.id}>
                    {i > 0 && <div style={goldDivider} />}
                    <div>
                      <h2 style={headingStyle}>
                        <SectionIcon icon={s.icon} />
                        {s.fullName}
                      </h2>
                      <p style={rulesStyle}>{s.rules}</p>
                    </div>
                    <KnockoutBlock data={s.data} />
                  </section>
                ))}

                {/* Manser Cup — full leaderboard */}
                <div style={goldDivider} />
                <section id="manser">
                  <div>
                    <h2 style={headingStyle}>
                      <SectionIcon icon={null} />
                      The Manser Cup
                    </h2>
                    <p style={rulesStyle}>Round robin · games to 11 points · half handicap</p>
                  </div>
                  <ManserLeaderboard data={dbRow.manser} />
                </section>

                {/* Plus Cup — full leaderboard */}
                <div style={goldDivider} />
                <section id="plus-cup">
                  <div>
                    <h2 style={headingStyle}>
                      <SectionIcon icon={null} />
                      Plus Cup
                    </h2>
                    <p style={rulesStyle}>Round robin · total points</p>
                  </div>
                  <RRLeaderboard data={dbRow.plus_cup} label="Ranked by total points scored." />
                </section>

                {/* Ladies Day — full leaderboard */}
                <div style={goldDivider} />
                <section id="ladies-day">
                  <div>
                    <h2 style={headingStyle}>
                      <SectionIcon icon={null} />
                      Ladies Day
                    </h2>
                    <p style={rulesStyle}>Round robin · average points</p>
                  </div>
                  <RRLeaderboard data={dbRow.ladies_day} label="Ranked by average points per game." />
                </section>

                {/* Overall leaderboard */}
                <div style={goldDivider} />
                <section id="overall">
                  <div>
                    <h2 style={headingStyle}>
                      <SectionIcon icon={null} />
                      Overall Season Leaderboard
                    </h2>
                    <p style={rulesStyle}>All competitions combined · ranked by wins then win %</p>
                  </div>
                  <OverallLeaderboard data={dbRow.overall_leaderboard} />
                </section>
              </>
            ) : (
              <p style={noResultsStyle}>Season results have not been archived yet.</p>
            )
          ) : (
            /* ── Static data year ── */
            staticSections.map((section, i) => (
              <section key={section.id} id={section.id}>
                {i > 0 && <div style={goldDivider} />}
                <div>
                  <h2 style={headingStyle}>
                    <SectionIcon icon={section.icon} />
                    {section.fullName}
                  </h2>
                  <p style={rulesStyle}>{section.rules}</p>
                </div>
                <ResultBlock result={section.result} />
              </section>
            ))
          )}

          {/* Back link */}
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(45,90,61,.1)' }}>
            <a
              href="/members/archive"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: 'var(--green-mid)',
                textDecoration: 'none',
                letterSpacing: '.05em',
              }}
            >
              ← Back to Archive
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
