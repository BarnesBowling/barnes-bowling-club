import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { notFound } from 'next/navigation';
import { getYearResults, VALID_YEARS, type CompetitionResult } from '@/data/past-results';
import Image from 'next/image';

export function generateStaticParams() {
  return VALID_YEARS.map((year) => ({ year: String(year) }));
}

export async function generateMetadata({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  return { title: `${year} Season Results — Barnes Bowling Club` };
}

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

// ── Result block ───────────────────────────────────────────────────────────────

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

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function YearResultsPage({ params }: { params: Promise<{ year: string }> }) {
  const { year: yearParam } = await params;
  const year = Number(yearParam);

  if (!VALID_YEARS.includes(year)) notFound();

  const results = getYearResults(year);

  const sections = [
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
      rules: 'Handicap −6 only · played over 6 ends',
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

          {sections.map((section, i) => (
            <section key={section.id} id={section.id}>

              {/* Gold divider between sections */}
              {i > 0 && <div style={goldDivider} />}

              {/* Section heading with optional icon */}
              <div>
                <h2 style={headingStyle}>
                  {section.icon && (
                    <Image
                      src={section.icon}
                      alt=""
                      width={32}
                      height={32}
                      style={{ flexShrink: 0 }}
                    />
                  )}
                  {!section.icon && (
                    <span style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '22px',
                      color: 'var(--gold)',
                      fontWeight: 500,
                      lineHeight: 1,
                    }}>
                      ❧
                    </span>
                  )}
                  {section.fullName}
                </h2>
                <p style={rulesStyle}>{section.rules}</p>
              </div>

              {/* Results or placeholder */}
              <ResultBlock result={section.result} />

            </section>
          ))}

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
