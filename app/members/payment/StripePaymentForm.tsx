'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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

// Gross up net amount to cover Stripe's UK standard fee (1.5% + 20p).
// grossPence = ceil((netPence + 20) / 0.985)
function calcGross(netPence: number): number {
  if (netPence <= 0) return 0;
  return Math.ceil((netPence + 20) / 0.985);
}

function PaymentForm({ memberEmail, defaultAmount, defaultReference }: { memberEmail?: string; defaultAmount?: string; defaultReference?: string }) {
  const stripe = useStripe();
  const elements = useElements();

  const [memberName, setMemberName]           = useState('');
  const [membershipNumber, setMembershipNumber] = useState('');
  const [reference, setReference]             = useState(defaultReference ?? '');
  const [amount, setAmount]                   = useState(defaultAmount ?? '');
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [success, setSuccess]                 = useState(false);
  const [paidAmount, setPaidAmount]           = useState('');

  // Sync when parent changes the pre-fill values (event box clicked)
  const [prevDefault, setPrevDefault] = useState({ defaultAmount, defaultReference });
  if (prevDefault.defaultAmount !== defaultAmount || prevDefault.defaultReference !== defaultReference) {
    setPrevDefault({ defaultAmount, defaultReference });
    setAmount(defaultAmount ?? '');
    setReference(defaultReference ?? '');
  }

  const netPence   = Math.round(parseFloat(amount || '0') * 100);
  const grossPence = calcGross(netPence);
  const grossGBP   = grossPence / 100;
  const showFee    = netPence >= 100; // only show fee notice once ≥£1 entered

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum < 1) {
      setError('Please enter a valid amount (minimum £1).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount:    grossPence,
          netAmount: netPence,
          description: reference || 'Barnes Bowling Club payment',
          name: memberName,
          membershipNumber,
          memberEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? 'Could not initialise payment. Please try again.');
        setLoading(false);
        return;
      }

      const card = elements.getElement(CardElement);
      if (!card) { setLoading(false); return; }

      const { error: stripeError } = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: { card },
      });

      if (stripeError) {
        setError(stripeError.message ?? 'Payment failed.');
        setLoading(false);
        return;
      }

      setPaidAmount(amountNum.toFixed(2));
      setSuccess(true);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    }

    setLoading(false);
  }

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
          Payment of <strong>£{paidAmount}</strong> received. Thank you — a confirmation has been sent to your email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Full Name */}
      <div>
        <label style={labelStyle}>Full Name</label>
        <input
          type="text"
          value={memberName}
          onChange={e => setMemberName(e.target.value)}
          placeholder="Your full name"
          required
          style={inputStyle}
        />
      </div>

      {/* Membership Number */}
      <div>
        <label style={labelStyle}>
          Membership Number <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
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
          Payment reference <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
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
          onChange={e => setAmount(e.target.value)}
          min="1"
          step="0.01"
          required
          placeholder="0.00"
          style={inputStyle}
        />
        {showFee && (
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12px',
            color: 'rgba(39,39,39,.55)',
            margin: '6px 0 0',
            lineHeight: 1.5,
          }}>
            You&apos;ll be charged <strong style={{ color: 'var(--text-dark)' }}>£{grossGBP.toFixed(2)}</strong> so the club receives £{(netPence / 100).toFixed(2)} after card processing fees.
          </p>
        )}
      </div>

      {/* Card input */}
      <div>
        <label style={labelStyle}>Card details</label>
        <div style={{
          padding: '11px 14px',
          background: '#fff',
          border: '1px solid rgba(45,90,61,.25)',
        }}>
          <CardElement options={{
            style: {
              base: {
                fontFamily: "'Libre Baskerville', serif",
                fontSize: '14px',
                color: '#272727',
                '::placeholder': { color: 'rgba(39,39,39,.4)' },
              },
              invalid: { color: '#c0392b' },
            },
          }} />
        </div>
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

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={loading || !stripe}
          style={{
            padding: '12px 32px',
            background: loading ? 'rgba(45,90,61,.5)' : 'var(--green-deep)',
            color: '#fff',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background .15s',
          }}
        >
          {loading ? 'Processing…' : showFee ? `Pay £${grossGBP.toFixed(2)}` : 'Pay Now'}
        </button>
      </div>

      {/* Card brand icons */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {/* Visa */}
        <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x=".5" y=".5" width="37" height="23" rx="3" fill="#fff" stroke="rgba(45,90,61,.2)"/>
          <text x="19" y="16.5" fontFamily="Arial,sans-serif" fontSize="11" fontWeight="700" fill="#1a1f71" textAnchor="middle" letterSpacing="1">VISA</text>
        </svg>
        {/* Mastercard */}
        <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x=".5" y=".5" width="37" height="23" rx="3" fill="#fff" stroke="rgba(45,90,61,.2)"/>
          <circle cx="15" cy="12" r="6" fill="#EB001B"/>
          <circle cx="23" cy="12" r="6" fill="#F79E1B" fillOpacity="0.88"/>
        </svg>
        {/* Amex */}
        <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x=".5" y=".5" width="37" height="23" rx="3" fill="#016FD0" stroke="rgba(45,90,61,.2)"/>
          <text x="19" y="16" fontFamily="Arial,sans-serif" fontSize="8.5" fontWeight="700" fill="#fff" textAnchor="middle" letterSpacing="0.5">AMEX</text>
        </svg>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'rgba(39,39,39,.38)', marginLeft: '2px' }}>
          Secured by Stripe
        </span>
      </div>
    </form>
  );
}

export function StripePaymentForm({ memberEmail, defaultAmount, defaultReference }: { memberEmail?: string; defaultAmount?: string; defaultReference?: string }) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm memberEmail={memberEmail} defaultAmount={defaultAmount} defaultReference={defaultReference} />
    </Elements>
  );
}
