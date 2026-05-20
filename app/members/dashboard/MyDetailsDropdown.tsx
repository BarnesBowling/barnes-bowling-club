'use client';

import { useState, useRef, useEffect } from 'react';

const linkStyle: React.CSSProperties = {
  padding: '6px 11px',
  border: '1px solid rgba(45,90,61,.2)',
  fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  fontSize: '12px',
  fontWeight: 300,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#272727',
  textDecoration: 'none',
  background: 'transparent',
  whiteSpace: 'nowrap',
  display: 'block',
};

export function MyDetailsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          ...linkStyle,
          cursor: 'pointer',
          border: '1px solid rgba(45,90,61,.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        My Details
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ width: 11, height: 11, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          background: '#fff',
          border: '1px solid rgba(45,90,61,.15)',
          boxShadow: '0 4px 16px rgba(0,0,0,.08)',
          zIndex: 100,
          minWidth: '160px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <a
            href="/members/my-details"
            onClick={() => setOpen(false)}
            style={{ ...linkStyle, border: 'none', borderBottom: '1px solid rgba(45,90,61,.08)', padding: '10px 14px' }}
          >
            My Details
          </a>
          <a
            href="/members/account"
            onClick={() => setOpen(false)}
            style={{ ...linkStyle, border: 'none', padding: '10px 14px' }}
          >
            My Account
          </a>
        </div>
      )}
    </div>
  );
}
