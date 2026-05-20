'use client';

import { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { YEARS, MEMBERS, fmt, getTrend } from '@/lib/handicapData';

const YEAR_HEADERS = ["'21", "'22", "'23", "'24", "'25", "'26"];

type SortMode = 'handicap' | 'alpha';

const MEMBERS_2026 = MEMBERS.filter(m => m.h[2026] !== undefined);

export default function HandicapsPage() {
  const [sortMode, setSortMode] = useState<SortMode>('handicap');

  const sortedMembers = useMemo(() => {
    if (sortMode === 'handicap') {
      return [...MEMBERS_2026].sort((a, b) => {
        const diff = (a.h[2026] as number) - (b.h[2026] as number);
        return diff !== 0 ? diff : a.surname.localeCompare(b.surname);
      });
    }
    return [...MEMBERS_2026].sort((a, b) => {
      const s = a.surname.localeCompare(b.surname);
      return s !== 0 ? s : a.firstname.localeCompare(b.firstname);
    });
  }, [sortMode]);

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a href="/members/dashboard" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>
              Members Area
            </a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Handicaps — <em style={{ color: 'var(--gold-light)' }}>2026 season</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              Current handicap standings for all registered players. Updated at the start of each season.
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>

          {/* Sort toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '1.25rem',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <span style={{ fontSize: '11px', letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-muted)', marginRight: '4px' }}>
              Sort
            </span>
            {(['handicap', 'alpha'] as SortMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setSortMode(mode)}
                style={{
                  padding: '5px 14px',
                  fontSize: '11px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  letterSpacing: '.07em',
                  textTransform: 'uppercase',
                  border: '1.5px solid',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                  borderColor: sortMode === mode ? 'var(--green-deep)' : 'rgba(45,90,61,.25)',
                  background: sortMode === mode ? 'var(--green-deep)' : 'transparent',
                  color: sortMode === mode ? 'var(--cream)' : 'var(--text-muted)',
                }}
              >
                {mode === 'handicap' ? '2026 Handicap' : 'A–Z Surname'}
              </button>
            ))}
          </div>

          {/* Leaderboard */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Libre Baskerville', serif" }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(45,90,61,.15)' }}>
                  {['#', 'Name', ...YEAR_HEADERS, 'Trend'].map((col, i) => (
                    <th key={col + i} style={{
                      padding: '10px 10px',
                      textAlign: col === 'Name' ? 'left' : 'center',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '.1em',
                      textTransform: 'uppercase',
                      color: col === "'26" ? 'var(--green-deep)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedMembers.map((m, i) => {
                  const t = getTrend(m);
                  const isTop3 = sortMode === 'handicap' && i < 3;
                  return (
                    <tr key={`${m.surname}-${m.firstname}`} style={{
                      borderBottom: '1px solid rgba(45,90,61,.07)',
                      background: isTop3 ? 'rgba(201,168,76,.04)' : 'transparent',
                    }}>
                      <td style={{ padding: '11px 10px', textAlign: 'center', width: '36px' }}>
                        {sortMode === 'handicap' && i === 0 ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '24px', height: '24px', borderRadius: '50%',
                            background: 'var(--gold)', color: 'var(--green-deep)',
                            fontSize: '11px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                          }}>1</span>
                        ) : (
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
                            {i + 1}
                          </span>
                        )}
                      </td>
                      <td style={{
                        padding: '11px 10px',
                        fontSize: '15px',
                        color: 'var(--text-dark)',
                        fontWeight: isTop3 ? 500 : 400,
                        whiteSpace: 'nowrap',
                      }}>
                        {m.surname}, {m.firstname}
                      </td>
                      {YEARS.map(y => (
                        <td key={y} style={{
                          padding: '11px 8px',
                          textAlign: 'center',
                          fontSize: y === 2026 ? '15px' : '13px',
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: y === 2026 ? 600 : 400,
                          color: m.h[y] === undefined
                            ? 'rgba(0,0,0,.18)'
                            : y === 2026
                              ? 'var(--green-deep)'
                              : 'var(--text-mid)',
                          letterSpacing: y === 2026 ? '.02em' : undefined,
                        }}>
                          {fmt(m.h[y])}
                        </td>
                      ))}
                      <td style={{
                        padding: '11px 10px',
                        textAlign: 'center',
                        fontSize: '13px',
                        color: t.color,
                        fontFamily: "'DM Sans', sans-serif",
                      }}>
                        {t.symbol}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Key */}
          <div style={{
            marginTop: '1.25rem',
            display: 'flex',
            gap: '1.5rem',
            flexWrap: 'wrap',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '11px',
            color: 'var(--text-muted)',
            letterSpacing: '.04em',
          }}>
            {[
              { sym: '▲', col: '#2d8a4e', label: 'improved' },
              { sym: '▼', col: '#c0392b', label: 'worsened' },
              { sym: '—', col: 'var(--text-muted)', label: 'unchanged' },
              { sym: '★', col: 'var(--gold)', label: 'new 2026' },
            ].map(({ sym, col, label }) => (
              <span key={label}><span style={{ color: col }}>{sym}</span> {label}</span>
            ))}
          </div>

          {/* How handicaps work */}
          <div style={{
            marginTop: '3rem',
            padding: '1.5rem 2rem',
            background: 'rgba(45,90,61,.04)',
            borderLeft: '3px solid rgba(45,90,61,.2)',
          }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--green-deep)',
              marginBottom: '8px',
            }}>
              About Barnes handicaps
            </div>
            <p style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: '13px',
              lineHeight: 1.8,
              color: 'var(--text-mid)',
              margin: 0,
            }}>
              Handicaps are reviewed by the committee at regular intervals throughout the season based on competitive results.
              A lower handicap number indicates a stronger player. Columns show each season from 2021 to 2026; a dash indicates the member was not registered that year.
              Contact the handicap committee if you have any queries about your standing.
            </p>
          </div>

          {/* Handicap Committee */}
          <div style={{ marginTop: '4rem', borderTop: '1.5px solid rgba(45,90,61,.12)', paddingTop: '2.5rem' }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '20px',
              fontWeight: 500,
              color: 'var(--green-deep)',
              marginBottom: '1.25rem',
            }}>
              Handicap Committee
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1px', background: 'rgba(45,90,61,.08)' }}>
              {['Alaric Evans', 'Mark Hunter', 'Judith Heaton', 'Catherine Mitrenas', 'Toby Steedman'].map(name => (
                <div key={name} style={{ background: 'var(--cream)', padding: '1rem 1.25rem', minWidth: '160px', flex: '1 0 160px' }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase' as const, color: 'var(--gold)', marginBottom: '4px' }}>Handicap Committee</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 500, color: 'var(--green-deep)' }}>{name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Back link */}
          <div style={{ marginTop: '3rem' }}>
            <a href="/members/dashboard" style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: 'var(--green-mid)',
              textDecoration: 'none',
              letterSpacing: '.05em',
            }}>
              ← Back to dashboard
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
