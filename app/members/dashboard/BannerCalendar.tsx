'use client';

import { useState } from 'react';

const GOLD       = '#c9a84c';
const GREEN_DEEP = '#1b3b26';

const DAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTH_NAMES  = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const COMP_LABELS: Record<string, string> = {
  shield: 'The Shield', cup: 'The Cup', pairs: 'Pairs', manser: 'Manser',
};

export interface CompMatch {
  competition: string;
  player1: string;
  player2: string;
  player3?: string | null;
  player4?: string | null;
  date: string;
  time_slot: string;
}

interface Props { upcomingMatches: CompMatch[] }

export function BannerCalendar({ upcomingMatches }: Props) {
  const [zoomed,     setZoomed]     = useState(false);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();

  const matchMap = new Map<number, CompMatch[]>();
  for (const m of upcomingMatches) {
    const [y, mo, d] = m.date.split('-').map(Number);
    if (y === year && mo === month + 1) {
      if (!matchMap.has(d)) matchMap.set(d, []);
      matchMap.get(d)!.push(m);
    }
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow    = new Date(year, month, 1).getDay();
  const startOffset = firstDow === 0 ? 6 : firstDow - 1;
  const cells: (number | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const numRows = cells.length / 7;
  const today   = now.getDate();

  return (
    <>
      <style>{`
        .banner-cal { display: flex; flex-direction: column; }
        @media (max-width: 740px) { .banner-cal { display: none !important; } }
      `}</style>

      {/*
        align-self: stretch → takes the full height of the flex wrapper (banner - 2rem margin)
        aspect-ratio: 1/1  → width = height → perfect square
      */}
      <div
        className="banner-cal"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => { setZoomed(false); setHoveredDay(null); }}
        style={{
          alignSelf: 'stretch',
          aspectRatio: '1 / 1',
          transform: zoomed ? 'scale(1.8)' : 'scale(1)',
          transformOrigin: 'bottom right',
          transition: 'transform 0.2s ease',
          zIndex: zoomed ? 100 : 2,
          position: 'relative',
          cursor: 'default',
        }}
      >
        {/* Month label — white text on the dark green banner above the white card */}
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: '#ffffff',
          textAlign: 'center',
          flexShrink: 0,
          paddingBottom: '4px',
        }}>
          {MONTH_NAMES[month]} {year}
        </div>

        {/* White card — fills remaining height */}
        <div style={{
          flex: 1,
          minHeight: 0,
          background: '#fff',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Day-of-week headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '2px',
            flexShrink: 0,
            marginBottom: '4px',
          }}>
            {DAY_INITIALS.map((d, i) => (
              <div key={i} style={{
                textAlign: 'center',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '9px',
                fontWeight: 600,
                color: 'rgba(27,59,38,.45)',
              }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid — fills remaining height with equal rows */}
          <div style={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gridTemplateRows: `repeat(${numRows}, 1fr)`,
            gap: '2px',
          }}>
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;

              const matches  = matchMap.get(day) ?? [];
              const hasMatch = matches.length > 0;
              const isToday  = day === today;
              const isHov    = hoveredDay === day && zoomed && hasMatch;

              return (
                <div
                  key={i}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    borderRadius: '2px',
                    background: isToday ? 'rgba(201,168,76,.15)' : 'transparent',
                    border: isToday
                      ? '1px solid rgba(201,168,76,.5)'
                      : '1px solid transparent',
                  }}
                  onMouseEnter={() => { if (zoomed && hasMatch) setHoveredDay(day); }}
                >
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '11px',
                    fontWeight: isToday ? 700 : 400,
                    color: isToday ? GOLD : GREEN_DEEP,
                    lineHeight: 1,
                  }}>
                    {day}
                  </span>

                  {hasMatch && (
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {matches.slice(0, 3).map((_, j) => (
                        <div key={j} style={{
                          width: '4px', height: '4px',
                          borderRadius: '50%',
                          background: GOLD,
                        }} />
                      ))}
                    </div>
                  )}

                  {isHov && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 3px)',
                      right: 0,
                      width: '160px',
                      background: GREEN_DEEP,
                      border: '1px solid rgba(201,168,76,.4)',
                      padding: '8px 10px',
                      zIndex: 10,
                      boxShadow: '0 6px 20px rgba(0,0,0,.5)',
                      pointerEvents: 'none',
                    }}>
                      {matches.map((m, j) => {
                        const players = m.player3 && m.player4
                          ? `${m.player1} & ${m.player2} vs ${m.player3} & ${m.player4}`
                          : `${m.player1} vs ${m.player2}`;
                        return (
                          <div key={j} style={{
                            marginBottom: j < matches.length - 1 ? '8px' : 0,
                            paddingBottom: j < matches.length - 1 ? '8px' : 0,
                            borderBottom: j < matches.length - 1 ? '1px solid rgba(201,168,76,.15)' : 'none',
                          }}>
                            <div style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: '9px',
                              fontWeight: 700,
                              letterSpacing: '.08em',
                              textTransform: 'uppercase',
                              color: GOLD,
                              marginBottom: '2px',
                            }}>
                              {COMP_LABELS[m.competition] ?? m.competition}
                            </div>
                            <div style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: '8px',
                              color: GOLD,
                              marginBottom: '3px',
                            }}>
                              {m.time_slot}
                            </div>
                            <div style={{
                              fontFamily: "'Libre Baskerville', serif",
                              fontSize: '8.5px',
                              color: '#ffffff',
                              lineHeight: 1.5,
                            }}>
                              {players}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
