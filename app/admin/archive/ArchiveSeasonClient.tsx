'use client';

import { useState } from 'react';
import { fetchMatchesForBackup, archiveSeasonAndReset } from './archiveActions';

type PreviewCount = { slug: string; name: string; count: number };

interface Props {
  counts: PreviewCount[];
  totalMatches: number;
  alreadyArchived: boolean;
}

const YEAR = 2026;

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: 'var(--gold)',
  display: 'block',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  padding: '.6rem .75rem',
  border: '1px solid rgba(45,90,61,.25)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '14px',
  color: 'var(--text-dark)',
  background: 'white',
  width: '180px',
  boxSizing: 'border-box',
  outline: 'none',
};

const btnStyle = (disabled: boolean, danger = false): React.CSSProperties => ({
  padding: '10px 22px',
  background: disabled ? 'rgba(45,90,61,.15)' : danger ? '#c0392b' : 'var(--green-deep)',
  color: disabled ? 'var(--text-muted)' : 'white',
  border: 'none',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  cursor: disabled ? 'not-allowed' : 'pointer',
  whiteSpace: 'nowrap',
});

export function ArchiveSeasonClient({ counts, totalMatches, alreadyArchived }: Props) {
  const [backupDone, setBackupDone] = useState(false);
  const [downloadPending, setDownloadPending] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [archiving, setArchiving] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  async function handleDownload() {
    setDownloadPending(true);
    try {
      const { matches, pairs, error } = await fetchMatchesForBackup();
      if (error) {
        alert(`Download failed: ${error}`);
        return;
      }
      const blob = new Blob(
        [JSON.stringify({ season: YEAR, exportedAt: new Date().toISOString(), matches, pairs }, null, 2)],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `barnes-bowling-${YEAR}-backup.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupDone(true);
    } finally {
      setDownloadPending(false);
    }
  }

  async function handleArchive() {
    if (!backupDone || confirmation !== String(YEAR)) return;
    setArchiving(true);
    const res = await archiveSeasonAndReset(YEAR);
    setArchiving(false);
    if (res.error) {
      setResult({ ok: false, msg: res.error });
    } else {
      setResult({ ok: true, msg: `${YEAR} season archived and competition sheets reset successfully.` });
    }
  }

  if (alreadyArchived) {
    return (
      <div style={{
        padding: '1.25rem 1.5rem',
        background: 'rgba(45,90,61,.06)',
        border: '1px solid rgba(45,90,61,.15)',
        borderLeft: '4px solid var(--green-deep)',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '14px',
        color: 'var(--green-deep)',
        fontWeight: 500,
      }}>
        The {YEAR} season has already been archived. Results are visible on the{' '}
        <a href={`/members/archive/results/${YEAR}`} style={{ color: 'var(--green-mid)', fontWeight: 700 }}>
          archive results page
        </a>.
      </div>
    );
  }

  if (result?.ok) {
    return (
      <div style={{
        padding: '1.25rem 1.5rem',
        background: 'rgba(45,90,61,.06)',
        border: '1px solid rgba(45,90,61,.15)',
        borderLeft: '4px solid var(--green-deep)',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '14px',
        color: 'var(--green-deep)',
        fontWeight: 500,
      }}>
        {result.msg} View on the{' '}
        <a href={`/members/archive/results/${YEAR}`} style={{ color: 'var(--green-mid)', fontWeight: 700 }}>
          archive results page
        </a>.
      </div>
    );
  }

  const canArchive = backupDone && confirmation === String(YEAR);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '640px' }}>

      {/* Season preview */}
      <div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', color: 'var(--green-deep)', margin: '0 0 1rem' }}>
          Current season data — {YEAR}
        </h3>
        <div style={{ background: 'white', border: '1px solid rgba(45,90,61,.12)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {counts.length === 0 ? (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
              No matches recorded yet.
            </p>
          ) : (
            <>
              {counts.map(c => (
                <div key={c.slug} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-dark)', paddingBottom: '.35rem', borderBottom: '1px solid rgba(45,90,61,.06)' }}>
                  <span>{c.name}</span>
                  <span style={{ fontWeight: 600, color: 'var(--green-mid)' }}>{c.count} match{c.count !== 1 ? 'es' : ''}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 700, color: 'var(--green-deep)', paddingTop: '.25rem' }}>
                <span>Total</span>
                <span>{totalMatches} matches</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Step 1: Download backup */}
      <div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', color: 'var(--green-deep)', margin: '0 0 .5rem' }}>
          Step 1 — Download backup
        </h3>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 1rem', lineHeight: 1.6 }}>
          Download a full JSON backup of all matches and pairs data before archiving. This file cannot be recovered once the season is reset.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={handleDownload}
            disabled={downloadPending}
            style={btnStyle(downloadPending)}
          >
            {downloadPending ? 'Preparing…' : 'Download Backup JSON'}
          </button>
          {backupDone && (
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--green-mid)', fontWeight: 600 }}>
              Backup downloaded
            </span>
          )}
        </div>
      </div>

      {/* Step 2: Confirm + archive */}
      <div style={{ opacity: backupDone ? 1 : .4, pointerEvents: backupDone ? 'auto' : 'none' }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', color: 'var(--green-deep)', margin: '0 0 .5rem' }}>
          Step 2 — Archive &amp; reset
        </h3>
        <div style={{
          padding: '1rem 1.25rem',
          background: 'rgba(192,57,43,.04)',
          border: '1px solid rgba(192,57,43,.2)',
          borderLeft: '4px solid #c0392b',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '12px',
          color: '#8b1a0f',
          lineHeight: 1.7,
          marginBottom: '1.25rem',
        }}>
          <strong>Warning — this action cannot be undone.</strong> It will:
          <ul style={{ margin: '.5rem 0 0', paddingLeft: '1.25rem' }}>
            <li>Save results for all competitions to the {YEAR} archive</li>
            <li>Delete all match scores from the competition sheets</li>
            <li>Clear all pairs teams for {YEAR}</li>
          </ul>
          Player names in competition sheets will <strong>not</strong> be affected.
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={labelStyle}>Type &ldquo;{YEAR}&rdquo; to confirm</label>
          <input
            type="text"
            value={confirmation}
            onChange={e => setConfirmation(e.target.value)}
            placeholder={String(YEAR)}
            style={inputStyle}
            autoComplete="off"
          />
        </div>

        {result && !result.ok && (
          <div style={{
            padding: '.75rem 1rem',
            background: 'rgba(192,57,43,.06)',
            border: '1px solid rgba(192,57,43,.2)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            color: '#c0392b',
            marginBottom: '1rem',
          }}>
            {result.msg}
          </div>
        )}

        <button
          onClick={handleArchive}
          disabled={!canArchive || archiving}
          style={btnStyle(!canArchive || archiving, true)}
        >
          {archiving ? 'Archiving…' : `Archive ${YEAR} Season & Reset Sheets`}
        </button>
      </div>

    </div>
  );
}
