'use client';

import { useState, useRef } from 'react';
import { StripePaymentForm } from './StripePaymentForm';

export interface PaymentEvent {
  id: string;
  name: string;
  amount: number | null;
  is_tbc: boolean;
}

interface Props {
  memberEmail: string;
  balance: number; // positive = owes money, negative = in credit
  events: PaymentEvent[];
}

function fmtBalance(n: number): string {
  return `£${Math.abs(n).toFixed(2)}`;
}

export function PaymentColumns({ memberEmail, balance, events }: Props) {
  const [selectedEvent, setSelectedEvent] = useState<{ amount: string; reference: string } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function handleEventClick(ev: PaymentEvent) {
    const amount = (!ev.is_tbc && ev.amount != null) ? String(ev.amount) : '';
    setSelectedEvent({ amount, reference: ev.name });
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  const hasBalance = Math.abs(balance) >= 0.01;
  const owes = balance > 0;

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .payment-cols { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div
        className="payment-cols"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          gap: '2rem',
          alignItems: 'start',
        }}
      >

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Statement Balance card */}
          <div style={{
            background: '#fff',
            border: `1.5px solid ${owes ? 'rgba(192,57,43,.25)' : 'rgba(45,90,61,.18)'}`,
            padding: '1.75rem 2rem',
          }}>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '.18em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '8px',
            }}>
              Statement Balance
            </div>
            {hasBalance ? (
              <>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '2.25rem',
                  fontWeight: 400,
                  color: owes ? '#c0392b' : '#2e7d32',
                  lineHeight: 1,
                  marginBottom: '6px',
                }}>
                  {owes ? fmtBalance(balance) : `−${fmtBalance(balance)}`}
                </div>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  margin: '0 0 1rem',
                  lineHeight: 1.6,
                }}>
                  {owes ? 'Outstanding balance' : 'Your account is in credit'}
                </p>
              </>
            ) : (
              <>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '2.25rem',
                  fontWeight: 400,
                  color: '#2e7d32',
                  lineHeight: 1,
                  marginBottom: '6px',
                }}>
                  £0.00
                </div>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  margin: '0 0 1rem',
                  lineHeight: 1.6,
                }}>
                  No outstanding balance
                </p>
              </>
            )}
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '12px',
              color: 'var(--text-muted)',
              margin: 0,
              lineHeight: 1.6,
            }}>
              Payment methods: Credit card or bank transfer
            </p>
          </div>

          {/* Disclaimer */}
          <p style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: '13px',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
            margin: 0,
            lineHeight: 1.7,
          }}>
            Membership fees must be settled before April 25th in accordance with Club Rules.
          </p>

          {/* Pay for an Event */}
          <div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--green-deep)',
              marginBottom: '0.75rem',
            }}>
              Pay for an Event
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {events.map(ev => {
                const isSelected = selectedEvent?.reference === ev.name;
                const priceLabel = ev.is_tbc || ev.amount == null ? 'TBC' : `£${Number(ev.amount).toFixed(2).replace(/\.00$/, '')}`;
                const hasPrice   = !ev.is_tbc && ev.amount != null;
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => handleEventClick(ev)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.875rem 1rem',
                      background: isSelected ? 'rgba(45,90,61,.07)' : '#fff',
                      border: `1.5px solid ${isSelected ? 'var(--green-mid)' : 'rgba(45,90,61,.18)'}`,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'border-color .15s, background .15s',
                    }}
                  >
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '14px',
                      color: 'var(--green-deep)',
                      fontWeight: isSelected ? 600 : 400,
                    }}>
                      {ev.name}
                    </span>
                    <span style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '16px',
                      color: hasPrice ? 'var(--green-deep)' : 'var(--text-muted)',
                      fontWeight: 600,
                      flexShrink: 0,
                      marginLeft: '1rem',
                    }}>
                      {priceLabel}
                    </span>
                  </button>
                );
              })}
              {events.length === 0 && (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                  No events currently scheduled.
                </p>
              )}
            </div>
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px',
              color: 'var(--text-muted)',
              margin: '8px 0 0',
              lineHeight: 1.5,
            }}>
              Click an event to pre-fill the payment form.
            </p>
          </div>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div ref={formRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Card payment box */}
          <div style={{ background: 'var(--cream)', padding: '2rem 2rem' }}>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '.2em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '6px',
            }}>
              Pay by Card
            </div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--green-deep)',
              marginBottom: '1.5rem',
            }}>
              Secure online payment
            </div>
            <StripePaymentForm
              memberEmail={memberEmail}
              defaultAmount={selectedEvent?.amount}
              defaultReference={selectedEvent?.reference}
            />
          </div>

          {/* Bank transfer box */}
          <div style={{
            background: 'var(--cream)',
            padding: '1.75rem 2rem',
          }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '18px',
              fontWeight: 500,
              color: 'var(--green-deep)',
              marginBottom: '1rem',
            }}>
              To pay by Bank Transfer
            </div>
            <p style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: '14px',
              color: 'var(--text-muted)',
              lineHeight: 1.8,
              margin: '0 0 0.75rem',
            }}>
              To settle the payment, please arrange a bank transfer to our Barnes Bowling Club account (Account Name: <strong style={{ color: 'var(--green-deep)' }}>Barnes Bowling Club</strong>, Account Number: <strong style={{ color: 'var(--green-deep)' }}>7014 3383</strong>, Sort Code: <strong style={{ color: 'var(--green-deep)' }}>20-72-33</strong>).
            </p>
            <p style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: '14px',
              color: 'var(--text-muted)',
              lineHeight: 1.8,
              margin: 0,
            }}>
              Please include your membership number as the payment reference, and email confirmation to <a href="mailto:info@barnesbowling.club" style={{ color: 'var(--green-mid)', textDecoration: 'none' }}>info@barnesbowling.club</a> for our records.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
