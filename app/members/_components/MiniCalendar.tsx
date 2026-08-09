'use client';

import { useState, useEffect } from 'react';
import { getAllUpcomingBookings, type FixtureBooking } from '../book-a-game/actions';
import { EVENTS, type Category, type CalEvent } from '@/data/season-calendar-2026';

const CATEGORY_META: Record<Category, { label: string; dot: string; badge: string; text: string }> = {
  competition: { label: 'Competition', dot: '#c9a84c',       badge: 'rgba(201,168,76,.12)', text: '#9a7a2a' },
  match:       { label: 'Match',       dot: '#2980b9',       badge: 'rgba(41,128,185,.1)',  text: '#2980b9' },
  social:      { label: 'Social',      dot: '#3d7a52',       badge: 'rgba(45,90,61,.08)',   text: '#2d5a3d' },
  external:    { label: 'External',    dot: '#7a6040',       badge: 'rgba(120,95,60,.08)',  text: '#7a6040' },
  admin:       { label: 'Admin',       dot: '#888',          badge: 'rgba(0,0,0,.05)',      text: '#666'    },
  deadline:    { label: 'Deadline',    dot: '#c0392b',       badge: 'rgba(192,57,43,.07)', text: '#c0392b' },
};

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

export function MiniCalendar() {
  const now = new Date();
  const [calYear,  setCalYear]  = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [bookedMatches, setBookedMatches] = useState<FixtureBooking[]>([]);
  const [selectedDay, setSelectedDay] = useState<{ day: number; month: number; year: number } | null>(null);

  useEffect(() => {
    getAllUpcomingBookings().then(setBookedMatches).catch(() => setBookedMatches([]));
  }, []);

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }

  const monthOrder     = calMonth + 1;
  const eventsForMonth = CAL_MAP[monthOrder] ?? {};
  const daysInMonth    = getDaysInMonth(calYear, calMonth);
  const firstWeekday   = getFirstWeekday(calYear, calMonth);
  const isCurrentMonth = now.getFullYear() === calYear && now.getMonth() === calMonth;
  const todayDate      = now.getDate();

  const bookedMatchDaysInView = new Set(
    bookedMatches
      .filter(bm => { const [y, mo] = bm.date.split('-').map(Number); return y === calYear && mo === calMonth + 1; })
      .map(bm => Number(bm.date.split('-')[2]))
  );

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const eventCount = Object.values(eventsForMonth).flat().length;

  return (
    <>
      {/* ── Calendar widget ── */}
      <div style={{
        background: 'white',
        borderRadius: '4px',
        padding: '18px 18px 16px',
        width: '328px',
        boxShadow: '0 4px 24px rgba(0,0,0,.18)',
        flexShrink: 0,
      }}>
        {/* Month navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '13px' }}>
          <button
            onClick={prevMonth}
            aria-label="Previous month"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              width: '34px', height: '34px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--green-deep)', fontSize: '18px', borderRadius: '3px', padding: 0,
            }}
          >‹</button>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '16px', fontWeight: 700, letterSpacing: '.06em',
            textTransform: 'uppercase', color: 'var(--green-deep)',
          }}>
            {MONTH_NAMES[calMonth]} {calYear}
          </div>
          <button
            onClick={nextMonth}
            aria-label="Next month"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              width: '34px', height: '34px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--green-deep)', fontSize: '18px', borderRadius: '3px', padding: 0,
            }}
          >›</button>
        </div>

        {/* Day-name headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '3px' }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} style={{
              textAlign: 'center',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '12px', fontWeight: 700, letterSpacing: '.06em',
              color: i >= 5 ? 'rgba(45,90,61,.4)' : 'rgba(45,90,61,.55)',
              paddingBottom: '5px',
            }}>{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '1px' }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const dayEvents     = eventsForMonth[day] ?? [];
            const isToday       = isCurrentMonth && day === todayDate;
            const hasEvents     = dayEvents.length > 0;
            const hasBookedMatch = bookedMatchDaysInView.has(day);
            return (
              <div
                key={i}
                onClick={() => setSelectedDay({ day, month: calMonth, year: calYear })}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '3px', cursor: 'pointer' }}
              >
                <div style={{
                  width: '34px', height: '34px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                        width: '5px', height: '5px', borderRadius: '50%',
                        background: isToday ? 'rgba(255,255,255,0.7)' : CATEGORY_META[ev.category].dot,
                        flexShrink: 0,
                      }} />
                    ))}
                    {hasBookedMatch && (
                      <div style={{
                        width: '5px', height: '5px', borderRadius: '50%',
                        background: isToday ? 'rgba(255,255,255,0.7)' : CATEGORY_META.competition.dot,
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
        {eventCount > 0 && (
          <div style={{
            marginTop: '13px', paddingTop: '10px',
            borderTop: '1px solid rgba(45,90,61,.1)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px', color: 'rgba(45,90,61,.55)', letterSpacing: '.04em',
          }}>
            {eventCount} event{eventCount !== 1 ? 's' : ''} this month
          </div>
        )}
      </div>

      {/* ── Day detail popup ── */}
      {selectedDay && (() => {
        const { day, month, year } = selectedDay;
        const dayEvents       = CAL_MAP[month + 1]?.[day] ?? [];
        const dayBookedMatches = bookedMatches.filter(bm => {
          const [y, mo, d] = bm.date.split('-').map(Number);
          return y === year && mo === month + 1 && d === day;
        });
        const hasAnything   = dayEvents.length > 0 || dayBookedMatches.length > 0;
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
                maxWidth: '520px', width: '100%', maxHeight: '80vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 12px 48px rgba(0,0,0,.28)',
              }}
            >
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
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', color: 'var(--text-muted)', fontSize: '22px', lineHeight: 1, flexShrink: 0 }}
                >×</button>
              </div>

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
                      const matchMeta = CATEGORY_META.competition;
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
    </>
  );
}
