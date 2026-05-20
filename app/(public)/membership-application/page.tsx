import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ApplicationForm } from './ApplicationForm';

export default function MembershipApplication() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── Green header ── */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)' }}>
              Membership
            </div>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)', marginBottom: '1rem' }}>
              Membership <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Application</em>
            </h1>
            <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '15px', color: 'rgba(245,240,232,.72)', maxWidth: '540px', lineHeight: 1.7 }}>
              For those who have already visited the Club and met or played with at least two Committee Members.
            </p>
          </div>
        </div>

        {/* ── Form + Sidebar ── */}
        <div style={{ background: '#ffffff', borderBottom: '1px solid rgba(45,90,61,.07)' }}>
          <div className="section-inner" style={{ padding: '4rem 2rem 5rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1.8fr) minmax(0,1fr)',
              gap: '2rem',
              alignItems: 'start',
            }}>

              {/* ── Left: form ── */}
              <ApplicationForm />

              {/* ── Right: BBC sidebar ── */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2rem', paddingTop: '0.5rem' }}>

                {/* BBC wordmark + EST */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0' }}>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '143px',
                    fontWeight: 700,
                    letterSpacing: '0.036em',
                    color: 'var(--green-deep)',
                    lineHeight: 1,
                  }}>
                    BBC
                  </div>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--green-deep)',
                    letterSpacing: '0.18em',
                    paddingLeft: '10px',
                    marginTop: '-8px',
                  }}>
                    EST<sup style={{ color: 'var(--gold)', fontSize: '0.55em', verticalAlign: 'super', marginLeft: '2px', marginRight: '3px', fontStyle: 'italic' }}>c</sup>1725
                  </div>
                </div>

                {/* Barnes Bowling Club + Address block */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0' }}>
                  <div style={{
                    fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                    fontSize: '17px',
                    fontWeight: 700,
                    color: 'var(--green-deep)',
                    letterSpacing: '0.02em',
                    marginBottom: '6px',
                  }}>
                    Barnes Bowling Club
                  </div>
                  <address style={{
                    fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                    fontSize: '15px',
                    color: 'var(--green-deep)',
                    fontStyle: 'normal',
                    lineHeight: 1.7,
                  }}>
                    The Sun Inn,<br />
                    Church Road,<br />
                    Barnes SW13
                  </address>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--green-deep)" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{ width: 14, height: 14, flexShrink: 0 }}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <a href="mailto:info@barnesbowling.com" style={{
                      fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                      fontSize: '15px',
                      color: 'var(--green-deep)',
                      textDecoration: 'none',
                    }}>
                      info@barnesbowling.com
                    </a>
                  </div>

                  {/* Google Map */}
                  <div style={{ width: '100%', maxWidth: '320px', marginTop: '0.5rem', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(45,90,61,.15)' }}>
                    <iframe
                      src="https://www.google.com/maps?q=The+Sun+Inn,+Church+Road,+Barnes,+London+SW13&output=embed"
                      width="100%"
                      height="220"
                      style={{ border: 0, display: 'block' }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Barnes Bowling Club location"
                    />
                  </div>
                </div>

                {/* For Club Use Only */}
                <div style={{
                  width: '100%',
                  maxWidth: '320px',
                  background: 'rgba(45,90,61,0.04)',
                  border: '1px solid rgba(45,90,61,0.15)',
                  borderTop: '3px solid rgba(45,90,61,0.22)',
                  padding: '1.25rem',
                  borderRadius: '2px',
                }}>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase' as const,
                    color: 'rgba(45,90,61,0.45)',
                    marginBottom: '0.4rem',
                  }}>
                    For Club Use Only
                  </div>
                  <p style={{
                    fontFamily: "'Optima','Helvetica Neue',Helvetica,Arial,sans-serif",
                    fontSize: '12px',
                    fontStyle: 'italic',
                    color: 'rgba(45,90,61,0.45)',
                    margin: '0 0 1rem',
                    lineHeight: 1.5,
                  }}>
                    Completed by the Committee on approval.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[
                      { label: 'Received Date',     type: 'date' },
                      { label: 'Approved Date',     type: 'date' },
                      { label: 'Membership Number', type: 'text' },
                      { label: 'Signed By',         type: 'text' },
                    ].map(({ label, type }) => (
                      <div key={label}>
                        <label style={{
                          display: 'block',
                          fontFamily: "'Optima','Helvetica Neue',Helvetica,Arial,sans-serif",
                          fontSize: '11px',
                          fontWeight: 600,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase' as const,
                          color: 'rgba(45,90,61,0.4)',
                          marginBottom: '4px',
                        }}>
                          {label}
                        </label>
                        <input
                          type={type}
                          disabled
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            border: '1px solid rgba(45,90,61,0.1)',
                            borderRadius: '2px',
                            background: 'rgba(45,90,61,0.02)',
                            color: 'rgba(45,90,61,0.3)',
                            fontFamily: "'Optima','Helvetica Neue',Helvetica,Arial,sans-serif",
                            fontSize: '13px',
                            cursor: 'not-allowed',
                            boxSizing: 'border-box' as const,
                          }}
                        />
                      </div>
                    ))}
                    <div>
                      <label style={{
                        display: 'block',
                        fontFamily: "'Optima','Helvetica Neue',Helvetica,Arial,sans-serif",
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase' as const,
                        color: 'rgba(45,90,61,0.4)',
                        marginBottom: '4px',
                      }}>
                        Signature
                      </label>
                      <div style={{
                        height: '64px',
                        border: '1px solid rgba(45,90,61,0.1)',
                        borderRadius: '2px',
                        background: 'rgba(45,90,61,0.02)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <span style={{
                          fontFamily: "'Optima','Helvetica Neue',Helvetica,Arial,sans-serif",
                          fontSize: '12px',
                          fontStyle: 'italic',
                          color: 'rgba(45,90,61,0.25)',
                        }}>
                          Committee signature
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
