'use client';

import { useState } from 'react';
import { emailStatement } from './emailActions';

interface Props {
  memberId: string;
  hasEmail: boolean;
  initialLastEmailed: string | null;
}

function formatLastEmailed(iso: string): string {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timePart = d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${datePart} ${timePart}`;
}

export function EmailStatementButton({ memberId, hasEmail, initialLastEmailed }: Props) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [lastEmailed, setLastEmailed] = useState<string | null>(initialLastEmailed);

  async function handleClick() {
    setBusy(true);
    setResult(null);
    try {
      const res = await emailStatement(memberId);
      if (res.ok) {
        setLastEmailed(new Date().toISOString());
        setResult({ ok: true, msg: 'Sent ✓' });
        setTimeout(() => setResult(null), 4000);
      } else {
        setResult({ ok: false, msg: res.error ?? 'Failed to send.' });
      }
    } catch (err) {
      setResult({ ok: false, msg: err instanceof Error ? err.message : 'Unexpected error.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
      <button
        onClick={handleClick}
        disabled={!hasEmail || busy}
        title={!hasEmail ? 'No email address on file' : undefined}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0 20px',
          height: '40px',
          background: !hasEmail ? '#b0a080' : '#c9a84c',
          color: '#fff',
          border: 'none',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          cursor: !hasEmail ? 'not-allowed' : busy ? 'wait' : 'pointer',
          opacity: busy ? 0.65 : 1,
        }}
      >
        {busy ? 'Emailing…' : 'Email statement'}
      </button>

      {!hasEmail && (
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '11px',
            color: '#999',
            fontStyle: 'italic',
          }}
        >
          No email on file
        </span>
      )}

      {result && (
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12px',
            color: result.ok ? '#2d6e42' : '#b03232',
            fontWeight: 500,
          }}
        >
          {result.msg}
        </span>
      )}

      {lastEmailed && (
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '11px',
            color: '#999',
          }}
        >
          Last emailed: {formatLastEmailed(lastEmailed)}
        </span>
      )}
    </div>
  );
}
