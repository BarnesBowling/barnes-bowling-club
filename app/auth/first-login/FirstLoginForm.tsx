'use client';
import { useActionState } from 'react';
import { beginSetup } from './actions';
import Link from 'next/link';

const GOLD = '#A89560';

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: 'rgba(27,59,38,.5)',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid rgba(45,90,61,.2)',
  fontFamily: "'Libre Baskerville', serif",
  fontSize: '15px',
  color: '#1a2e1f',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

export function FirstLoginForm() {
  const [state, action, pending] = useActionState(beginSetup, null);

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>Membership Number</label>
        <input
          name="member_number"
          type="text"
          required
          autoComplete="username"
          placeholder="e.g. BBCGB200"
          style={{ ...inputStyle, letterSpacing: '.05em' }}
        />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'rgba(27,59,38,.4)', marginTop: '2px' }}>
          Found on your membership card or welcome letter.
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>Email Address</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          style={inputStyle}
        />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'rgba(27,59,38,.4)', marginTop: '2px' }}>
          The email address registered with the club.
        </span>
      </div>

      {state?.error && (
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          color: '#c0392b',
          padding: '0.75rem 1rem',
          background: 'rgba(192,57,43,.06)',
          border: '1px solid rgba(192,57,43,.18)',
        }}>
          {state.error}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          style={{
            display: 'inline-block',
            padding: '13px 32px',
            background: GOLD,
            color: '#fff',
            border: 'none',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            cursor: pending ? 'default' : 'pointer',
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? 'Verifying…' : 'Continue →'}
        </button>
      </div>

      <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(45,90,61,.1)' }}>
        <Link
          href="/login"
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(27,59,38,.5)', textDecoration: 'none' }}
        >
          ← Back to sign in
        </Link>
      </div>
    </form>
  );
}
