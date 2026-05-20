'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getMyUpcomingBookings, type FixtureBooking } from '../book-a-game/actions';
import { EVENTS, TBC_EVENTS, type Category, type CalEvent } from '@/data/season-calendar-2026';

const CATEGORY_META: Record<Category, { label: string; dot: string; badge: string; text: string }> = {
  competition: { label: 'Competition', dot: '#c9a84c',       badge: 'rgba(201,168,76,.12)', text: '#9a7a2a' },
  match:       { label: 'Match',       dot: '#2980b9',       badge: 'rgba(41,128,185,.1)',  text: '#2980b9' },
  social:      { label: 'Social',      dot: '#3d7a52',       badge: 'rgba(45,90,61,.08)',   text: '#2d5a3d' },
  external:    { label: 'External',    dot: '#7a6040',       badge: 'rgba(120,95,60,.08)',  text: '#7a6040' },
  admin:       { label: 'Admin',       dot: '#888',          badge: 'rgba(0,0,0,.05)',      text: '#666'    },
  deadline:    { label: 'Deadline',    dot: '#c0392b',       badge: 'rgba(192,57,43,.07)', text: '#c0392b' },
};

// monthOrder (1-12) → day → events
const CAL_MAP: Record<number, Record<number, CalEvent[]>> = {};
for (const ev of EVENTS) {
  const day = parseInt(ev.dateLabel);
  if (!isNaN(day)) {
    if (!CAL_MAP[ev.monthOrder]) CAL_MAP[ev.monthOrder] = {};
    if (!CAL_MAP[ev.monthOrder][day]) CAL_MAP[ev.monthOrder][day] = [];
    CAL_MAP[ev.monthOrder][day].push(ev);
  }
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekday(year: number, month: number) {
  // Monday = 0, Sunday = 6
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

const COMP_LABELS: Record<string, string> = {
  shield: 'The Shield', cup: 'The Cup', pairs: 'Pairs', manser: 'Manser',
};
function compLabel(id: string) { return COMP_LABELS[id] ?? id; }

function fmtPlayers(bm: FixtureBooking) {
  if (bm.player3 && bm.player4) return `${bm.player1} & ${bm.player2} vs ${bm.player3} & ${bm.player4}`;
  return `${bm.player1} vs ${bm.player2}`;
}

type TLItem =
  | { kind: 'season'; ev: CalEvent; sortDay: number }
  | { kind: 'booked'; bm: FixtureBooking; sortDay: number };

function groupByMonth(events: CalEvent[]) {
  const map = new Map<string, { order: number; events: CalEvent[] }>();
  for (const e of events) {
    if (!map.has(e.month)) map.set(e.month, { order: e.monthOrder, events: [] });
    map.get(e.month)!.events.push(e);
  }
  return [...map.entries()].sort((a, b) => a[1].order - b[1].order);
}

export default function CalendarPage() {
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth()); // 0-indexed

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }

  const monthOrder = calMonth + 1;
  const eventsForMonth = CAL_MAP[monthOrder] ?? {};
  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstWeekday = getFirstWeekday(calYear, calMonth);

  const isCurrentMonth = now.getFullYear() === calYear && now.getMonth() === calMonth;
  const todayDate = now.getDate();

  const [bookedMatches, setBookedMatches] = useState<FixtureBooking[]>([]);
  useEffect(() => {
    getMyUpcomingBookings().then(setBookedMatches).catch(() => setBookedMatches([]));
  }, []);

  const [filterCategory, setFilterCategory] = useState<Category | null>(null);
  const [selectedDay, setSelectedDay] = useState<{ day: number; month: number; year: number } | null>(null);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // Blue dots on mini-calendar for booked matches in the viewed month
  const bookedMatchDaysInView = new Set(
    bookedMatches
      .filter(bm => { const [y, mo] = bm.date.split('-').map(Number); return y === calYear && mo === calMonth + 1; })
      .map(bm => Number(bm.date.split('-')[2]))
  );

  const grouped = groupByMonth(EVENTS);

  // Merge season events + booked matches into a unified per-month timeline
  const monthItemsMap = new Map<number, { name: string; items: TLItem[] }>();
  for (const [monthName, { order, events }] of grouped) {
    if (!monthItemsMap.has(order)) monthItemsMap.set(order, { name: monthName, items: [] });
    for (const ev of events) {
      monthItemsMap.get(order)!.items.push({ kind: 'season', ev, sortDay: parseInt(ev.dateLabel) || 999 });
    }
  }
  for (const bm of bookedMatches) {
    const parts = bm.date.split('-').map(Number);
    const mo = parts[1];
    const d = parts[2];
    if (!monthItemsMap.has(mo)) monthItemsMap.set(mo, { name: MONTH_NAMES[mo - 1], items: [] });
    monthItemsMap.get(mo)!.items.push({ kind: 'booked', bm, sortDay: d });
  }
  const mergedMonths = [...monthItemsMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, v]) => ({ name: v.name, items: v.items.slice().sort((a, b) => a.sortDay - b.sortDay) }));

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '3rem', flexWrap: 'wrap' }}>

              {/* Left: title + description */}
              <div style={{ flex: '1 1 280px' }}>
                <a href="/members/dashboard" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>
                  Members Area
                </a>
                <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
                  Season <em style={{ color: 'var(--gold-light)', fontStyle: 'italic' }}>Calendar</em> <em style={{ color: 'var(--gold-light)' }}>2026</em>
                </h1>
                <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
                  All fixtures, competitions and social events for the 2026 season. Dates marked TBC will be confirmed during the season.
                </p>
              </div>

              {/* Right: mini calendar widget */}
              <div style={{ flexShrink: 0 }}>
                <div style={{
                  background: 'white',
                  borderRadius: '4px',
                  padding: '18px 18px 16px',
                  width: '328px',
                  boxShadow: '0 4px 24px rgba(0,0,0,.18)',
                }}>
                  {/* Calendar header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '13px' }}>
                    <button
                      onClick={prevMonth}
                      aria-label="Previous month"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--green-deep)', fontSize: '18px', borderRadius: '3px',
                        padding: 0,
                      }}
                    >
                      ‹
                    </button>
                    <div style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '16px',
                      fontWeight: 700,
                      letterSpacing: '.06em',
                      textTransform: 'uppercase',
                      color: 'var(--green-deep)',
                    }}>
                      {MONTH_NAMES[calMonth]} {calYear}
                    </div>
                    <button
                      onClick={nextMonth}
                      aria-label="Next month"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--green-deep)', fontSize: '18px', borderRadius: '3px',
                        padding: 0,
                      }}
                    >
                      ›
                    </button>
                  </div>

                  {/* Day name row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '3px' }}>
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                      <div key={i} style={{
                        textAlign: 'center',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '12px',
                        fontWeight: 700,
                        letterSpacing: '.06em',
                        color: i >= 5 ? 'rgba(45,90,61,.4)' : 'rgba(45,90,61,.55)',
                        paddingBottom: '5px',
                      }}>
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Day grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '1px' }}>
                    {cells.map((day, i) => {
                      if (!day) return <div key={i} />;
                      const dayEvents = eventsForMonth[day] ?? [];
                      const isToday = isCurrentMonth && day === todayDate;
                      const hasEvents = dayEvents.length > 0;
                      const hasBookedMatch = bookedMatchDaysInView.has(day);
                      return (
                        <div
                          key={i}
                          onClick={() => setSelectedDay({ day, month: calMonth, year: calYear })}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            paddingBottom: '3px',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{
                            width: '34px',
                            height: '34px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '14px',
                            fontWeight: isToday ? 700 : (hasEvents || hasBookedMatch) ? 600 : 400,
                            color: isToday ? 'white' : (hasEvents || hasBookedMatch) ? 'var(--green-deep)' : 'rgba(45,90,61,.5)',
                            background: isToday ? 'var(--green-deep)' : 'transparent',
                          }}>
                            {day}
                          </div>
                          {(hasEvents || hasBookedMatch) && (
                            <div style={{ display: 'flex', gap: '3px', marginTop: '1px', height: '5px' }}>
                              {dayEvents.slice(0, 2).map((ev, j) => (
                                <div key={j} style={{
                                  width: '5px',
                                  height: '5px',
                                  borderRadius: '50%',
                                  background: isToday ? 'rgba(255,255,255,0.7)' : CATEGORY_META[ev.category].dot,
                                  flexShrink: 0,
                                }} />
                              ))}
                              {hasBookedMatch && (
                                <div style={{
                                  width: '5px', height: '5px', borderRadius: '50%',
                                  background: isToday ? 'rgba(255,255,255,0.7)' : CATEGORY_META.match.dot,
                                  flexShrink: 0,
                                }} />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Event count footer */}
                  {Object.keys(eventsForMonth).length > 0 && (
                    <div style={{
                      marginTop: '13px',
                      paddingTop: '10px',
                      borderTop: '1px solid rgba(45,90,61,.1)',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '13px',
                      color: 'rgba(45,90,61,.55)',
                      letterSpacing: '.04em',
                    }}>
                      {Object.values(eventsForMonth).flat().length} event{Object.values(eventsForMonth).flat().length !== 1 ? 's' : ''} this month
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>

          {/* Legend */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1.125rem 2.25rem',
            marginBottom: '3rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid rgba(45,90,61,.1)',
          }}>
            {(Object.entries(CATEGORY_META) as [Category, typeof CATEGORY_META[Category]][]).map(([cat, meta]) => (
              <button
                key={meta.label}
                type="button"
                onClick={() => setFilterCategory(cat)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '9px',
                  fontFamily: "'DM Sans', sans-serif", fontSize: '17px', color: 'var(--text-mid)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'color .15s',
                }}
                title={`View all ${meta.label} events`}
              >
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: meta.dot, flexShrink: 0 }} />
                {meta.label}
              </button>
            ))}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', fontFamily: "'DM Sans', sans-serif", fontSize: '17px', color: 'var(--text-mid)' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '.08em', color: '#2980b9', border: '1px solid rgba(41,128,185,.3)', padding: '2px 8px' }}>BH</span>
              Bank Holiday
            </span>
          </div>

          {/* Timeline */}
          {mergedMonths.map(({ name: month, items }) => (
            <section key={month} style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 500, color: 'var(--green-deep)', margin: 0 }}>
                  {month}
                </h2>
                <div style={{ flex: 1, height: '1px', background: 'rgba(45,90,61,.12)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.map((item, i) => {
                  const isLast = i === items.length - 1;

                  if (item.kind === 'season') {
                    const ev = item.ev;
                    const meta = CATEGORY_META[ev.category];
                    return (
                      <div
                        key={`s-${i}`}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '72px 8px 1fr',
                          gap: '0 1.25rem',
                          paddingBottom: '1.25rem',
                          marginBottom: '1.25rem',
                          borderBottom: isLast ? 'none' : '1px solid rgba(45,90,61,.07)',
                          alignItems: 'start',
                          opacity: ev.tbc ? 0.8 : 1,
                        }}
                      >
                        <div style={{ textAlign: 'right', paddingTop: '3px' }}>
                          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                            {ev.dayLabel}
                          </div>
                          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: ev.dateLabel.length > 2 ? '16px' : '22px', fontWeight: 300, color: 'var(--green-deep)', lineHeight: 1, marginTop: '1px' }}>
                            {ev.dateLabel}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '5px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: meta.dot, flexShrink: 0 }} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.5rem', marginBottom: ev.details ? '.35rem' : 0 }}>
                            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 500, color: 'var(--green-deep)', lineHeight: 1.3 }}>
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
                              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--text-muted)', border: '1px solid rgba(0,0,0,.12)', padding: '2px 7px', whiteSpace: 'nowrap' }}>
                                TBC
                              </span>
                            )}
                          </div>
                          {ev.details && (
                            <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', lineHeight: 1.7, color: 'var(--text-mid)', margin: 0 }}>
                              {ev.details}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Booked match row — rendered as a standard Match category entry
                  const bm = item.bm;
                  const matchMeta = CATEGORY_META.match;
                  const dayStr = String(item.sortDay);
                  const weekday = new Date(bm.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase();
                  return (
                    <div
                      key={`b-${i}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '72px 8px 1fr',
                        gap: '0 1.25rem',
                        paddingBottom: '1.25rem',
                        marginBottom: '1.25rem',
                        borderBottom: isLast ? 'none' : '1px solid rgba(45,90,61,.07)',
                        alignItems: 'start',
                      }}
                    >
                      <div style={{ textAlign: 'right', paddingTop: '3px' }}>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {weekday}
                        </div>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '22px', fontWeight: 300, color: 'var(--green-deep)', lineHeight: 1, marginTop: '1px' }}>
                          {dayStr}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '5px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: matchMeta.dot, flexShrink: 0 }} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.5rem', marginBottom: '.35rem' }}>
                          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 500, color: 'var(--green-deep)', lineHeight: 1.3 }}>
                            {compLabel(bm.competition)}
                          </span>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: matchMeta.text, background: matchMeta.badge, border: `1px solid ${matchMeta.dot}40`, padding: '2px 7px', whiteSpace: 'nowrap' }}>
                            {matchMeta.label}
                          </span>
                        </div>
                        <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', lineHeight: 1.7, color: 'var(--text-mid)', margin: 0 }}>
                          {fmtPlayers(bm)} · {bm.time_slot}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {/* TBC — date unconfirmed */}
          {TBC_EVENTS.length > 0 && (
            <section style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 500, color: 'var(--green-deep)', margin: 0 }}>
                  Date to be confirmed
                </h2>
                <div style={{ flex: 1, height: '1px', background: 'rgba(45,90,61,.12)' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {TBC_EVENTS.map((ev, i) => {
                  const meta = CATEGORY_META[ev.category];
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '72px 8px 1fr', gap: '0 1.25rem', paddingBottom: '1.25rem', marginBottom: '1.25rem', borderBottom: i < TBC_EVENTS.length - 1 ? '1px solid rgba(45,90,61,.07)' : 'none', alignItems: 'start', opacity: 0.65 }}>
                      <div style={{ textAlign: 'right', paddingTop: '3px' }}>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>TBC</div>
                      </div>
                      <div style={{ paddingTop: '5px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: meta.dot, opacity: 0.5 }} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '.5rem' }}>
                          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 500, color: 'var(--green-deep)' }}>{ev.title}</span>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: meta.text, background: meta.badge, border: `1px solid ${meta.dot}40`, padding: '2px 7px' }}>{meta.label}</span>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--text-muted)', border: '1px solid rgba(0,0,0,.12)', padding: '2px 7px' }}>TBC</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Note */}
          <div style={{ padding: '1.25rem 1.75rem', background: 'rgba(45,90,61,.04)', borderLeft: '3px solid rgba(45,90,61,.2)' }}>
            <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', lineHeight: 1.8, color: 'var(--text-mid)', margin: 0 }}>
              All dates and times are subject to change. TBC events will be confirmed by the secretary during the season.
              For the latest information contact the club secretary or check the notice board at Sun Inn.
            </p>
          </div>

          {/* Back link */}
          <div style={{ marginTop: '3rem' }}>
            <a href="/members/dashboard" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--green-mid)', textDecoration: 'none', letterSpacing: '.05em' }}>
              ← Back to dashboard
            </a>
          </div>

        </div>
      </main>

      {/* Day detail popup */}
      {selectedDay && (() => {
        const { day, month, year } = selectedDay;
        const dayEvents = CAL_MAP[month + 1]?.[day] ?? [];
        const dayBookedMatches = bookedMatches.filter(bm => {
          const parts = bm.date.split('-').map(Number);
          return parts[0] === year && parts[1] === month + 1 && parts[2] === day;
        });
        const hasAnything = dayEvents.length > 0 || dayBookedMatches.length > 0;
        const fullDateLabel = new Date(year, month, day).toLocaleDateString('en-GB', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        });
        return (
          <div
            onClick={() => setSelectedDay(null)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,.45)',
              zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--cream, #f5f0e8)',
                maxWidth: '520px', width: '100%',
                maxHeight: '80vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 12px 48px rgba(0,0,0,.28)',
              }}
            >
              {/* Header */}
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid rgba(45,90,61,.1)',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem',
                flexShrink: 0,
              }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 500, color: 'var(--green-deep)', margin: 0, lineHeight: 1.3 }}>
                  {fullDateLabel}
                </h3>
                <button
                  onClick={() => setSelectedDay(null)}
                  aria-label="Close"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '4px 6px', color: 'var(--text-muted)',
                    fontSize: '22px', lineHeight: 1, flexShrink: 0,
                  }}
                >×</button>
              </div>

              {/* Content */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {!hasAnything ? (
                  <div style={{ padding: '2rem 1.5rem', fontFamily: "'Libre Baskerville', serif", fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No events scheduled for this date.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(45,90,61,.06)' }}>
                    {dayEvents.map((ev, i) => {
                      const meta = CATEGORY_META[ev.category];
                      return (
                        <div key={i} style={{ background: 'var(--cream)', padding: '1.1rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '0.45rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: meta.dot, flexShrink: 0 }} />
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: meta.text, background: meta.badge, border: `1px solid ${meta.dot}40`, padding: '2px 7px' }}>
                              {meta.label}
                            </span>
                            {ev.bankHoliday && (
                              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '.08em', color: '#2980b9', background: 'rgba(41,128,185,.08)', border: '1px solid rgba(41,128,185,.25)', padding: '2px 7px' }}>
                                Bank Holiday
                              </span>
                            )}
                            {ev.tbc && (
                              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--text-muted)', border: '1px solid rgba(0,0,0,.12)', padding: '2px 7px' }}>
                                TBC
                              </span>
                            )}
                          </div>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 500, color: 'var(--green-deep)', marginBottom: ev.details ? '0.35rem' : 0 }}>
                            {ev.title}
                          </div>
                          {ev.details && (
                            <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', lineHeight: 1.7, color: 'var(--text-mid)', margin: 0 }}>
                              {ev.details}
                            </p>
                          )}
                        </div>
                      );
                    })}
                    {dayBookedMatches.map((bm, i) => {
                      const matchMeta = CATEGORY_META.match;
                      return (
                        <div key={`bm-${i}`} style={{ background: 'var(--cream)', padding: '1.1rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.45rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: matchMeta.dot, flexShrink: 0 }} />
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: matchMeta.text, background: matchMeta.badge, border: `1px solid ${matchMeta.dot}40`, padding: '2px 7px' }}>
                              {matchMeta.label}
                            </span>
                          </div>
                          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 500, color: 'var(--green-deep)', marginBottom: '0.35rem' }}>
                            {compLabel(bm.competition)}
                          </div>
                          <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', lineHeight: 1.7, color: 'var(--text-mid)', margin: 0 }}>
                            {fmtPlayers(bm)} · {bm.time_slot}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Category filter popup */}
      {filterCategory && (() => {
        const meta = CATEGORY_META[filterCategory];
        const eventsInCat = EVENTS.filter(ev => ev.category === filterCategory);
        const tbcInCat = TBC_EVENTS.filter(ev => ev.category === filterCategory);
        const total = eventsInCat.length + tbcInCat.length;
        return (
          <div
            onClick={() => setFilterCategory(null)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,.45)',
              zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--cream, #f5f0e8)',
                maxWidth: '480px', width: '100%',
                maxHeight: '80vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 12px 48px rgba(0,0,0,.28)',
              }}
            >
              {/* Modal header */}
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid rgba(45,90,61,.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: meta.dot, flexShrink: 0 }} />
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 500, color: 'var(--green-deep)', margin: 0 }}>
                    {meta.label} events
                  </h3>
                </div>
                <button
                  onClick={() => setFilterCategory(null)}
                  aria-label="Close"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '4px 6px', color: 'var(--text-muted)',
                    fontSize: '22px', lineHeight: 1, flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </div>

              {/* Event list */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {total === 0 ? (
                  <div style={{ padding: '2rem 1.5rem', fontFamily: "'Libre Baskerville', serif", fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    No events in this category.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(45,90,61,.06)' }}>
                    {eventsInCat.map((ev, i) => (
                      <div key={i} style={{
                        background: 'var(--cream)',
                        padding: '0.875rem 1.5rem',
                        display: 'grid',
                        gridTemplateColumns: '6.5rem 1fr',
                        gap: '0 1rem',
                        alignItems: 'baseline',
                      }}>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, color: meta.text, letterSpacing: '.04em' }}>
                          {ev.dayLabel} {ev.dateLabel} {ev.month.slice(0, 3)}
                          {ev.tbc && <span style={{ marginLeft: '5px', fontWeight: 400, color: 'var(--text-muted)' }}>·&nbsp;TBC</span>}
                        </div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 500, color: 'var(--green-deep)' }}>
                          {ev.title}
                        </div>
                      </div>
                    ))}
                    {tbcInCat.map((ev, i) => (
                      <div key={`tbc-${i}`} style={{
                        background: 'var(--cream)',
                        padding: '0.875rem 1.5rem',
                        display: 'grid',
                        gridTemplateColumns: '6.5rem 1fr',
                        gap: '0 1rem',
                        alignItems: 'baseline',
                        opacity: 0.7,
                      }}>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Date TBC
                        </div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 500, color: 'var(--green-deep)' }}>
                          {ev.title}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid rgba(45,90,61,.08)', flexShrink: 0 }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '.06em' }}>
                  {total} event{total !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      <Footer />
    </>
  );
}
