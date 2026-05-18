'use client';
import { useState, useRef, useEffect } from 'react';

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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: '22px',
      fontWeight: 700,
      color: 'var(--green-deep)',
      marginTop: '2rem',
      marginBottom: '1rem',
    }}>
      {children}
    </h3>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column' }}>{children}</div>;
}

export function ApplicationForm() {
  const [status, setStatus]       = useState<Status>('idle');
  const [errMsg, setErrMsg]       = useState('');
  const [rejoining, setRejoining] = useState<'yes' | 'no' | ''>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing   = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = 'var(--green-deep)';
    ctx.lineWidth   = 1.8;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
  }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const src  = 'touches' in e ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    drawing.current = true;
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    e.preventDefault();
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDraw() { drawing.current = false; }

  function clearSignature() {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrMsg('');

    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/membership-application', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fullName:           fd.get('full_name')            ?? '',
          dob:                fd.get('dob')                  ?? '',
          email:              fd.get('email')                ?? '',
          phone:              fd.get('phone')                ?? '',
          address:            fd.get('address')              ?? '',
          rejoining:          fd.get('rejoining')            ?? '',
          lastMembershipDate: fd.get('last_membership_date') ?? '',
          committeeMembers:   fd.get('committee_members')    ?? '',
          visitDate:          fd.get('visit_date')           ?? '',
          proposerName:       fd.get('proposer_name')        ?? '',
          seconderName:       fd.get('seconder_name')        ?? '',
          agreeToFees:        fd.get('agree_to_fees')        === 'on',
          agreeToAnnualFee:   fd.get('agree_to_annual_fee')  === 'on',
          agreeToGDPR:        fd.get('agree_to_gdpr')        === 'on',
          signature:          canvasRef.current?.toDataURL() ?? '',
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Submission failed');
      setStatus('success');
      e.currentTarget.reset();
      setRejoining('');
      clearSignature();
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
          Thank you for your application
        </div>
        <p style={{ fontFamily: optima, fontSize: '15px', lineHeight: 1.75, color: 'rgba(27,59,38,.75)', margin: '0 0 1.25rem' }}>
          We have received your membership application and will be in touch shortly at the email address you provided.
        </p>
        <button
          onClick={() => setStatus('idle')}
          style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            fontFamily: optima, fontSize: '14px', fontWeight: 600,
            color: 'var(--green-deep)', textDecoration: 'underline',
          }}
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      <style>{`
        .appform-input:focus { border-color: var(--gold) !important; }
        .appform-enquiry-btn:hover { background: rgba(168,149,96,0.1) !important; }
        .appform-submit-btn:hover:not(:disabled) { background: #6b5519 !important; }
      `}</style>

      {/* ── Notice box ── */}
      <div style={{
        background: 'rgba(168,149,96,0.06)',
        borderLeft: '4px solid var(--gold)',
        padding: '1.25rem 1.5rem',
        borderRadius: '4px',
        marginBottom: '0.75rem',
      }}>
        <p style={{ fontFamily: optima, fontSize: '15px', color: 'var(--green-deep)', lineHeight: 1.7, margin: 0 }}>
          This form is for applicants who have already visited the Club and met or played with at least two Committee Members. If you have not yet visited, please start with an enquiry first.
        </p>
        <a
          href="/apply"
          className="appform-enquiry-btn"
          style={{
            display: 'inline-block',
            marginTop: '1rem',
            background: 'transparent',
            border: '1px solid var(--gold)',
            color: 'var(--gold)',
            padding: '0.6rem 1.25rem',
            borderRadius: '4px',
            fontFamily: optima,
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.15s',
          }}
        >
          Not yet visited? Make an Enquiry →
        </a>
      </div>

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

      {/* ── Section 1: Your Details ── */}
      <SectionHeading>Your Details</SectionHeading>

      <Field>
        <label style={labelStyle}>Full Name {asterisk}</label>
        <input name="full_name" type="text" required autoComplete="name" className="appform-input" style={inputStyle} />
      </Field>

      <Field>
        <label style={labelStyle}>Date of Birth {asterisk}</label>
        <input name="dob" type="date" required className="appform-input" style={inputStyle} />
      </Field>

      <Field>
        <label style={labelStyle}>Email Address {asterisk}</label>
        <input name="email" type="email" required autoComplete="email" className="appform-input" style={inputStyle} />
      </Field>

      <Field>
        <label style={labelStyle}>Phone Number {asterisk}</label>
        <input name="phone" type="tel" required autoComplete="tel" className="appform-input" style={inputStyle} />
      </Field>

      <Field>
        <label style={labelStyle}>Address {asterisk}</label>
        <textarea name="address" rows={3} required autoComplete="street-address" className="appform-input" style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
      </Field>

      <Field>
        <label style={labelStyle}>Are you rejoining the Club? {asterisk}</label>
        <div style={{ display: 'flex', gap: '1.75rem', marginTop: '4px' }}>
          {(['yes', 'no'] as const).map(val => (
            <label key={val} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontFamily: optima, fontSize: '15px', color: 'var(--green-deep)', cursor: 'pointer', fontWeight: 'normal' }}>
              <input
                type="radio"
                name="rejoining"
                value={val}
                required
                checked={rejoining === val}
                onChange={() => setRejoining(val)}
                style={{ accentColor: 'var(--gold)', width: '16px', height: '16px', cursor: 'pointer', flexShrink: 0 }}
              />
              {val === 'yes' ? 'Yes' : 'No'}
            </label>
          ))}
        </div>
      </Field>

      {rejoining === 'yes' && (
        <Field>
          <label style={labelStyle}>Last date of membership</label>
          <p style={{ fontFamily: optima, fontSize: '13px', fontStyle: 'italic', color: 'rgba(45,90,61,0.7)', margin: '0 0 6px' }}>
            Approximate is fine if you don&apos;t recall exactly.
          </p>
          <input name="last_membership_date" type="date" className="appform-input" style={inputStyle} />
        </Field>
      )}

      {/* ── Section 2: Your Visit ── */}
      <SectionHeading>Your Visit</SectionHeading>

      <Field>
        <label style={labelStyle}>Names of the two Committee Members you have met or played with {asterisk}</label>
        <p style={{ fontFamily: optima, fontSize: '13px', fontStyle: 'italic', color: 'rgba(45,90,61,0.7)', margin: '0 0 6px' }}>
          Please give both names so we can match your application to your visit.
        </p>
        <textarea name="committee_members" rows={2} required className="appform-input" style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
      </Field>

      <Field>
        <label style={labelStyle}>Approximate date of your visit</label>
        <input name="visit_date" type="date" className="appform-input" style={inputStyle} />
      </Field>

      {/* ── Section 3: Proposer Details ── */}
      <SectionHeading>Proposer Details</SectionHeading>

      <p style={{ fontFamily: optima, fontSize: '14px', fontStyle: 'italic', color: 'rgba(45,90,61,0.7)', margin: '-0.5rem 0 0' }}>
        Please give the names of the two current members who are proposing and seconding your application.
      </p>

      <Field>
        <label style={labelStyle}>Proposer Name {asterisk}</label>
        <input name="proposer_name" type="text" required className="appform-input" style={inputStyle} />
      </Field>

      <Field>
        <label style={labelStyle}>Seconder Name {asterisk}</label>
        <input name="seconder_name" type="text" required className="appform-input" style={inputStyle} />
      </Field>

      {/* ── Section 4: Membership Fees ── */}
      <SectionHeading>Membership Fees</SectionHeading>

      <div style={{ background: 'rgba(168,149,96,0.06)', padding: '1.25rem 1.5rem', borderRadius: '4px' }}>
        <div style={{ fontFamily: optima, fontSize: '15px', color: 'var(--green-deep)', lineHeight: 1.8 }}>
          <div>Annual membership fee: <strong>£215</strong></div>
          <div>One-off joining fee: <strong>£100</strong></div>
        </div>
        <p style={{ fontFamily: optima, fontSize: '14px', fontStyle: 'italic', color: 'rgba(45,90,61,0.75)', margin: '0.75rem 0 0' }}>
          Fees are payable on acceptance of your application.
        </p>
      </div>

      {/* ── Section 5: Confirmations ── */}
      <SectionHeading>Before you submit, please confirm</SectionHeading>

      {[
        {
          name: 'agree_to_fees',
          text: 'I understand that my application will be reviewed by the Committee, and that — should it be approved — both the £100 joining fee and the £215 annual subscription will become payable.',
        },
        {
          name: 'agree_to_annual_fee',
          text: 'I agree to pay the annual membership fee of £215 each year my membership is renewed, by the deadline set out in the Club Constitution.',
        },
        {
          name: 'agree_to_gdpr',
          text: "I understand that Barnes Bowling Club will store my personal data for the period needed to process my application, in line with GDPR. If my application is successful, my data will continue to be processed in accordance with the Club's GDPR and Privacy Policy, available on the Club website or on request from the Secretary.",
        },
      ].map(({ name, text }, i) => (
        <label key={name} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', marginBottom: i < 2 ? '1rem' : 0 }}>
          <input
            type="checkbox"
            name={name}
            required
            style={{ accentColor: 'var(--gold)', width: '17px', height: '17px', marginTop: '3px', flexShrink: 0, cursor: 'pointer' }}
          />
          <span style={{ fontFamily: optima, fontSize: '15px', color: 'var(--green-deep)', lineHeight: 1.7 }}>
            {text}
          </span>
        </label>
      ))}

      {/* ── Signature ── */}
      <div style={{ marginTop: '0.5rem' }}>
        <label style={labelStyle}>Signature (click and drag in the box to sign)</label>
        <canvas
          ref={canvasRef}
          width={600}
          height={160}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          style={{
            display: 'block',
            width: '100%',
            height: '160px',
            border: '1px solid rgba(45,90,61,.22)',
            borderRadius: '2px',
            background: '#fff',
            cursor: 'crosshair',
            touchAction: 'none',
          }}
        />
        <button
          type="button"
          onClick={clearSignature}
          style={{
            marginTop: '6px',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontFamily: optima,
            fontSize: '13px',
            color: 'rgba(45,90,61,0.6)',
            textDecoration: 'underline',
          }}
        >
          Clear signature
        </button>
      </div>

      {/* ── Submit ── */}
      <div style={{ marginTop: '0.75rem' }}>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="appform-submit-btn"
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
          {status === 'submitting' ? 'Submitting…' : 'Submit Application'}
        </button>
      </div>

    </form>
  );
}
