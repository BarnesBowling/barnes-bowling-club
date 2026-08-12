'use client';
import { useActionState } from 'react';
import { sendPasswordReset } from './actions';
import Link from 'next/link';

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '.1em',
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

const backLink: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  color: 'rgba(27,59,38,.5)',
  textDecoration: 'none',
};

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(sendPasswordReset, null);

  if (state?.noPassword) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          color: '#5c4a1e',
          padding: '10px 14px',
          background: 'rgba(201,168,76,.07)',
          borderLeft: '3px solid rgba(201,168,76,.6)',
          lineHeight: 1.6,
        }}>
          It looks like you haven&rsquo;t set up a password yet.{' '}
          Please use the{' '}
          <Link href="/auth/first-login" style={{ color: '#b5924a', textDecoration: 'underline' }}>
            Logging on for the first time?
          </Link>{' '}
          link to get started.
        </div>
        <Link href="/login" style={backLink}>← Back to sign in</Link>
      </div>
    );
  }

  if (state?.sent) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          color: '#1b5e20',
          padding: '10px 14px',
          background: 'rgba(46,125,50,.06)',
          borderLeft: '3px solid rgba(46,125,50,.4)',
          lineHeight: 1.6,
        }}>
          If that address is registered with the club, you&rsquo;ll receive a reset link shortly. Check your inbox and junk folder.
        </div>
        <Link href="/login" style={backLink}>← Back to sign in</Link>
      </div>
    );
  }

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <label style={labelStyle}>Email Address or Membership Number</label>
        <input
          name="identifier"
          type="text"
          required
          autoComplete="email"
          style={inputStyle}
          placeholder="e.g. your@email.com or BBCGB200"
        />
      </div>

      {state?.error && (
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          color: '#c0392b',
          padding: '10px 14px',
          background: 'rgba(192,57,43,.06)',
          borderLeft: '3px solid #c0392b',
        }}>
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        style={{
          padding: '13px',
          background: '#1b3b26',
          color: '#fff',
          border: 'none',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          cursor: pending ? 'default' : 'pointer',
          opacity: pending ? 0.7 : 1,
        }}
      >
        {pending ? 'Sending…' : 'Send Reset Link'}
      </button>

      <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(45,90,61,.1)' }}>
        <Link href="/login" style={backLink}>← Back to sign in</Link>
      </div>
    </form>
  );
}
