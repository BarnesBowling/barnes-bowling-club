'use client';

import { useState, useMemo, useEffect } from 'react';

export interface GuestFeeMetadata {
  type: 'guest_fee';
  num_guests: number;
  cost_per_guest: number;
  date_of_play: string;
  notes?: string | null;
}

export interface Transaction {
  id: string;
  member_email: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  created_at: string;
  metadata?: GuestFeeMetadata | null;
}

interface Props {
  email: string;
  memberName: string | null;
  memberId: string;
  transactions: Transaction[];
}

const CATEGORY_LABELS: Record<string, string> = {
  membership_fee: 'Membership Fee',
  guest_fee:      'Guest Fee',
  event_fee:      'Event Fee',
  manser_fee:     'Manser Fee',
  wrong_bias_fee: 'Wrong Bias Fee',
  miscellaneous:  'Miscellaneous',
  payment:        'Payment Received',
};

const CATEGORY_COLOURS: Record<string, string> = {
  membership_fee: '#1b3b26',
  guest_fee:      '#2d5a3d',
  event_fee:      '#3d7a50',
  manser_fee:     '#4a6741',
  wrong_bias_fee: '#6b5b3e',
  miscellaneous:  '#555',
  payment:        '#2e7d32',
};

function fmtDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function fmtDateLong(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function fmtGBP(n: number): string {
  return `£${Math.abs(n).toFixed(2)}`;
}

function refFromId(id: string): string {
  return `BBC-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}

// ── Statement Sheet Modal ────────────────────────────────────────────────────

function StatementSheet({
  memberName,
  memberId,
  email,
  rowsDesc,
  totalBalance,
  totalCharged,
  totalPaid,
  onClose,
}: {
  memberName: string | null;
  memberId: string;
  email: string;
  rowsDesc: (Transaction & { balance: number })[];
  totalBalance: number;
  totalCharged: number;
  totalPaid: number;
  onClose: () => void;
}) {
  const isOwed       = totalBalance > 0;
  const statementDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const thS: React.CSSProperties = {
    padding: '9px 10px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    color: '#fff',
    background: '#1b3b26',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    borderRight: '1px solid rgba(255,255,255,.15)',
  };

  return (
    <>
      {/* Print styles — injected into head while modal is open */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #bbc-statement-print { display: block !important; position: static !important; overflow: visible !important; }
          #bbc-statement-print .no-print { display: none !important; }
          #bbc-statement-sheet { box-shadow: none !important; max-height: none !important; overflow: visible !important; border-radius: 0 !important; }
          @page { margin: 1.5cm; size: A4; }
        }
      `}</style>

      {/* Overlay */}
      <div
        id="bbc-statement-print"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(10,20,14,.65)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '2rem 1rem',
          overflowY: 'auto',
        }}
      >
        {/* Sheet */}
        <div
          id="bbc-statement-sheet"
          style={{
            width: '100%',
            maxWidth: '860px',
            background: '#fff',
            borderRadius: '2px',
            boxShadow: '0 24px 80px rgba(0,0,0,.35)',
            overflow: 'hidden',
          }}
        >

          {/* ── Header ── */}
          <div style={{ background: '#1b3b26', padding: '2rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: '6px' }}>
                Barnes Bowling Club — Account Statement
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 400, color: '#f5f0e8', letterSpacing: '-.01em' }}>
                {memberName ?? email}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(245,240,232,.65)', marginTop: '4px' }}>
                {email}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,.5)', marginBottom: '4px' }}>
                Member No.
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '18px', fontWeight: 700, color: '#c9a84c', letterSpacing: '.04em' }}>
                {memberId}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'rgba(245,240,232,.5)', marginTop: '6px' }}>
                Statement date: {statementDate}
              </div>
            </div>
          </div>

          {/* ── Summary box ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '2px solid #e8e4dc' }}>
            {[
              { label: 'Total Charged', value: fmtGBP(totalCharged), col: '#c0392b' },
              { label: 'Total Paid',    value: fmtGBP(totalPaid),    col: '#2e7d32' },
              { label: 'Balance',       value: fmtGBP(totalBalance), col: isOwed ? '#c0392b' : '#2e7d32' },
            ].map(({ label, value, col }, i) => (
              <div key={label} style={{ padding: '1.5rem 2rem', borderRight: i < 2 ? '1px solid #e8e4dc' : 'none', background: i === 2 ? (isOwed ? 'rgba(192,57,43,.04)' : 'rgba(46,125,50,.04)') : '#fafaf8' }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#555', marginBottom: '6px' }}>
                  {label}
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 400, color: col, lineHeight: 1 }}>
                  {value}
                </div>
                {i === 2 && (
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: isOwed ? '#c0392b' : '#2e7d32', marginTop: '5px', fontWeight: 600 }}>
                    {isOwed ? 'Outstanding' : totalBalance < 0 ? 'Credit' : 'Clear'}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Table ── */}
          <div style={{ overflowX: 'auto' }}>
            {rowsDesc.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', fontFamily: "'Libre Baskerville', serif", fontSize: '14px', color: '#555', fontStyle: 'italic' }}>
                No transactions recorded on this account.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '680px' }}>
                <thead>
                  <tr>
                    <th style={{ ...thS, width: '100px' }}>Date</th>
                    <th style={{ ...thS, width: '120px' }}>Reference</th>
                    <th style={thS}>Description</th>
                    <th style={{ ...thS, textAlign: 'right', width: '80px' }}>Debit (£)</th>
                    <th style={{ ...thS, textAlign: 'right', width: '80px' }}>Credit (£)</th>
                    <th style={{ ...thS, textAlign: 'right', width: '90px', borderRight: 'none' }}>Balance (£)</th>
                  </tr>
                </thead>
                <tbody>
                  {rowsDesc.map((row, i) => {
                    const isCredit  = row.amount < 0;
                    const isFirst   = i === 0;
                    const rowBg     = isFirst
                      ? (isCredit ? 'rgba(46,125,50,.12)' : 'rgba(192,57,43,.1)')
                      : isCredit
                        ? 'rgba(46,125,50,.05)'
                        : 'rgba(192,57,43,.04)';

                    return (
                      <tr key={row.id} style={{ background: rowBg, borderBottom: '1px solid rgba(45,90,61,.08)' }}>
                        <td style={{ padding: '10px', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#1a2e1f', whiteSpace: 'nowrap' }}>
                          {fmtDate(row.date)}
                        </td>
                        <td style={{ padding: '10px', fontFamily: "'DM Sans', monospace", fontSize: '11px', color: '#555', letterSpacing: '.04em', whiteSpace: 'nowrap' }}>
                          {refFromId(row.id)}
                          {isFirst && (
                            <span style={{ marginLeft: '6px', fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: isCredit ? '#2e7d32' : '#c0392b', background: isCredit ? 'rgba(46,125,50,.12)' : 'rgba(192,57,43,.1)', padding: '1px 5px' }}>
                              latest
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 500, color: '#1a2e1f' }}>
                            {CATEGORY_LABELS[row.category] ?? row.category}
                          </div>
                          {row.description !== (CATEGORY_LABELS[row.category] ?? row.category) && (
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#555', marginTop: '1px' }}>
                              {row.description}
                            </div>
                          )}
                          {row.category === 'guest_fee' && row.metadata && (
                            <div style={{ marginTop: '5px', paddingTop: '5px', borderTop: '1px solid rgba(45,90,61,.1)', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                              {[
                                { label: 'Date of play',    value: fmtDateLong(row.metadata.date_of_play) },
                                { label: 'Guests',          value: String(row.metadata.num_guests) },
                                { label: 'Cost per guest',  value: `£${row.metadata.cost_per_guest.toFixed(2)}` },
                                { label: 'Total',           value: `£${(row.metadata.num_guests * row.metadata.cost_per_guest).toFixed(2)}` },
                                ...(row.metadata.notes ? [{ label: 'Notes', value: row.metadata.notes }] : []),
                              ].map(({ label, value }) => (
                                <div key={label}>
                                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#999' }}>{label}</div>
                                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#1a2e1f', fontWeight: 500 }}>{value}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '13px', color: isCredit ? '#bbb' : '#c0392b', whiteSpace: 'nowrap' }}>
                          {isCredit ? '—' : fmtGBP(row.amount)}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '13px', color: isCredit ? '#2e7d32' : '#bbb', whiteSpace: 'nowrap' }}>
                          {isCredit ? fmtGBP(row.amount) : '—'}
                        </td>
                        <td style={{ padding: '10px', textAlign: 'right', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap', color: row.balance > 0 ? '#c0392b' : row.balance < 0 ? '#2e7d32' : '#555' }}>
                          {row.balance === 0 ? '0.00' : Math.abs(row.balance).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#1b3b26' }}>
                    <td colSpan={5} style={{ padding: '12px 10px', fontFamily: "'Playfair Display', serif", fontSize: '14px', fontWeight: 500, color: '#f5f0e8' }}>
                      Total Outstanding
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '15px', color: isOwed ? '#f4a49a' : '#81c784', whiteSpace: 'nowrap' }}>
                      {totalBalance === 0 ? '0.00' : Math.abs(totalBalance).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* ── Footer ── */}
          <div style={{ padding: '1.75rem 2.5rem', borderTop: '1px solid #e8e4dc', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center' }} className="no-print">
              <a
                href="/members/payment"
                style={{
                  display: 'inline-block',
                  padding: '10px 22px',
                  background: '#1b3b26',
                  color: '#f5f0e8',
                  textDecoration: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '.09em',
                  textTransform: 'uppercase',
                }}
              >
                Pay Now
              </a>
              {isOwed && (
                <a
                  href={`/members/payment?amount=${totalBalance.toFixed(2)}`}
                  style={{
                    display: 'inline-block',
                    padding: '10px 22px',
                    background: '#c0392b',
                    color: '#fff',
                    textDecoration: 'none',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '.09em',
                    textTransform: 'uppercase',
                  }}
                >
                  Make a Payment — {fmtGBP(totalBalance)} →
                </a>
              )}
              <button
                onClick={() => window.print()}
                style={{
                  padding: '10px 22px',
                  background: '#1b3b26',
                  color: '#f5f0e8',
                  border: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                  <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                </svg>
                Print Statement
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 18px',
                  background: 'none',
                  border: '1px solid rgba(45,90,61,.25)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: '#1a2e1f',
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>

            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: '#aaa', letterSpacing: '.04em', lineHeight: 1.6 }}>
              Barnes Bowling Club · Sun Inn, Church Road, Barnes SW13 9HE<br />
              info@barnesbowling.com · Est. c.1725
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// ── Main AccountClient ───────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: '#1a2e1f',
  display: 'block',
  marginBottom: '5px',
};

const filterSelectStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid rgba(45,90,61,.2)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  color: 'var(--green-deep)',
  background: '#fff',
};

export function AccountClient({ email, memberName, memberId, transactions }: Props) {
  const [filterCategory, setFilterCategory] = useState('');
  const [statementOpen, setStatementOpen]   = useState(false);
  const [expandedRows, setExpandedRows]     = useState<Set<string>>(new Set());

  function toggleRow(id: string) {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Build display rows with running balance (transactions pre-sorted asc by date)
  const { rowsDesc, totalBalance, totalCharged, totalPaid } = useMemo(() => {
    let running = 0;
    const withBalance = transactions.map(t => {
      running += t.amount;
      return { ...t, balance: running };
    });
    const charged = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const paid    = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    return {
      rowsDesc:     [...withBalance].reverse(),
      totalBalance: running,
      totalCharged: charged,
      totalPaid:    paid,
    };
  }, [transactions]);

  const filteredRows = useMemo(() => {
    if (!filterCategory) return rowsDesc;
    return rowsDesc.filter(r => r.category === filterCategory);
  }, [rowsDesc, filterCategory]);

  const isOwed     = totalBalance > 0;
  const balanceCol = isOwed ? '#c0392b' : '#2e7d32';

  const thStyle: React.CSSProperties = {
    padding: '9px 12px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    color: '#1a2e1f',
    textAlign: 'left',
    borderBottom: '2px solid rgba(45,90,61,.2)',
    whiteSpace: 'nowrap',
  };

  const tdBase: React.CSSProperties = {
    padding: '11px 12px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    color: 'var(--text-dark)',
    borderBottom: '1px solid rgba(45,90,61,.06)',
    verticalAlign: 'middle',
  };

  return (
    <>
      {statementOpen && (
        <StatementSheet
          memberName={memberName}
          memberId={memberId}
          email={email}
          rowsDesc={rowsDesc}
          totalBalance={totalBalance}
          totalCharged={totalCharged}
          totalPaid={totalPaid}
          onClose={() => setStatementOpen(false)}
        />
      )}

      <div style={{ maxWidth: '860px' }}>

        {/* ── Balance summary card (clickable) ────────────────────────────── */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setStatementOpen(true)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setStatementOpen(true); }}
          style={{
            background: '#fff',
            border: `2px solid ${isOwed ? 'rgba(192,57,43,.2)' : 'rgba(46,125,50,.2)'}`,
            padding: '1.75rem 2rem',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem',
            cursor: 'pointer',
            transition: 'border-color .15s, box-shadow .15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = isOwed ? 'rgba(192,57,43,.5)' : 'rgba(46,125,50,.45)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,.08)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.borderColor = isOwed ? 'rgba(192,57,43,.2)' : 'rgba(46,125,50,.2)';
            (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
          }}
        >
          <div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#1a2e1f', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isOwed ? 'Amount Outstanding' : 'Account Balance'}
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: isOwed ? '#c0392b' : '#2e7d32', background: isOwed ? 'rgba(192,57,43,.08)' : 'rgba(46,125,50,.08)', padding: '2px 7px', borderRadius: '2px' }}>
                View statement
              </span>
            </div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 400, color: balanceCol, lineHeight: 1, letterSpacing: '-.02em' }}>
              {fmtGBP(totalBalance)}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#1a2e1f', marginTop: '6px' }}>
              {isOwed ? 'Balance owed to Barnes Bowling Club' : totalBalance < 0 ? 'Credit on account' : 'Account clear — no outstanding balance'}
            </div>
            {isOwed && (
              <a
                href={`/members/payment?amount=${totalBalance.toFixed(2)}`}
                onClick={e => e.stopPropagation()}
                style={{
                  display: 'inline-block',
                  marginTop: '1rem',
                  padding: '9px 20px',
                  background: '#c0392b',
                  color: '#fff',
                  textDecoration: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '.09em',
                  textTransform: 'uppercase',
                }}
              >
                Make a Payment →
              </a>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, color: '#1a2e1f', marginBottom: '3px' }}>
              {memberName ?? email}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#1a2e1f' }}>
              {email}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#1a2e1f', marginTop: '2px' }}>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} recorded
            </div>
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end', color: 'rgba(27,59,38,.45)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                Click to open full statement
              </span>
            </div>
          </div>
        </div>

        {/* ── Fee breakdown summary ───────────────────────────────────────── */}
        {transactions.length > 0 && (() => {
          const byCategory: Record<string, number> = {};
          for (const t of transactions) {
            byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
          }
          const entries = Object.entries(byCategory).filter(([, v]) => v !== 0);
          if (entries.length === 0) return null;
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', marginBottom: '2rem' }}>
              {entries.map(([cat, total]) => (
                <div key={cat} style={{ background: '#fff', border: '1px solid rgba(45,90,61,.1)', padding: '.75rem 1rem', minWidth: '130px' }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: CATEGORY_COLOURS[cat] ?? '#555', marginBottom: '4px' }}>
                    {CATEGORY_LABELS[cat] ?? cat}
                  </div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '16px', color: total > 0 ? '#c0392b' : '#2e7d32' }}>
                    {total > 0 ? `+${fmtGBP(total)}` : `−${fmtGBP(total)}`}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* ── Filter ─────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div>
            <label style={labelStyle}>Filter by category</label>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={filterSelectStyle}>
              <option value="">All transactions</option>
              {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          {filterCategory && (
            <button onClick={() => setFilterCategory('')} style={{ marginTop: '15px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#1a2e1f', textDecoration: 'underline' }}>
              Clear filter
            </button>
          )}
        </div>

        {/* ── Statement table ─────────────────────────────────────────────── */}
        {transactions.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid rgba(45,90,61,.1)', padding: '2.5rem 2rem', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', color: '#1a2e1f', fontStyle: 'italic', margin: 0 }}>
              No transactions have been recorded on this account yet.
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#1a2e1f', marginTop: '8px', marginBottom: 0 }}>
              Contact the club if you believe there should be charges or payments shown here.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '580px', background: '#fff' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: '110px' }}>Date</th>
                  <th style={thStyle}>Description</th>
                  <th style={{ ...thStyle, width: '130px' }}>Category</th>
                  <th style={{ ...thStyle, textAlign: 'right', width: '80px' }}>Debit</th>
                  <th style={{ ...thStyle, textAlign: 'right', width: '80px' }}>Credit</th>
                  <th style={{ ...thStyle, textAlign: 'right', width: '90px' }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ ...tdBase, textAlign: 'center', color: '#1a2e1f', fontStyle: 'italic', padding: '2rem' }}>
                      No transactions in this category.
                    </td>
                  </tr>
                ) : (
                  filteredRows.flatMap((row, i) => {
                    const isCredit      = row.amount < 0;
                    const rowBg         = i % 2 === 0 ? '#fff' : 'rgba(45,90,61,.018)';
                    const hasGuestMeta  = row.category === 'guest_fee' && !!row.metadata;
                    const isExpanded    = expandedRows.has(row.id);

                    const mainRow = (
                      <tr
                        key={row.id}
                        style={{ background: rowBg, cursor: hasGuestMeta ? 'pointer' : 'default' }}
                        onClick={() => { if (hasGuestMeta) toggleRow(row.id); }}
                      >
                        <td style={{ ...tdBase, color: '#1a2e1f', whiteSpace: 'nowrap' }}>{fmtDate(row.date)}</td>
                        <td style={tdBase}>
                          <div style={{ fontWeight: row.category === 'payment' ? 600 : 400, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {row.description}
                            {hasGuestMeta && (
                              <svg
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                                strokeLinecap="round" strokeLinejoin="round"
                                style={{ width: 12, height: 12, color: '#1a2e1f', flexShrink: 0, transition: 'transform .2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                              >
                                <polyline points="6 9 12 15 18 9"/>
                              </svg>
                            )}
                          </div>
                        </td>
                        <td style={tdBase}>
                          <span style={{ display: 'inline-block', padding: '2px 8px', background: `${CATEGORY_COLOURS[row.category] ?? '#555'}18`, fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: CATEGORY_COLOURS[row.category] ?? '#555', whiteSpace: 'nowrap' }}>
                            {CATEGORY_LABELS[row.category] ?? row.category}
                          </span>
                        </td>
                        <td style={{ ...tdBase, textAlign: 'right', fontWeight: 600, color: isCredit ? '#aaa' : '#c0392b', whiteSpace: 'nowrap' }}>
                          {isCredit ? '—' : fmtGBP(row.amount)}
                        </td>
                        <td style={{ ...tdBase, textAlign: 'right', fontWeight: 600, color: isCredit ? '#2e7d32' : '#aaa', whiteSpace: 'nowrap' }}>
                          {isCredit ? fmtGBP(row.amount) : '—'}
                        </td>
                        <td style={{ ...tdBase, textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap', color: row.balance > 0 ? '#c0392b' : row.balance < 0 ? '#2e7d32' : '#1a2e1f' }}>
                          {row.balance === 0 ? '£0.00' : (row.balance > 0 ? fmtGBP(row.balance) : `−${fmtGBP(row.balance)}`)}
                        </td>
                      </tr>
                    );

                    if (!hasGuestMeta || !isExpanded || !row.metadata) return [mainRow];

                    const meta = row.metadata;
                    const detailRow = (
                      <tr key={`${row.id}-detail`} style={{ background: rowBg }}>
                        <td colSpan={6} style={{ padding: '0 12px 12px 12px', borderBottom: '1px solid rgba(45,90,61,.06)' }}>
                          <div style={{ background: 'rgba(45,90,61,.05)', border: '1px solid rgba(45,90,61,.12)', padding: '.75rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                            {[
                              { label: 'Date of play',   value: fmtDateLong(meta.date_of_play) },
                              { label: 'Guests',         value: String(meta.num_guests) },
                              { label: 'Cost per guest', value: `£${meta.cost_per_guest.toFixed(2)}` },
                              { label: 'Total charged',  value: `£${(meta.num_guests * meta.cost_per_guest).toFixed(2)}` },
                              ...(meta.notes ? [{ label: 'Notes', value: meta.notes }] : []),
                            ].map(({ label, value }) => (
                              <div key={label}>
                                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#1a2e1f', marginBottom: '2px' }}>{label}</div>
                                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#1a2e1f', fontWeight: 500 }}>{value}</div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );

                    return [mainRow, detailRow];
                  })
                )}
              </tbody>
              {transactions.length > 0 && (
                <tfoot>
                  <tr style={{ borderTop: '2px solid rgba(45,90,61,.15)' }}>
                    <td colSpan={5} style={{ ...tdBase, fontFamily: "'Playfair Display', serif", fontSize: '14px', fontWeight: 500, color: 'var(--green-deep)', paddingTop: '14px' }}>
                      Total Outstanding
                    </td>
                    <td style={{ ...tdBase, textAlign: 'right', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '15px', color: balanceCol, paddingTop: '14px', whiteSpace: 'nowrap' }}>
                      {totalBalance === 0 ? '£0.00' : (totalBalance > 0 ? fmtGBP(totalBalance) : `−${fmtGBP(totalBalance)}`)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* ── Payment link ────────────────────────────────────────────────── */}
        {isOwed && (
          <div style={{ marginTop: '1.5rem' }}>
            <a
              href={`/members/payment?amount=${totalBalance.toFixed(2)}`}
              style={{ display: 'inline-block', padding: '10px 24px', background: 'var(--green-deep)', color: 'var(--cream)', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}
            >
              Pay {fmtGBP(totalBalance)} Outstanding →
            </a>
          </div>
        )}

        {/* ── Footer note ─────────────────────────────────────────────────── */}
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#1a2e1f', marginTop: '2rem', lineHeight: 1.6 }}>
          This statement reflects charges and payments recorded by the club. If you believe there is an error, please contact the club secretary.
        </p>

      </div>
    </>
  );
}
