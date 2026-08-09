'use client';

import { useActionState } from 'react';
import { resetPassword } from './actions';

type State = { error?: string } | null;

const inp: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid rgba(45,90,61,.2)',
  fontFamily: "'Libre Baskerville', serif",
  fontSize: '15px',
  color: '#1a2e1f',
  background: '#fff',
  boxSizing: 'border-box',
};

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

export function SetPasswordForm() {
  const [state, action, pending] = useActionState<State, FormData>(resetPassword, null);

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <label style={labelStyle}>New Password</label>
        <input
          type="password"
          name="password"
          required
          autoComplete="new-password"
          placeholder="Minimum 8 characters"
          style={inp}
        />
      </div>

      <div>
        <label style={labelStyle}>Confirm Password</label>
        <input
          type="password"
          name="confirm_password"
          required
          autoComplete="new-password"
          placeholder="Repeat your password"
          style={inp}
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
        {pending ? 'Saving…' : 'Set New Password'}
      </button>
    </form>
  );
}
