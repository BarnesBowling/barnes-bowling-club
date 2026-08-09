'use client';

import { useState, useEffect } from 'react';
import { EVENTS, TBC_EVENTS, type CalEvent, type Category } from '@/data/season-calendar-2026';

const GOLD       = '#c9a84c';
const GREEN_DEEP = '#1b3b26';

const CATEGORY_META: Record<Category, { label: string; dot: string; badge: string; text: string }> = {
  competition: { label: 'Competition', dot: GOLD,       badge: 'rgba(201,168,76,.12)', text: '#9a7a2a' },
  match:       { label: 'Match',       dot: '#2980b9',  badge: 'rgba(41,128,185,.1)',  text: '#2980b9' },
  social:      { label: 'Social',      dot: '#3d7a52',  badge: 'rgba(45,90,61,.08)',   text: '#2d5a3d' },
  external:    { label: 'External',    dot: '#7a6040',  badge: 'rgba(120,95,60,.08)',  text: '#7a6040' },
  admin:       { label: 'Admin',       dot: '#888',     badge: 'rgba(0,0,0,.05)',      text: '#666'    },
  deadline:    { label: 'Deadline',    dot: '#c0392b',  badge: 'rgba(192,57,43,.07)', text: '#c0392b' },
};

const COMP_LABELS: Record<string, string> = {
  shield: 'The Shield', cup: 'The Cup', pairs: 'Pairs', manser: 'Manser',
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export interface CompMatch {
  competition: string;
  player1: string;
  player2: string;
  player3?: string | null;
  player4?: string | null;
  date: string;
  time_slot: string;
}

type TLItem =
  | { kind: 'season'; ev: CalEvent; sortDay: number }
  | { kind: 'match'; m: CompMatch; sortDay: number };

interface Props {
  upcomingMatches: CompMatch[];
}

const linkBtn: React.CSSProperties = {
  padding: '6px 11px',
  border: '1px solid rgba(45,90,61,.2)',
  fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  fontSize: '12px',
  fontWeight: 300,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#272727',
  background: 'none',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

export function CalendarModal({ upcomingMatches }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Build merged timeline from current month onwards
  const now = new Date();
  const currentMonthOrder = now.getMonth() + 1;

  const monthItemsMap = new Map<number, { name: string; items: TLItem[] }>();

  for (const ev of EVENTS) {
    if (ev.monthOrder < currentMonthOrder) continue;
    const day = parseInt(ev.dateLabel);
    if (!monthItemsMap.has(ev.monthOrder)) {
      monthItemsMap.set(ev.monthOrder, { name: ev.month, items: [] });
    }
    monthItemsMap.get(ev.monthOrder)!.items.push({ kind: 'season', ev, sortDay: isNaN(day) ? 999 : day });
  }

  for (const m of upcomingMatches) {
    const parts = m.date.split('-').map(Number);
    const mo = parts[1];
    const d  = parts[2];
    if (!monthItemsMap.has(mo)) {
      monthItemsMap.set(mo, { name: MONTH_NAMES[mo - 1], items: [] });
    }
    monthItemsMap.get(mo)!.items.push({ kind: 'match', m, sortDay: d });
  }

  const mergedMonths = [...monthItemsMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, v]) => ({ ...v, items: v.items.slice().sort((a, b) => a.sortDay - b.sortDay) }));

  const compMeta = CATEGORY_META.competition;

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={linkBtn}>
        Season Calendar
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,.52)',
            zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#f5f0e8',
              width: '100%', maxWidth: '780px',
              maxHeight: '88vh',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 64px rgba(0,0,0,.35)',
            }}
          >
            {/* Header */}
            <div style={{
              background: GREEN_DEEP,
              padding: '20px 28px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(201,168,76,.8)', marginBottom: '4px' }}>
                  Barnes Bowling Club
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 400, color: '#f5f0e8', margin: 0, letterSpacing: '-.01em' }}>
                  Season Calendar <em style={{ color: GOLD, fontStyle: 'italic' }}>2026</em>
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close calendar"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(245,240,232,.55)', fontSize: '28px', lineHeight: 1,
                  padding: '4px 8px', flexShrink: 0,
                }}
              >×</button>
            </div>

            {/* Scrollable timeline */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '2rem 2.25rem 2.5rem' }}>

              {mergedMonths.map(({ name: monthName, items }) => (
                <section key={monthName} style={{ marginBottom: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 500, color: GREEN_DEEP, margin: 0 }}>
                      {monthName}
                    </h3>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(45,90,61,.12)' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {items.map((item, i) => {
                      const isLast = i === items.length - 1;
                      const rowStyle: React.CSSProperties = {
                        display: 'grid',
                        gridTemplateColumns: '72px 8px 1fr',
                        gap: '0 1.25rem',
                        paddingBottom: '1.25rem',
                        marginBottom: '1.25rem',
                        borderBottom: isLast ? 'none' : '1px solid rgba(45,90,61,.07)',
                        alignItems: 'start',
                      };

                      if (item.kind === 'season') {
                        const ev = item.ev;
                        const meta = CATEGORY_META[ev.category];
                        return (
                          <div key={`s-${i}`} style={{ ...rowStyle, opacity: ev.tbc ? 0.8 : 1 }}>
                            <div style={{ textAlign: 'right', paddingTop: '3px' }}>
                              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(27,59,38,.45)', lineHeight: 1.4 }}>
                                {ev.dayLabel}
                              </div>
                              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: ev.dateLabel.length > 2 ? '16px' : '22px', fontWeight: 300, color: GREEN_DEEP, lineHeight: 1, marginTop: '1px' }}>
                                {ev.dateLabel}
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '5px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: meta.dot }} />
                            </div>
                            <div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.5rem', marginBottom: ev.details ? '.35rem' : 0 }}>
                                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 500, color: GREEN_DEEP, lineHeight: 1.3 }}>
                                  {ev.title}
                                </span>
                                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: meta.text, background: meta.badge, border: `1px solid ${meta.dot}40`, padding: '2px 7px', whiteSpace: 'nowrap' }}>
                                  {meta.label}
                                </span>
                                {ev.bankHoliday && (
                                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '.08em', color: '#2980b9', background: 'rgba(41,128,185,.08)', border: '1px solid rgba(41,128,185,.25)', padding: '2px 7px', whiteSpace: 'nowrap' }}>
                                    Bank Holiday
                                  </span>
                                )}
                                {ev.tbc && (
                                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 600, letterSpacing: '.08em', color: 'rgba(27,59,38,.45)', border: '1px solid rgba(0,0,0,.12)', padding: '2px 7px', whiteSpace: 'nowrap' }}>
                                    TBC
                                  </span>
                                )}
                              </div>
                              {ev.details && (
                                <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', lineHeight: 1.7, color: 'rgba(27,59,38,.6)', margin: 0 }}>
                                  {ev.details}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      }

                      // Competition match row — gold
                      const m = item.m;
                      const weekday = new Date(m.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase();
                      const players = m.player3 && m.player4
                        ? `${m.player1} & ${m.player2} vs ${m.player3} & ${m.player4}`
                        : `${m.player1} vs ${m.player2}`;
                      return (
                        <div key={`m-${i}`} style={rowStyle}>
                          <div style={{ textAlign: 'right', paddingTop: '3px' }}>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(27,59,38,.45)', lineHeight: 1.4 }}>
                              {weekday}
                            </div>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '22px', fontWeight: 300, color: GREEN_DEEP, lineHeight: 1, marginTop: '1px' }}>
                              {item.sortDay}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '5px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: compMeta.dot }} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.5rem', marginBottom: '.35rem' }}>
                              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 500, color: GREEN_DEEP, lineHeight: 1.3 }}>
                                {COMP_LABELS[m.competition] ?? m.competition}
                              </span>
                              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: compMeta.text, background: compMeta.badge, border: `1px solid ${compMeta.dot}40`, padding: '2px 7px', whiteSpace: 'nowrap' }}>
                                {compMeta.label}
                              </span>
                            </div>
                            <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', lineHeight: 1.7, color: 'rgba(27,59,38,.6)', margin: 0 }}>
                              {players} · {m.time_slot}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}

              {/* TBC events */}
              {TBC_EVENTS.length > 0 && (
                <section style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 500, color: GREEN_DEEP, margin: 0 }}>
                      Date to be confirmed
                    </h3>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(45,90,61,.12)' }} />
                  </div>
                  {TBC_EVENTS.map((ev, i) => {
                    const meta = CATEGORY_META[ev.category as Category];
                    return (
                      <div key={i} style={{
                        display: 'grid', gridTemplateColumns: '72px 8px 1fr', gap: '0 1.25rem',
                        paddingBottom: '1rem', marginBottom: '1rem',
                        borderBottom: i < TBC_EVENTS.length - 1 ? '1px solid rgba(45,90,61,.07)' : 'none',
                        alignItems: 'start', opacity: 0.65,
                      }}>
                        <div style={{ textAlign: 'right', paddingTop: '3px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(27,59,38,.45)', fontStyle: 'italic' }}>TBC</div>
                        <div style={{ paddingTop: '5px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: meta.dot, opacity: 0.5 }} />
                        </div>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 500, color: GREEN_DEEP, paddingTop: '2px' }}>
                          {ev.title}
                        </span>
                      </div>
                    );
                  })}
                </section>
              )}

              {/* Footer */}
              <div style={{ padding: '1rem 1.5rem', background: 'rgba(45,90,61,.04)', borderLeft: '3px solid rgba(45,90,61,.2)' }}>
                <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '12px', lineHeight: 1.8, color: 'rgba(27,59,38,.55)', margin: 0 }}>
                  All dates are subject to change. TBC events confirmed by the secretary during the season.
                  Competition matches shown cover the next 31 days.{' '}
                  <a href="/members/calendar" style={{ color: GREEN_DEEP, textDecoration: 'underline' }} onClick={() => setOpen(false)}>
                    View full season calendar →
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
