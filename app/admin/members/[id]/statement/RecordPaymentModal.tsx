'use client';

import { useState } from 'react';
import { recordPayment } from './paymentActions';
import type { PaymentRow } from './paymentActions';

interface Props {
  memberId: string;
  memberName: string;
  outstandingBalance: number;
  onClose: () => void;
  onSaved: (row: PaymentRow) => void;
}

const inp: React.CSSProperties = {
  height: '38px',
  padding: '0 10px',
  border: '1.5px solid rgba(45,90,61,.2)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  color: 'var(--green-deep)',
  background: '#fff',
  width: '100%',
  boxSizing: 'border-box',
};

const lbl: React.CSSProperties = {
  display: 'block',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--green-mid)',
  marginBottom: '5px',
};

const btnSave: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '0 20px', height: '40px',
  background: 'var(--green-mid)', color: '#fff', border: 'none',
  fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 700,
  letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer',
};

const btnCancel: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '0 16px', height: '40px',
  background: '#fff', color: '#666',
  border: '1.5px solid rgba(0,0,0,.15)',
  fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600,
  letterSpacing: '.07em', textTransform: 'uppercase', cursor: 'pointer',
};

const METHODS = ['Cash', 'Bank transfer', 'Card', 'Cheque', 'Other'] as const;

export function RecordPaymentModal({ memberId, memberName, outstandingBalance, onClose, onSaved }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [amount, setAmount]   = useState(outstandingBalance > 0.005 ? outstandingBalance.toFixed(2) : '');
  const [method, setMethod]   = useState<string>('Cash');
  const [date, setDate]       = useState(today);
  const [notes, setNotes]     = useState('');
  const [busy, setBusy]       = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const amountNum  = parseFloat(amount);
  const remaining  = outstandingBalance - (isNaN(amountNum) ? 0 : amountNum);

  async function handleSave() {
    setError(null);
    if (!amount || isNaN(amountNum) || amountNum <= 0) { setError('Amount must be greater than 0.'); return; }
    if (!date) { setError('Date is required.'); return; }

    setBusy(true);
    try {
      const res = await recordPayment(memberId, { amount: amountNum, method, date, notes: notes || undefined });
      if (!res.ok) { setError(res.error ?? 'Failed to record payment.'); return; }
      onSaved(res.row!);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 1000,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '3rem 1.5rem', overflowY: 'auto',
      }}
      onClick={() => { if (!busy) onClose(); }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', width: '100%', maxWidth: '480px', boxShadow: '0 4px 24px rgba(0,0,0,.18)' }}
      >
        {/* Header */}
        <div style={{ background: '#1b3b26', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: '#fff', fontWeight: 700 }}>
              Record Payment
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,.65)', marginTop: '2px' }}>
              {memberName}
            </div>
          </div>
          {!busy && (
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.7)', fontSize: '18px', cursor: 'pointer', lineHeight: 1, padding: '2px 4px' }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Outstanding balance */}
          {Math.abs(outstandingBalance) > 0.005 && (
            <div style={{
              padding: '10px 14px',
              background: outstandingBalance > 0.005 ? 'rgba(192,57,43,.05)' : 'rgba(46,125,50,.05)',
              borderLeft: `3px solid ${outstandingBalance > 0.005 ? '#c0392b' : '#2e7d32'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            }}>
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: outstandingBalance > 0.005 ? '#c0392b' : '#2e7d32', marginBottom: '2px' }}>
                  {outstandingBalance > 0.005 ? 'Outstanding' : 'In Credit'}
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '18px', fontWeight: 700, color: outstandingBalance > 0.005 ? '#c0392b' : '#2e7d32' }}>
                  £{Math.abs(outstandingBalance).toFixed(2)}
                </div>
              </div>
              {outstandingBalance > 0.005 && (
                <button
                  type="button"
                  onClick={() => setAmount(outstandingBalance.toFixed(2))}
                  style={{
                    height: '32px', padding: '0 12px',
                    background: 'transparent', color: '#c0392b',
                    border: '1.5px solid #c0392b',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 700,
                    letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  Pay full balance
                </button>
              )}
            </div>
          )}

          {/* Amount */}
          <div>
            <label style={lbl}>Amount (£)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={inp}
              autoFocus
            />
            {!isNaN(amountNum) && amountNum > 0.005 && Math.abs(outstandingBalance) > 0.005 && (
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', marginTop: '5px', color: remaining > 0.005 ? '#c0392b' : remaining < -0.005 ? '#2e7d32' : 'var(--text-muted)' }}>
                {remaining > 0.005
                  ? `£${remaining.toFixed(2)} remaining after this payment`
                  : remaining < -0.005
                  ? `£${Math.abs(remaining).toFixed(2)} overpayment`
                  : 'Settles balance in full'}
              </div>
            )}
          </div>

          {/* Payment method */}
          <div>
            <label style={lbl}>Payment method</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {METHODS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  style={{
                    height: '36px', padding: '0 14px',
                    border: '1.5px solid',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600,
                    letterSpacing: '.04em', cursor: 'pointer',
                    borderColor: method === m ? 'var(--green-mid)' : 'rgba(45,90,61,.2)',
                    background:  method === m ? 'var(--green-mid)' : '#fff',
                    color:       method === m ? '#fff' : 'var(--green-deep)',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label style={lbl}>Date received</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={inp}
            />
          </div>

          {/* Notes */}
          <div>
            <label style={lbl}>Notes (optional)</label>
            <input
              type="text"
              placeholder="e.g. Paid at AGM"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={inp}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '9px 12px',
              background: 'rgba(192,0,0,.05)',
              borderLeft: '3px solid #c0392b',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: '#900',
            }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
            <button onClick={handleSave} disabled={busy} style={{ ...btnSave, opacity: busy ? .65 : 1, cursor: busy ? 'wait' : 'pointer' }}>
              {busy ? 'Saving…' : 'Record Payment'}
            </button>
            <button onClick={onClose} disabled={busy} style={{ ...btnCancel, opacity: busy ? .65 : 1 }}>
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
