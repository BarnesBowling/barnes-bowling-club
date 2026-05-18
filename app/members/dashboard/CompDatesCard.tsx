'use client';

import { useState, useRef, useEffect } from 'react';

interface EventRow {
  id: string;
  event_date: string;
  title: string;
  location: string | null;
  description: string | null;
}

export function CompDatesCard({ events }: { events: EventRow[] }) {
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  if (!events || events.length === 0) return null;

  return (
    <div className="comp-dates-card" style={{ display: 'block', color: 'inherit', marginBottom: '3.5rem' }}>
      <section>
        {/* Heading row — dropdown trigger lives here only */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 500, color: 'var(--green-deep)' }}>
            Competition Dates
          </div>

          {/* View dropdown */}
          <div ref={dropRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setOpen(o => !o)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                color: 'var(--green-mid)',
                padding: 0,
              }}
            >
              View
              <svg
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ width: 10, height: 10, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {open && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                background: '#fff',
                border: '1px solid rgba(45,90,61,.15)',
                borderTop: '2px solid var(--green-deep)',
                boxShadow: '0 4px 16px rgba(0,0,0,.08)',
                zIndex: 100,
                minWidth: '180px',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <a
                  href="/members/competitions"
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'block',
                    padding: '10px 14px',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    color: 'var(--green-deep)',
                    textDecoration: 'none',
                    borderBottom: '1px solid rgba(45,90,61,.08)',
                  }}
                >
                  Competition Dates
                </a>
                <a
                  href="/members/results"
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'block',
                    padding: '10px 14px',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    color: 'var(--green-deep)',
                    textDecoration: 'none',
                  }}
                >
                  Results
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Events table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Libre Baskerville', serif" }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(45,90,61,.15)' }}>
                {['Date', 'Event', 'Location'].map((h) => (
                  <th key={h} style={{
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '10px',
                    fontWeight: 600,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase' as const,
                    color: 'var(--text-muted)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} style={{ borderBottom: '1px solid rgba(45,90,61,.07)' }}>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#c9a84c', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, whiteSpace: 'nowrap' as const }}>
                    {new Date(e.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: 'var(--text-dark)' }}>
                    {e.title}
                    {e.description && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif", marginTop: '3px', fontStyle: 'italic' }}>
                        {e.description}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>{e.location ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
