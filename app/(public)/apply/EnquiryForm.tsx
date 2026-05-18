'use client';
import { useState } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const optima = "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  border: '1px solid rgba(45,90,61,.22)',
  background: '#fff',
  fontFamily: optima,
  fontSize: '15px',
  color: 'var(--green-deep)',
  outline: 'none',
  boxSizing: 'border-box',
  borderRadius: '2px',
  appearance: 'none',
  WebkitAppearance: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: optima,
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--green-deep)',
  marginBottom: '6px',
};

const asterisk = <span style={{ color: 'var(--gold)', marginLeft: '2px' }}>*</span>;

export function EnquiryForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errMsg, setErrMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrMsg('');

    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/membership-enquiry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name:    fd.get('name')    ?? '',
          email:   fd.get('email')  ?? '',
          phone:   fd.get('phone')  ?? '',
          message: fd.get('message') ?? '',
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Submission failed');
      setStatus('success');
      e.currentTarget.reset();
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div style={{
        padding: '2.5rem 2rem',
        background: 'rgba(45,90,61,.05)',
        border: '1px solid rgba(45,90,61,.18)',
        borderLeft: '4px solid var(--green-deep)',
      }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-deep)', marginBottom: '0.75rem' }}>
          Thank you for your enquiry
        </div>
        <p style={{ fontFamily: optima, fontSize: '15px', lineHeight: 1.75, color: 'rgba(27,59,38,.75)', margin: '0 0 1.25rem' }}>
          We have received your enquiry and will be in touch shortly at the email address you provided.
        </p>
        <button
          onClick={() => setStatus('idle')}
          style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            fontFamily: optima, fontSize: '14px', fontWeight: 600,
            color: 'var(--green-deep)', textDecoration: 'underline',
          }}
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      <style>{`
        .enquiry-input:focus { border-color: var(--gold) !important; }
        .enquiry-submit-btn:hover:not(:disabled) { background: #6b5519 !important; }
      `}</style>

      {status === 'error' && (
        <div style={{
          padding: '1rem 1.25rem',
          background: 'rgba(192,57,43,.05)',
          border: '1px solid rgba(192,57,43,.25)',
          borderLeft: '4px solid #c0392b',
          fontFamily: optima,
          fontSize: '14px',
          color: '#c0392b',
          borderRadius: '2px',
        }}>
          {errMsg || 'Something went wrong. Please try again or email us directly at info@barnesbowling.com.'}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label style={labelStyle}>Full Name {asterisk}</label>
        <input name="name" type="text" required autoComplete="name" className="enquiry-input" style={inputStyle} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label style={labelStyle}>Email Address {asterisk}</label>
        <input name="email" type="email" required autoComplete="email" className="enquiry-input" style={inputStyle} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label style={labelStyle}>Phone Number</label>
        <input name="phone" type="tel" autoComplete="tel" className="enquiry-input" style={inputStyle} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label style={labelStyle}>Message</label>
        <textarea
          name="message"
          rows={5}
          className="enquiry-input"
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          placeholder="Any questions, or tell us a little about yourself…"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="enquiry-submit-btn"
          style={{
            padding: '0.85rem 2rem',
            background: status === 'submitting' ? 'rgba(168,149,96,0.55)' : 'var(--gold)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            fontFamily: optima,
            fontSize: '16px',
            fontWeight: 600,
            cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {status === 'submitting' ? 'Sending…' : 'Send Enquiry'}
        </button>
      </div>

    </form>
  );
}
