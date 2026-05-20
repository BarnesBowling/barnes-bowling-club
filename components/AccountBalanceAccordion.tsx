'use client';

import { useState } from 'react';

interface BalanceProps {
  memberEmail: string | null;
  memberName: string | null;
  balance: {
    membershipFee: number;
    guestFee: number;
    manserFee: number;
    wrongBiasFee: number;
    eventFee: number;
  } | null;
}

function fmt(n: number) {
  return `£${n.toFixed(2)}`;
}

export function AccountBalanceAccordion({ memberEmail, memberName, balance }: BalanceProps) {
  const [open, setOpen] = useState(false);

  const fees = balance ?? { membershipFee: 0, guestFee: 0, manserFee: 0, wrongBiasFee: 0, eventFee: 0 };
  const total = fees.membershipFee + fees.guestFee + fees.manserFee + fees.wrongBiasFee + fees.eventFee;

  const rows = [
    { label: 'Outstanding Membership Fees',   value: fees.membershipFee },
    { label: 'Outstanding Guest Fee Balance', value: fees.guestFee },
    { label: 'Outstanding Manser Entry Fee',  value: fees.manserFee },
    { label: 'Outstanding Wrong Bias Fee',    value: fees.wrongBiasFee },
    { label: 'Outstanding Event Fee',         value: fees.eventFee },
  ];

  return (
    <div style={{
      border: '1px solid rgba(45,90,61,.18)',
      background: 'var(--cream)',
      marginBottom: '2rem',
    }}>
      {/* Toggle header */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.75rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '.2em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            marginBottom: '4px',
          }}>
            Account
          </div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '18px',
            fontWeight: 500,
            color: 'var(--green-deep)',
          }}>
            Check Your Account
          </div>
        </div>
        {/* Chevron */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--green-deep)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            width: 20,
            height: 20,
            flexShrink: 0,
            transition: 'transform .2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            opacity: 0.6,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded content */}
      {open && (
        <div style={{ padding: '0 1.75rem 1.75rem', borderTop: '1px solid rgba(45,90,61,.1)' }}>

          {/* Member info */}
          {(memberName || memberEmail) && (
            <div style={{ paddingTop: '1rem', marginBottom: '1.25rem' }}>
              {memberName && (
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '15px',
                  fontWeight: 500,
                  color: 'var(--green-deep)',
                  marginBottom: '2px',
                }}>
                  {memberName}
                </div>
              )}
              {memberEmail && (
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  letterSpacing: '.03em',
                }}>
                  {memberEmail}
                </div>
              )}
            </div>
          )}

          {/* Balance table */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {rows.map(({ label, value }) => (
                <tr key={label} style={{ borderBottom: '1px solid rgba(45,90,61,.08)' }}>
                  <td style={{
                    padding: '10px 0',
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: '13px',
                    color: 'var(--text-mid)',
                  }}>
                    {label}
                  </td>
                  <td style={{
                    padding: '10px 0',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                    fontWeight: 500,
                    color: value > 0 ? 'var(--green-deep)' : 'var(--text-muted)',
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  }}>
                    {fmt(value)}
                  </td>
                </tr>
              ))}

              {/* Total row */}
              <tr style={{ borderTop: '2px solid rgba(45,90,61,.2)' }}>
                <td style={{
                  padding: '12px 0 4px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--green-deep)',
                  letterSpacing: '.02em',
                }}>
                  Total Amount Outstanding
                </td>
                <td style={{
                  padding: '12px 0 4px',
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '18px',
                  fontWeight: 700,
                  color: total > 0 ? 'var(--green-deep)' : 'var(--text-muted)',
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                }}>
                  {fmt(total)}
                </td>
              </tr>
            </tbody>
          </table>

          {!balance && (
            <p style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: '12px',
              color: 'var(--text-muted)',
              margin: '1rem 0 0',
              fontStyle: 'italic',
            }}>
              No balance record found — all fees shown as £0.00.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
