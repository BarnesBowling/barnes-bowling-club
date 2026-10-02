'use client';

import { useState } from 'react';
import { fetchAccountsLedger } from './accountsPDFActions';
import { generateAccountsPDF } from './generateAccountsPDF';

interface Props {
  role: 'admin' | 'viewer';
}

const inp: React.CSSProperties = {
  height: '36px',
  padding: '0 8px',
  border: '1.5px solid rgba(45,90,61,.2)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  color: 'var(--green-deep)',
  background: '#fff',
};

const lbl: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  color: 'var(--green-mid)',
  whiteSpace: 'nowrap',
};

export function AccountsPDFButton({ role }: Props) {
  if (role !== 'admin' && role !== 'viewer') return null;

  const today     = new Date().toISOString().slice(0, 10);
  const yearStart = `${new Date().getFullYear()}-01-01`;

  const [fromDate, setFromDate] = useState(yearStart);
  const [toDate, setToDate]     = useState(today);
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleDownload() {
    setError(null);
    if (!fromDate || !toDate) { setError('Please select a date range.'); return; }
    if (fromDate > toDate)    { setError('From date must be before To date.'); return; }
    setBusy(true);
    try {
      const rows = await fetchAccountsLedger();
      await generateAccountsPDF(rows, fromDate, toDate);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate PDF.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={lbl}>From</span>
          <input
            type="date"
            value={fromDate}
            max={toDate}
            onChange={e => setFromDate(e.target.value)}
            style={inp}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={lbl}>To</span>
          <input
            type="date"
            value={toDate}
            min={fromDate}
            max={today}
            onChange={e => setToDate(e.target.value)}
            style={inp}
          />
        </div>
        <button
          onClick={handleDownload}
          disabled={busy}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0 20px',
            height: '36px',
            background: 'var(--green-deep)',
            color: '#fff',
            border: 'none',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            cursor: busy ? 'wait' : 'pointer',
            opacity: busy ? 0.65 : 1,
          }}
        >
          {busy ? 'Generating…' : 'Download PDF ↓'}
        </button>
      </div>
      {error && (
        <div style={{
          marginTop: '6px',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '12px',
          color: '#c0392b',
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
