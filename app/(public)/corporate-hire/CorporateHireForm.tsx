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

function Field({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column' }}>{children}</div>;
}

export function CorporateHireForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errMsg, setErrMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrMsg('');

    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/corporate-enquiry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          companyName:   fd.get('company_name')   ?? '',
          contactPerson: fd.get('contact_person') ?? '',
          email:         fd.get('email')          ?? '',
          phone:         fd.get('phone')          ?? '',
          attendees:     fd.get('attendees')      ?? '',
          eventDate:     fd.get('event_date')     ?? '',
          details:       fd.get('details')        ?? '',
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Submission failed');
      setStatus('success');
      (e.target as HTMLFormElement).reset();
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
        <p style={{ fontFamily: optima, fontSize: '15px', lineHeight: 1.75, color: 'rgba(27,59,38,.75)', margin: 0 }}>
          Thank you for your enquiry. We will be in touch within 48 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      <style>{`
        .corpform-input:focus { border-color: var(--gold) !important; }
        .corpform-submit-btn:hover:not(:disabled) { background: #6b5519 !important; }
      `}</style>

      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '28px',
        fontWeight: 700,
        color: 'var(--green-deep)',
        margin: '0 0 0.25rem',
      }}>
        Corporate Hire Enquiry
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
          {errMsg || 'Something went wrong. Please try again or email us directly at info@barnesbowling.com.'}
        </div>
      )}

      <Field>
        <label style={labelStyle}>Company Name {asterisk}</label>
        <input name="company_name" type="text" required autoComplete="organization" className="corpform-input" style={inputStyle} />
      </Field>

      <Field>
        <label style={labelStyle}>Contact Person {asterisk}</label>
        <input name="contact_person" type="text" required autoComplete="name" className="corpform-input" style={inputStyle} />
      </Field>

      <Field>
        <label style={labelStyle}>Email Address {asterisk}</label>
        <input name="email" type="email" required autoComplete="email" className="corpform-input" style={inputStyle} />
      </Field>

      <Field>
        <label style={labelStyle}>Telephone Number {asterisk}</label>
        <input name="phone" type="tel" required autoComplete="tel" className="corpform-input" style={inputStyle} />
      </Field>

      <Field>
        <label style={labelStyle}>Proposed Number of Attendees {asterisk}</label>
        <input name="attendees" type="number" required min={1} className="corpform-input" style={inputStyle} />
      </Field>

      <Field>
        <label style={labelStyle}>Event Date {asterisk}</label>
        <input name="event_date" type="date" required className="corpform-input" style={inputStyle} />
      </Field>

      <Field>
        <label style={labelStyle}>Other Details</label>
        <textarea
          name="details"
          rows={5}
          placeholder="Please tell us more about your event, any specific requirements, or questions you may have."
          className="corpform-input"
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
        />
      </Field>

      <div style={{ marginTop: '0.75rem' }}>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="corpform-submit-btn"
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
          {status === 'submitting' ? 'Sending…' : 'Send Enquiry →'}
        </button>
      </div>

    </form>
  );
}
