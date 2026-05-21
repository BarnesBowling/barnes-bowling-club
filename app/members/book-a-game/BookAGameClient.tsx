'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  getBookingsForDate,
  getBookingsForRange,
  getMemberBookings,
  createFixtureBooking,
  cancelFixtureBooking,
  type FixtureBooking,
  type RangeBooking,
} from './actions';
import { MEMBERS } from '@/lib/handicapData';

const playerOptions: string[] = MEMBERS
  .filter(m => m.h[2026] !== undefined)
  .sort((a, b) => a.firstname.localeCompare(b.firstname))
  .map(m => `${m.firstname} ${m.surname}`);

const COMPETITIONS = [
  { id: 'shield', label: 'The Shield', isPairs: false },
  { id: 'cup',    label: 'The Cup',    isPairs: false },
  { id: 'pairs',  label: 'Pairs',      isPairs: true  },
  { id: 'manser', label: 'Manser',     isPairs: false },
] as const;

type CompId = typeof COMPETITIONS[number]['id'];

const COMP_COLORS: Record<string, { text: string; bg: string }> = {
  shield: { text: '#9a7a2a', bg: 'rgba(201,168,76,.15)' },
  cup:    { text: '#2980b9', bg: 'rgba(41,128,185,.12)' },
  pairs:  { text: '#2d5a3d', bg: 'rgba(45,90,61,.1)'   },
  manser: { text: '#7a6040', bg: 'rgba(120,95,60,.12)' },
};

const TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
];

function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function compLabel(comp: string) {
  return COMPETITIONS.find(c => c.id === comp)?.label ?? comp;
}

function formatBookingPlayers(b: FixtureBooking) {
  if (b.player3 && b.player4) {
    return `${b.player1} & ${b.player2} vs ${b.player3} & ${b.player4}`;
  }
  return `${b.player1} vs ${b.player2}`;
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 12px',
  minHeight: '44px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '14px',
  color: 'var(--text-dark)',
  background: 'white',
  border: '1px solid rgba(45,90,61,.25)',
  borderRadius: '2px',
  outline: 'none',
  boxSizing: 'border-box',
};

const sectionHeadStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  fontSize: '18px',
  fontWeight: 500,
  color: 'var(--green-deep)',
  marginBottom: '1rem',
};

// ─── Player Combobox ─────────────────────────────────────────────────────────

function PlayerCombobox({
  value,
  onChange,
  options,
  placeholder,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  style?: React.CSSProperties;
}) {
  const [inputText, setInputText] = useState(value);
  const [open, setOpen]           = useState(false);
  const [hiIdx, setHiIdx]         = useState(-1);
  const wrapRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef  = useRef<HTMLUListElement>(null);
  const latestRef = useRef({ value, options, inputText: value });

  // Keep ref in sync so the click-outside handler always sees current values
  useEffect(() => { latestRef.current = { value, options, inputText }; });

  // Sync display text when parent resets the value
  useEffect(() => { setInputText(value); }, [value]);

  const filtered = useMemo(() => {
    const q = inputText.toLowerCase();
    return q ? options.filter(n => n.toLowerCase().includes(q)) : options;
  }, [options, inputText]);

  // Close on click outside; revert to last confirmed selection if text is invalid
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        const { value: v, options: opts, inputText: txt } = latestRef.current;
        setOpen(false);
        setHiIdx(-1);
        if (!opts.includes(txt)) setInputText(v);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (open && hiIdx >= 0 && listRef.current) {
      const el = listRef.current.children[hiIdx] as HTMLElement | undefined;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [hiIdx, open]);

  function select(name: string) {
    setInputText(name);
    onChange(name);
    setOpen(false);
    setHiIdx(-1);
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', ...style }}>
      <input
        ref={inputRef}
        type="text"
        value={inputText}
        autoComplete="off"
        placeholder={placeholder}
        onFocus={() => { setOpen(true); setHiIdx(-1); inputRef.current?.select(); }}
        onChange={e => {
          const v = e.target.value;
          setInputText(v);
          setOpen(true);
          setHiIdx(v ? 0 : -1);
          if (!v) onChange('');
        }}
        onKeyDown={e => {
          if (!open) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setOpen(true); setHiIdx(0); }
            return;
          }
          if (e.key === 'ArrowDown')  { e.preventDefault(); setHiIdx(i => Math.min(i + 1, filtered.length - 1)); }
          else if (e.key === 'ArrowUp')   { e.preventDefault(); setHiIdx(i => Math.max(i - 1, 0)); }
          else if (e.key === 'Enter')  { e.preventDefault(); if (hiIdx >= 0 && filtered[hiIdx]) select(filtered[hiIdx]); }
          else if (e.key === 'Escape') { e.preventDefault(); setOpen(false); setInputText(latestRef.current.value); setHiIdx(-1); }
          else if (e.key === 'Tab' && hiIdx >= 0 && filtered[hiIdx]) { select(filtered[hiIdx]); }
        }}
        style={{ ...inputStyle, width: '100%' }}
      />
      {open && (
        <ul
          ref={listRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 200,
            listStyle: 'none',
            margin: 0,
            padding: 0,
            background: 'white',
            border: '1px solid rgba(45,90,61,.3)',
            borderTop: 'none',
            borderRadius: '0 0 2px 2px',
            boxShadow: '0 4px 16px rgba(0,0,0,.1)',
            maxHeight: '320px',
            overflowY: 'auto',
          }}
        >
          {filtered.length === 0 ? (
            <li style={{
              padding: '10px 12px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
            }}>
              No matches
            </li>
          ) : filtered.map((name, i) => (
            <li
              key={name}
              onMouseDown={e => { e.preventDefault(); select(name); }}
              onMouseEnter={() => setHiIdx(i)}
              style={{
                padding: '9px 12px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                cursor: 'pointer',
                background: i === hiIdx ? 'rgba(45,90,61,.08)' : 'white',
                color: i === hiIdx ? 'var(--green-deep)' : 'var(--text-dark)',
                fontWeight: i === hiIdx ? 500 : 400,
                borderBottom: i < filtered.length - 1 ? '1px solid rgba(45,90,61,.04)' : 'none',
              }}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Fixtures Calendar ─────────────────────────────────────────────────────

function FixturesCalendar({ selectedDate, refreshKey }: { selectedDate: string; refreshKey: number }) {
  const days14 = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return localDateStr(d);
    });
  }, []);

  const [calBookings, setCalBookings] = useState<Record<string, RangeBooking[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const allBookings = await getBookingsForRange(days14[0], days14[days14.length - 1]);
      const map: Record<string, RangeBooking[]> = {};
      for (const b of allBookings) {
        if (!map[b.date]) map[b.date] = [];
        map[b.date].push(b);
      }
      for (const day of Object.keys(map)) {
        map[day].sort((a, b) => a.time_slot.localeCompare(b.time_slot));
      }
      setCalBookings(map);
      setLoading(false);
    }
    load();
  }, [refreshKey, days14]);

  const todayStr = localDateStr(new Date());

  return (
    <div style={{
      border: '1.5px solid var(--green-deep)',
      position: 'sticky',
      top: '1.5rem',
      maxHeight: 'calc(100vh - 4rem)',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--cream, #ffffff)',
    }}>
      {/* Panel header */}
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: '1px solid rgba(45,90,61,.15)',
        flexShrink: 0,
        background: 'rgba(45,90,61,.03)',
      }}>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: '#c9a84c',
          marginBottom: '2px',
        }}>
          Fixtures
        </div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '16px',
          fontWeight: 500,
          color: 'var(--green-deep)',
        }}>
          Next 14 days
        </div>
        {/* Slot legend */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '8px' }}>
          {[
            { color: 'var(--green-deep)', label: 'Booked' },
            { color: 'rgba(45,90,61,.2)', label: 'Free' },
          ].map(({ color, label }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--text-muted)' }}>
              <span style={{ width: '14px', height: '7px', background: color, borderRadius: '1px', display: 'inline-block', flexShrink: 0 }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Scrollable day list */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {loading ? (
          <div style={{ padding: '2rem 1rem', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Loading fixtures…
          </div>
        ) : (
          days14.map((day, i) => {
            const dayBookings = calBookings[day] ?? [];
            const bookedSlots = new Set(dayBookings.map(b => b.time_slot));
            const freeCount = TIME_SLOTS.length - bookedSlots.size;
            const isSelected = day === selectedDate;
            const isToday = day === todayStr;

            const dateLabel = new Date(day + 'T12:00:00').toLocaleDateString('en-GB', {
              weekday: 'short', day: 'numeric', month: 'short',
            });

            return (
              <div
                key={day}
                style={{
                  padding: '11px 16px',
                  borderBottom: i < 13 ? '1px solid rgba(45,90,61,.08)' : 'none',
                  borderLeft: isSelected ? '3px solid var(--green-deep)' : '3px solid transparent',
                  background: isSelected ? 'rgba(45,90,61,.05)' : 'transparent',
                }}
              >
                {/* Day header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '12px',
                    fontWeight: 700,
                    color: isSelected ? 'var(--green-deep)' : 'var(--text-dark)',
                    textTransform: 'uppercase',
                    letterSpacing: '.04em',
                  }}>
                    {dateLabel}
                  </span>
                  {isToday && (
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '9px',
                      fontWeight: 700,
                      letterSpacing: '.08em',
                      textTransform: 'uppercase',
                      color: '#c9a84c',
                      border: '1px solid rgba(201,168,76,.4)',
                      padding: '1px 5px',
                    }}>
                      Today
                    </span>
                  )}
                  {isSelected && (
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '9px',
                      fontWeight: 700,
                      letterSpacing: '.06em',
                      textTransform: 'uppercase',
                      color: 'var(--green-deep)',
                      border: '1px solid rgba(45,90,61,.3)',
                      padding: '1px 5px',
                    }}>
                      Selected
                    </span>
                  )}
                </div>

                {/* Slot strip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: dayBookings.length > 0 ? '8px' : 0 }}>
                  {TIME_SLOTS.map(slot => {
                    const taken = bookedSlots.has(slot);
                    const isOwnSlot = taken && dayBookings.some(b => b.time_slot === slot && b.isOwn);
                    return (
                      <div
                        key={slot}
                        title={`${slot}${taken ? ' — Booked' : ' — Free'}`}
                        style={{
                          width: '14px',
                          height: '7px',
                          borderRadius: '1px',
                          background: taken
                            ? isOwnSlot ? '#2980b9' : 'var(--green-deep)'
                            : 'rgba(45,90,61,.2)',
                          flexShrink: 0,
                        }}
                      />
                    );
                  })}
                  <span style={{
                    marginLeft: '6px',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                  }}>
                    {freeCount === TIME_SLOTS.length ? 'All free' : `${freeCount}/${TIME_SLOTS.length} free`}
                  </span>
                </div>

                {/* Booked slot details */}
                {dayBookings.map(b => {
                  const colors = COMP_COLORS[b.competition] ?? { text: 'var(--text-mid)', bg: 'rgba(0,0,0,.05)' };
                  return (
                    <div key={b.id} style={{ display: 'flex', gap: '6px', alignItems: 'baseline', marginTop: '4px', flexWrap: 'wrap', ...(b.isOwn ? { borderLeft: '2px solid #2980b9', paddingLeft: '6px' } : {}) }}>
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--green-deep)',
                        minWidth: '2.75rem',
                        flexShrink: 0,
                      }}>
                        {b.time_slot}
                      </span>
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '.07em',
                        textTransform: 'uppercase',
                        color: colors.text,
                        background: colors.bg,
                        padding: '1px 6px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}>
                        {compLabel(b.competition)}
                      </span>
                      <span style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '11px',
                        color: 'var(--text-mid)',
                        lineHeight: 1.4,
                      }}>
                        {formatBookingPlayers(b)}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Main Client Component ──────────────────────────────────────────────────

export function BookAGameClient() {
  const [competition, setCompetition] = useState<CompId>('shield');
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');
  const [player3, setPlayer3] = useState('');
  const [player4, setPlayer4] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');

  const [mode, setMode] = useState<'book' | 'cancel'>('book');
  const [bookings, setBookings] = useState<FixtureBooking[]>([]);
  const [allBookings, setAllBookings] = useState<FixtureBooking[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const isPairs = COMPETITIONS.find(c => c.id === competition)?.isPairs ?? false;
  const takenSlots = new Set(bookings.map(b => b.time_slot));
  const today = localDateStr(new Date());

  const fetchBookings = useCallback(async (d: string) => {
    if (!d) return;
    setLoadingSlots(true);
    const dayBookings = await getBookingsForDate(d);
    setBookings(dayBookings);
    setLoadingSlots(false);
  }, []);

  useEffect(() => {
    setTimeSlot('');
    setBookings([]);
    if (date) fetchBookings(date);
  }, [date, fetchBookings]);

  const loadAllBookings = useCallback(async () => {
    const all = await getMemberBookings();
    setAllBookings(all);
  }, []);

  useEffect(() => {
    if (mode === 'cancel') loadAllBookings();
  }, [mode, loadAllBookings]);

  async function handleCancel(id: string) {
    const result = await cancelFixtureBooking(id);
    if (result.success) {
      await loadAllBookings();
      if (date) await fetchBookings(date);
      setRefreshKey(k => k + 1);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!competition || !player1.trim() || !player2.trim() || !date || !timeSlot) {
      setErrorMsg('Please fill in all required fields and select a time slot.');
      return;
    }
    if (isPairs && (!player3.trim() || !player4.trim())) {
      setErrorMsg('Please enter all four player names for Pairs.');
      return;
    }
    if (takenSlots.has(timeSlot)) {
      setErrorMsg('That time slot is already booked. Please choose another.');
      return;
    }

    setSubmitting(true);
    const result = await createFixtureBooking({
      competition,
      player1: player1.trim(),
      player2: player2.trim(),
      player3: isPairs ? player3.trim() : null,
      player4: isPairs ? player4.trim() : null,
      date,
      time_slot: timeSlot,
    });

    setSubmitting(false);
    if (!result.success) {
      setErrorMsg(result.error);
      setStatus('error');
      await fetchBookings(date);
      return;
    }

    setStatus('success');
    setPlayer1(''); setPlayer2(''); setPlayer3(''); setPlayer4('');
    setTimeSlot('');
    await fetchBookings(date);
    setRefreshKey(k => k + 1);
  }

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a href="/members/dashboard" className="section-tag" style={{ color: '#c9a84c', borderTopColor: '#c9a84c', textDecoration: 'none' }}>
              Members Area
            </a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Book a <em style={{ color: '#c9a84c', fontStyle: 'italic' }}>Match Game</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              Reserve a time slot for a Shield, Cup, Pairs or Manser fixture. One game per hour slot — check availability before booking.
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#ffffff', marginTop: '0.75rem', borderLeft: '2px solid #c9a84c', paddingLeft: '0.75rem' }}>
              Please note: A maximum of 2 match games can be booked per day per member.
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>
          <div className="book-game-layout">

            {/* ── Left: Booking form / Cancel ── */}
            <div>

              {/* Mode tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1.5px solid rgba(45,90,61,.12)', paddingBottom: '1.25rem' }}>
                {(['book', 'cancel'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); setStatus('idle'); setErrorMsg(''); }}
                    style={{
                      padding: '7px 16px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '.07em',
                      textTransform: 'uppercase',
                      border: '1.5px solid',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      borderColor: mode === m ? 'var(--green-deep)' : 'rgba(45,90,61,.25)',
                      background: mode === m ? 'var(--green-deep)' : 'transparent',
                      color: mode === m ? 'var(--cream)' : 'var(--text-muted)',
                    }}
                  >
                    {m === 'book' ? 'New Booking' : 'Cancel Booking'}
                  </button>
                ))}
              </div>

              {mode === 'book' && <form onSubmit={handleSubmit} noValidate>

                {/* Competition */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={sectionHeadStyle}>Choose competition</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {COMPETITIONS.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setCompetition(c.id); setStatus('idle'); }}
                        style={{
                          padding: '8px 16px',
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '12px',
                          fontWeight: 600,
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          border: '1.5px solid',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          transition: 'background 0.12s, color 0.12s',
                          borderColor: competition === c.id ? 'var(--green-deep)' : 'rgba(45,90,61,.25)',
                          background: competition === c.id ? 'var(--green-deep)' : 'transparent',
                          color: competition === c.id ? 'var(--cream)' : 'var(--text-muted)',
                        }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Players */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={sectionHeadStyle}>
                    {isPairs ? 'Players (2 vs 2)' : 'Players (1 vs 1)'}
                  </div>
                  {isPairs ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={labelStyle}>Player 1</label>
                          <PlayerCombobox
                            value={player1}
                            onChange={setPlayer1}
                            options={playerOptions.filter(n => n !== player2 && n !== player3 && n !== player4)}
                            placeholder="Type to search…"
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Player 2 (partner)</label>
                          <PlayerCombobox
                            value={player2}
                            onChange={setPlayer2}
                            options={playerOptions.filter(n => n !== player1 && n !== player3 && n !== player4)}
                            placeholder="Type to search…"
                          />
                        </div>
                      </div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'center', padding: '2px 0' }}>vs</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={labelStyle}>Player 3</label>
                          <PlayerCombobox
                            value={player3}
                            onChange={setPlayer3}
                            options={playerOptions.filter(n => n !== player1 && n !== player2 && n !== player4)}
                            placeholder="Type to search…"
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Player 4</label>
                          <PlayerCombobox
                            value={player4}
                            onChange={setPlayer4}
                            options={playerOptions.filter(n => n !== player1 && n !== player2 && n !== player3)}
                            placeholder="Type to search…"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div>
                        <label style={labelStyle}>Player 1</label>
                        <PlayerCombobox
                          value={player1}
                          onChange={setPlayer1}
                          options={playerOptions.filter(n => n !== player2)}
                          placeholder="Type to search…"
                          style={{ maxWidth: '280px' }}
                        />
                      </div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', paddingLeft: '2px' }}>vs</div>
                      <div>
                        <label style={labelStyle}>Player 2 (opponent)</label>
                        <PlayerCombobox
                          value={player2}
                          onChange={setPlayer2}
                          options={playerOptions.filter(n => n !== player1)}
                          placeholder="Type to search…"
                          style={{ maxWidth: '280px' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Date */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={sectionHeadStyle}>Date</div>
                  <div>
                    <label style={labelStyle}>Select date</label>
                    <input
                      type="date"
                      min={today}
                      style={{ ...inputStyle, maxWidth: '220px' }}
                      value={date}
                      onChange={e => { setDate(e.target.value); setStatus('idle'); setErrorMsg(''); }}
                      required
                    />
                  </div>
                </div>

                {/* Time slots */}
                {date && (
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={sectionHeadStyle}>Time slot</div>
                      {loadingSlots && (
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)' }}>
                          checking availability…
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {TIME_SLOTS.map(slot => {
                        const taken = takenSlots.has(slot);
                        const selected = timeSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={taken}
                            onClick={() => { if (!taken) { setTimeSlot(slot); setStatus('idle'); } }}
                            style={{
                              padding: '7px 13px',
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: '12px',
                              fontWeight: selected ? 700 : 500,
                              letterSpacing: '.04em',
                              border: '1.5px solid',
                              borderRadius: '2px',
                              cursor: taken ? 'not-allowed' : 'pointer',
                              borderColor: taken ? 'rgba(0,0,0,.1)' : selected ? 'var(--green-deep)' : 'rgba(45,90,61,.25)',
                              background: taken ? 'rgba(0,0,0,.04)' : selected ? 'var(--green-deep)' : 'transparent',
                              color: taken ? 'rgba(0,0,0,.3)' : selected ? 'var(--cream)' : 'var(--green-deep)',
                              textDecoration: taken ? 'line-through' : 'none',
                            }}
                          >
                            {slot}
                            {taken && <span style={{ fontSize: '9px', marginLeft: '4px', fontWeight: 400 }}>booked</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Existing bookings for selected date */}
                {date && bookings.length > 0 && (
                  <div style={{ marginBottom: '2rem', padding: '1.25rem 1.5rem', background: 'rgba(45,90,61,.03)', border: '1px solid rgba(45,90,61,.1)' }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Already booked on {new Date(date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {bookings.map(b => (
                        <div key={b.id} style={{ display: 'flex', gap: '1rem', fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--green-deep)', minWidth: '3rem' }}>{b.time_slot}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{compLabel(b.competition)}</span>
                          <span style={{ color: 'var(--text-mid)' }}>{formatBookingPlayers(b)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error */}
                {errorMsg && (
                  <div style={{ marginBottom: '1.25rem', padding: '10px 14px', background: 'rgba(192,57,43,.06)', border: '1px solid rgba(192,57,43,.2)', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#c0392b' }}>
                    {errorMsg}
                  </div>
                )}

                {/* Success */}
                {status === 'success' && (
                  <div style={{ marginBottom: '1.25rem', padding: '12px 16px', background: 'rgba(45,90,61,.07)', border: '1px solid rgba(45,90,61,.2)', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--green-deep)', fontWeight: 500 }}>
                    Booking confirmed. Your fixture has been registered.
                    <div style={{ marginTop: '6px', fontWeight: 400, color: 'var(--text-mid)' }}>
                      Match results are added by the Committee after each game.{' '}
                      <a href="/members/results" style={{ color: '#c9a84c', textDecoration: 'underline' }}>View past results</a>
                    </div>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || !date || !timeSlot}
                  style={{
                    padding: '11px 28px',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    border: 'none',
                    borderRadius: '2px',
                    cursor: submitting || !date || !timeSlot ? 'not-allowed' : 'pointer',
                    background: submitting || !date || !timeSlot ? 'rgba(45,90,61,.35)' : 'var(--green-deep)',
                    color: 'var(--cream)',
                  }}
                >
                  {submitting ? 'Booking…' : 'Submit Booking'}
                </button>

              </form>}

              {mode === 'cancel' && (
                <div>
                  <div style={{ ...sectionHeadStyle, marginBottom: '1.25rem' }}>Your upcoming bookings</div>
                  {allBookings.length === 0 ? (
                    <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No upcoming bookings found.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(45,90,61,.08)' }}>
                      {allBookings.map(b => {
                        const colors = COMP_COLORS[b.competition] ?? { text: 'var(--text-mid)', bg: 'rgba(0,0,0,.05)' };
                        const dateLabel = new Date(b.date + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
                        return (
                          <div key={b.id} style={{ background: 'var(--cream)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: colors.text, background: colors.bg, padding: '2px 7px' }}>
                                  {compLabel(b.competition)}
                                </span>
                                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 700, color: 'var(--green-deep)' }}>
                                  {dateLabel} · {b.time_slot}
                                </span>
                              </div>
                              <span style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', color: 'var(--text-mid)' }}>
                                {formatBookingPlayers(b)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCancel(b.id)}
                              style={{
                                padding: '6px 12px',
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: '10px',
                                fontWeight: 700,
                                letterSpacing: '.08em',
                                textTransform: 'uppercase',
                                border: '1px solid rgba(192,57,43,.35)',
                                borderRadius: '2px',
                                cursor: 'pointer',
                                background: 'transparent',
                                color: 'rgba(192,57,43,.9)',
                                flexShrink: 0,
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* ── Right: Fixtures calendar ── */}
            <div className="book-game-sidebar">
              <FixturesCalendar selectedDate={date} refreshKey={refreshKey} />
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
