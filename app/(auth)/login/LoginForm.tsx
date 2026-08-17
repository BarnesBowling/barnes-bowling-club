'use client';
import { useActionState } from 'react';
import { signIn } from './actions';
import Link from 'next/link';

const GOLD = '#A89560';

const labelStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'rgba(27,59,38,.5)',
};

const inputStyle: React.CSSProperties = {
  padding: '12px 14px',
  border: '1.5px solid rgba(45,90,61,.2)',
  fontFamily: "'Libre Baskerville', serif",
  fontSize: '15px',
  color: 'var(--text-dark)',
  background: '#fff',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const linkStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  color: GOLD,
  textDecoration: 'none',
};

interface Props {
  redirectPath?: string;
}

export function LoginForm({ redirectPath = '' }: Props) {
  const [state, action] = useActionState(signIn, null);

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <input type="hidden" name="redirect" value={redirectPath} />

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
          Your BBC membership number — found on your membership card.
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={labelStyle}>Password</label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          style={inputStyle}
        />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#1b3b26', marginTop: '2px' }}>
          First time logging in? Use your registered email address as your password.
        </span>
      </div>

      {state?.error && (
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          color: '#c0392b',
          margin: 0,
          padding: '0.75rem 1rem',
          background: 'rgba(192,57,43,.06)',
          border: '1px solid rgba(192,57,43,.18)',
        }}>
          {state.error}
        </p>
      )}

      <div>
        <button
          type="submit"
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
            cursor: 'pointer',
          }}
        >
          Log In
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '0.5rem', borderTop: '1px solid rgba(45,90,61,.1)' }}>
        <Link href="/auth/first-login" style={linkStyle}>
          Logging on for the first time?
        </Link>
        <Link href="/auth/forgot-password" style={{ ...linkStyle, color: 'rgba(27,59,38,.55)' }}>
          Forgot my password?
        </Link>
      </div>
    </form>
  );
}
