'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'bbc_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 999,
      background: 'var(--green-deep)',
      borderTop: '1px solid rgba(201,168,76,.25)',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem',
    }}>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '13px',
        color: 'rgba(245,240,232,.75)',
        margin: 0,
        lineHeight: 1.6,
        flex: 1,
        minWidth: '200px',
      }}>
        Barnes Bowling Club uses cookies to improve your experience. For more information visit our{' '}
        <Link href="/privacy-policy" style={{ color: 'var(--gold-light)', textDecoration: 'underline' }}>
          Privacy Policy
        </Link>.
      </p>
      <button
        onClick={accept}
        style={{
          background: 'var(--gold)',
          border: 'none',
          color: 'var(--green-deep)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          padding: '8px 20px',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background .15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--gold-light)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--gold)')}
      >
        I Understand
      </button>
    </div>
  );
}
