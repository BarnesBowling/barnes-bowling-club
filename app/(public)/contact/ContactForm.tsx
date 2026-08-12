'use client';
import { useState } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const optima = "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MAX_MSG = 1000;

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

function Field({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column' }}>{children}</div>;
}

export function ContactForm() {
  const [status, setStatus]   = useState<Status>('idle');
  const [errMsg, setErrMsg]   = useState('');
  const [msgLen, setMsgLen]   = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrMsg('');

    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title:     fd.get('title')      || undefined,
          firstName: fd.get('first_name') ?? '',
          lastName:  fd.get('last_name')  ?? '',
          company:   fd.get('company')    || undefined,
          phone:     fd.get('phone')      || undefined,
          email:     fd.get('email')      ?? '',
          message:   fd.get('message')    ?? '',
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Submission failed');
      setStatus('success');
      (e.target as HTMLFormElement).reset();
      setMsgLen(0);
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
          Message sent
        </div>
        <p style={{ fontFamily: optima, fontSize: '15px', lineHeight: 1.75, color: 'rgba(27,59,38,.75)', margin: 0 }}>
          Thank you for getting in touch. We aim to respond within 48 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      <style>{`
        .contactform-input:focus { border-color: var(--gold) !important; }
        .contactform-btn:hover:not(:disabled) { opacity: 0.88 !important; }
      `}</style>

      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '24px',
        fontWeight: 500,
        color: 'var(--green-deep)',
        margin: '0 0 0.25rem',
      }}>
        Leave Us a Message
      </h2>

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
          {errMsg || 'Something went wrong. Please try again or email info@barnesbowling.club directly.'}
        </div>
      )}

      {/* Title */}
      <Field>
        <label style={labelStyle}>Title</label>
        <select name="title" className="contactform-input" style={inputStyle}>
          <option value="">—</option>
          <option>Mr</option>
          <option>Mrs</option>
          <option>Ms</option>
          <option>Miss</option>
          <option>Dr</option>
          <option>Prof</option>
          <option>Other</option>
        </select>
      </Field>

      {/* First / Last name */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field>
          <label style={labelStyle}>First Name {asterisk}</label>
          <input name="first_name" type="text" required autoComplete="given-name" className="contactform-input" style={inputStyle} />
        </Field>
        <Field>
          <label style={labelStyle}>Last Name {asterisk}</label>
          <input name="last_name" type="text" required autoComplete="family-name" className="contactform-input" style={inputStyle} />
        </Field>
      </div>

      {/* Company */}
      <Field>
        <label style={labelStyle}>Company <span style={{ fontWeight: 400, color: 'rgba(45,90,61,.5)', fontSize: '13px' }}>(optional)</span></label>
        <input name="company" type="text" autoComplete="organization" className="contactform-input" style={inputStyle} />
      </Field>

      {/* Phone */}
      <Field>
        <label style={labelStyle}>Phone <span style={{ fontWeight: 400, color: 'rgba(45,90,61,.5)', fontSize: '13px' }}>(optional)</span></label>
        <input name="phone" type="tel" autoComplete="tel" className="contactform-input" style={inputStyle} />
      </Field>

      {/* Email */}
      <Field>
        <label style={labelStyle}>Email Address {asterisk}</label>
        <input name="email" type="email" required autoComplete="email" className="contactform-input" style={inputStyle} />
      </Field>

      {/* Message + counter */}
      <Field>
        <label style={labelStyle}>Message {asterisk}</label>
        <textarea
          name="message"
          required
          rows={6}
          maxLength={MAX_MSG}
          placeholder="How can we help?"
          className="contactform-input"
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6, padding: '12px 14px' }}
          onChange={e => setMsgLen(e.target.value.length)}
        />
        <div style={{
          marginTop: '5px',
          textAlign: 'right',
          fontFamily: optima,
          fontSize: '12px',
          color: msgLen >= MAX_MSG ? '#c0392b' : 'rgba(45,90,61,.45)',
        }}>
          {msgLen} / {MAX_MSG}
        </div>
      </Field>

      <div style={{ marginTop: '0.5rem' }}>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="contactform-btn"
          style={{
            padding: '0.85rem 2rem',
            background: status === 'submitting' ? 'rgba(27,59,38,0.45)' : 'var(--green-deep)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '2px',
            fontFamily: optima,
            fontSize: '15px',
            fontWeight: 600,
            letterSpacing: '.04em',
            cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.15s',
          }}
        >
          {status === 'submitting' ? 'Sending…' : 'Send Message →'}
        </button>
      </div>

    </form>
  );
}
