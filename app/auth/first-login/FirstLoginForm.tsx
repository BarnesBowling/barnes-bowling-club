'use client';
import { useActionState } from 'react';
import { beginSetup } from './actions';
import Link from 'next/link';

const GOLD = '#A89560';

export function FirstLoginForm() {
  const [state, action, pending] = useActionState(beginSetup, null);

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
