'use client';

import { useState } from 'react';

export type ApplicationRow = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  proposer_name: string | null;
  seconder_name: string | null;
  status: string | null;
};

const optima = "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif";

type Tab = 'pending' | 'approved' | 'rejected' | 'all';

function statusBadge(status: string | null) {
  const s = status ?? 'pending';
  const bg = s === 'approved' ? 'rgba(45,122,58,.1)' : s === 'rejected' ? 'rgba(192,57,43,.1)' : 'rgba(168,149,96,.15)';
  const color = s === 'approved' ? '#2d7a3a' : s === 'rejected' ? '#c0392b' : '#a88928';
  return (
    <span style={{
      padding: '2px 10px', borderRadius: '12px',
      fontSize: '11px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
      background: bg, color,
    }}>
      {s}
    </span>
  );
}

export function ApplicationsClient({ initialApplications }: { initialApplications: ApplicationRow[] }) {
  const [tab, setTab] = useState<Tab>('pending');

  const norm = (s: string | null) => s ?? 'pending';

  const filtered = tab === 'all'
    ? initialApplications
    : initialApplications.filter(a => norm(a.status) === tab);

  const counts: Record<Tab, number> = {
    pending:  initialApplications.filter(a => norm(a.status) === 'pending').length,
    approved: initialApplications.filter(a => norm(a.status) === 'approved').length,
    rejected: initialApplications.filter(a => norm(a.status) === 'rejected').length,
    all:      initialApplications.length,
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pending',  label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'all',      label: 'All' },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '2px solid rgba(45,90,61,.12)', marginBottom: '1.75rem' }}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: '.6rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: tab === key ? '2px solid var(--green-deep)' : '2px solid transparent',
              marginBottom: '-2px',
              cursor: 'pointer',
              fontFamily: optima,
              fontSize: '14px',
              fontWeight: tab === key ? 600 : 400,
              color: tab === key ? 'var(--green-deep)' : 'var(--text-muted)',
            }}
          >
            {label}
            <span style={{ marginLeft: '5px', fontSize: '12px', opacity: .7 }}>({counts[key]})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{ fontFamily: optima, fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          No {tab === 'all' ? '' : tab + ' '}applications.
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: optima, fontSize: '14px' }}>
            <thead>
              <tr style={{ background: 'var(--green-deep)', color: '#fff' }}>
                {['Name', 'Submitted', 'Proposer', 'Seconder', 'Status'].map(h => (
                  <th key={h} style={{
                    padding: '.65rem 1rem', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr
                  key={a.id}
                  onClick={() => { window.location.href = `/admin/applications/${a.id}`; }}
                  style={{
                    background: i % 2 === 0 ? '#fff' : 'rgba(45,90,61,.025)',
                    cursor: 'pointer',
                    transition: 'background .1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(45,90,61,.07)')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : 'rgba(45,90,61,.025)')}
                >
                  <td style={{ padding: '.7rem 1rem', fontWeight: 600, color: 'var(--green-deep)', borderBottom: '1px solid rgba(45,90,61,.07)' }}>
                    {a.full_name}
                  </td>
                  <td style={{ padding: '.7rem 1rem', color: 'var(--text-mid)', borderBottom: '1px solid rgba(45,90,61,.07)', whiteSpace: 'nowrap' }}>
                    {new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '.7rem 1rem', color: 'var(--text-mid)', borderBottom: '1px solid rgba(45,90,61,.07)' }}>
                    {a.proposer_name || '—'}
                  </td>
                  <td style={{ padding: '.7rem 1rem', color: 'var(--text-mid)', borderBottom: '1px solid rgba(45,90,61,.07)' }}>
                    {a.seconder_name || '—'}
                  </td>
                  <td style={{ padding: '.7rem 1rem', borderBottom: '1px solid rgba(45,90,61,.07)' }}>
                    {statusBadge(a.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
