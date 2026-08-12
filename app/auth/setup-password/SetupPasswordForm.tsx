'use client';
import { useActionState } from 'react';
import { setupPassword } from './actions';

const GREEN_DEEP = '#1b3b26';
const GOLD       = '#c9a84c';

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
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '15px',
  color: '#1a2e1f',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

const helperStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '11px',
  color: 'rgba(27,59,38,.4)',
  marginTop: '5px',
};

export function SetupPasswordForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(setupPassword, null);

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <label style={labelStyle}>New Password</label>
        <input
          type="password"
          name="password"
          required
          autoComplete="new-password"
          style={inputStyle}
          placeholder="Minimum 8 characters"
        />
        <p style={helperStyle}>Must be at least 8 characters.</p>
      </div>

      <div>
        <label style={labelStyle}>Confirm Password</label>
        <input
          type="password"
          name="confirm_password"
          required
          autoComplete="new-password"
          style={inputStyle}
          placeholder="Repeat your password"
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

      <div style={{ paddingTop: '0.5rem' }}>
        <button
          type="submit"
          disabled={pending}
          style={{
            width: '100%',
            padding: '14px',
            background: GREEN_DEEP,
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
          {pending ? 'Setting up…' : 'Set Password & Continue'}
        </button>
      </div>
    </form>
  );
}
