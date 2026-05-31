'use client';

import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  fontFamily: "'Libre Baskerville', serif",
  fontSize: '14px',
  color: 'var(--text-dark)',
  background: '#fff',
  border: '1px solid rgba(45,90,61,.25)',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: '6px',
};

interface Props {
  memberEmail: string;
}

function PayPalForm({ memberEmail }: Props) {
  const [memberName, setMemberName]             = useState('');
  const [membershipNumber, setMembershipNumber] = useState('');
  const [reference, setReference]               = useState('');
  const [amount, setAmount]                     = useState('');
  const [error, setError]                       = useState<string | null>(null);
  const [success, setSuccess]                   = useState(false);
  const [paidAmount, setPaidAmount]             = useState('');

  const amountNum = parseFloat(amount);
  const amountValid = !isNaN(amountNum) && amountNum >= 1;

  if (success) {
    return (
      <div style={{
        padding: '2rem 2.5rem',
        background: 'rgba(45,90,61,.05)',
        borderLeft: '4px solid var(--green-deep)',
      }}>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '9px',
          fontWeight: 700,
          letterSpacing: '.2em',
          textTransform: 'uppercase',
          color: 'var(--green-deep)',
          marginBottom: '8px',
        }}>
          Payment Received
        </div>
        <p style={{
          fontFamily: "'Libre Baskerville', serif",
          fontSize: '15px',
          color: 'var(--text-dark)',
          margin: 0,
          lineHeight: 1.7,
        }}>
          Payment of <strong>£{paidAmount}</strong> received via PayPal. Thank you — a confirmation has been sent to your email.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Full Name */}
      <div>
        <label style={labelStyle}>Full Name</label>
        <input
          type="text"
          value={memberName}
          onChange={e => setMemberName(e.target.value)}
          placeholder="Your full name"
          style={inputStyle}
        />
      </div>

      {/* Membership Number */}
      <div>
        <label style={labelStyle}>
          Membership Number{' '}
          <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
        </label>
        <input
          type="text"
          value={membershipNumber}
          onChange={e => setMembershipNumber(e.target.value)}
          placeholder="e.g. 42"
          style={inputStyle}
        />
      </div>

      {/* Reference */}
      <div>
        <label style={labelStyle}>
          Payment reference{' '}
          <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
        </label>
        <input
          type="text"
          value={reference}
          onChange={e => setReference(e.target.value)}
          placeholder="e.g. Annual Membership, Guest Fee"
          style={inputStyle}
        />
      </div>

      {/* Amount */}
      <div>
        <label style={labelStyle}>Amount (£)</label>
        <input
          type="number"
          value={amount}
          onChange={e => { setAmount(e.target.value); setError(null); }}
          min="1"
          step="0.01"
          placeholder="0.00"
          style={inputStyle}
        />
      </div>

      {/* Error */}
      {error && (
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          color: '#c0392b',
          margin: 0,
        }}>
          {error}
        </p>
      )}

      {/* PayPal Buttons — only shown when amount is valid */}
      {amountValid ? (
        <PayPalButtons
          style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
          createOrder={async () => {
            setError(null);
            const desc = reference || (memberName ? `${memberName} — Barnes Bowling Club` : 'Barnes Bowling Club payment');
            const res = await fetch('/api/payment/paypal-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount: amountNum.toFixed(2), description: desc }),
            });
            const data = await res.json();
            if (!res.ok || !data.orderID) {
              setError(data.error ?? 'Could not initialise PayPal payment. Please try again.');
              throw new Error(data.error ?? 'order creation failed');
            }
            return data.orderID;
          }}
          onApprove={async (data) => {
            const desc = reference || (memberName ? `${memberName} — Barnes Bowling Club` : 'Barnes Bowling Club payment');
            const res = await fetch('/api/payment/paypal-capture', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderID: data.orderID,
                memberEmail,
                amount: amountNum.toFixed(2),
                description: desc,
              }),
            });
            const result = await res.json();
            if (!res.ok || !result.success) {
              setError(result.error ?? 'Payment capture failed. Please contact us if your account was charged.');
              return;
            }
            setPaidAmount(amountNum.toFixed(2));
            setSuccess(true);
          }}
          onError={() => {
            setError('Something went wrong with PayPal. Please try again or use the card payment above.');
          }}
          onCancel={() => {
            setError(null);
          }}
        />
      ) : (
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '12px',
          color: 'var(--text-muted)',
          margin: 0,
          fontStyle: 'italic',
        }}>
          Enter an amount above to continue with PayPal.
        </p>
      )}
    </div>
  );
}

export function PayPalPaymentForm({ memberEmail }: Props) {
  return (
    <PayPalScriptProvider options={{
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? 'sb',
      currency: 'GBP',
    }}>
      <PayPalForm memberEmail={memberEmail} />
    </PayPalScriptProvider>
  );
}
