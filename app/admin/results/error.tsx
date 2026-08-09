'use client';

import { useEffect } from 'react';

export default function AdminResultsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AdminResults] caught error:', error.message, 'digest:', error.digest);
  }, [error]);

  return (
    <div style={{ padding: '3rem 2rem', maxWidth: '600px', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: '2rem' }}>
        <a href="/admin" style={{ fontSize: '13px', color: 'var(--green-mid)', textDecoration: 'none' }}>
          ← Back to Admin
        </a>
      </div>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', color: 'var(--green-deep)', marginBottom: '1rem' }}>
        Something went wrong
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '0.5rem', lineHeight: 1.6 }}>
        The Results &amp; Leaderboard page encountered an error. This is usually caused by a database issue or an expired session.
      </p>
      {error.digest && (
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', marginBottom: '1.5rem' }}>
          Error digest: {error.digest}
        </p>
      )}
      <p style={{ fontSize: '13px', color: '#b91c1c', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '0.75rem 1rem', marginBottom: '2rem' }}>
        {error.message || 'An unexpected error occurred.'}
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.6rem 1.25rem',
            background: 'var(--green-mid)',
            color: 'white',
            border: 'none',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
        <a
          href="/admin/results"
          style={{
            padding: '0.6rem 1.25rem',
            background: 'white',
            color: 'var(--green-mid)',
            border: '1.5px solid var(--green-mid)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Reload page
        </a>
      </div>
    </div>
  );
}
