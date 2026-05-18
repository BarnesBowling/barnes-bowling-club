import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Supporting the OSO — Barnes Bowling Club',
};

export default function SupportingTheOso() {
  return (
    <>
      <Navbar />
      <main>
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a
              href="/community"
              className="section-tag"
              style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}
            >
              Community
            </a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
              Supporting <em style={{ color: 'var(--gold-light)' }}>the OSO</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              Ticket Subsidy Scheme — Supported by Barnes Bowling Club
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3.5rem 2rem 5.5rem' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>

            {/* Hero image — OSO theatre exterior */}
            <div style={{
              width: '100%',
              overflow: 'hidden',
              marginBottom: '2.5rem',
              background: '#111',
            }}>
              <img
                src="/images/community/oso-theatre.png"
                alt="OSO — The Theatre on Barnes Pond"
                style={{ width: '100%', display: 'block', objectFit: 'cover' }}
              />
            </div>

            {/* Article body */}
            <div style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: '16px',
              lineHeight: 1.9,
              color: 'var(--text-mid)',
            }}>

              <p style={{ marginBottom: '1.5rem' }}>
                We're proud to be a long-standing supporter of the{' '}
                <strong>OSO Arts Centre</strong> — our wonderful local theatre on Barnes Pond.
                Specifically, we sponsor the OSO's{' '}
                <strong>Ticket Subsidy Scheme</strong>, helping to make theatre, music, and the arts
                accessible to everyone in our community.
              </p>

              {/* About the Scheme */}
              <div style={{
                background: 'rgba(196,175,128,.08)',
                border: '1px solid rgba(196,175,128,.3)',
                borderTop: '3px solid var(--gold)',
                padding: '1.5rem 1.75rem',
                margin: '2rem 0',
              }}>
                <h2 style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  margin: '0 0 0.85rem',
                }}>
                  About the Scheme
                </h2>
                <p style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '15px',
                  lineHeight: 1.85,
                  color: 'var(--green-deep)',
                  margin: 0,
                }}>
                  The OSO offers either a <strong>50% or 100% subsidy</strong> on the ticket cost of
                  activities, events and shows — ranging from participation in their Youth Theatre,
                  classes and workshops, right through to tickets for performances, including the
                  much-loved annual pantomime.
                </p>
              </div>

              {/* Two-column: Who it Helps + Done with Dignity */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
                margin: '2rem 0 2.5rem',
              }}>
                <div>
                  <h2 style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginBottom: '0.85rem',
                  }}>
                    Who It Helps
                  </h2>
                  <p style={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: '15px',
                    lineHeight: 1.85,
                    color: 'var(--text-mid)',
                    margin: 0,
                  }}>
                    The scheme supports around <strong>300 local residents every year</strong> —
                    primarily children and young families, as well as people with disabilities through
                    offering a subsidy for an accompanying carer.
                  </p>
                </div>

                <div>
                  <h2 style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginBottom: '0.85rem',
                  }}>
                    Done with Dignity
                  </h2>
                  <p style={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: '15px',
                    lineHeight: 1.85,
                    color: 'var(--text-mid)',
                    margin: 0,
                  }}>
                    What we particularly love about the scheme is how it's handled. The OSO processes
                    requests and provides tickets discreetly, so recipients are indistinguishable from
                    other attendees — preserving the joy and dignity of everyone who walks through
                    their doors.
                  </p>
                </div>
              </div>

              {/* Why We Support It */}
              <h2 style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: '0.85rem',
              }}>
                Why We Support It
              </h2>

              <p style={{ marginBottom: '1.5rem' }}>
                The OSO is a treasured part of Barnes life — a fully accessible venue with trained,
                helpful staff who go out of their way to make everyone feel welcome. With ramps,
                automatic doors, an accommodating theatre space, and even Braille menus available in
                the café, they have made huge strides to ensure their doors really are open to all.
              </p>

              <p style={{ marginBottom: '2.5rem' }}>
                By supporting their Ticket Subsidy Scheme, we hope to play a small part in keeping
                those doors open and the seats filled — bringing the arts to families who might
                otherwise miss out. It's one of the things we're most proud of as a club.
              </p>

            </div>

            {/* External link */}
            <a
              href="https://www.oso.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: 'var(--green-mid)',
                textDecoration: 'none',
                marginBottom: '2.5rem',
              }}
            >
              Find out more about the OSO
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                <path d="M7 1l4 4-4 4M1 5h10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>

            {/* Back link */}
            <div>
              <a
                href="/community"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  color: 'var(--green-mid)',
                  textDecoration: 'none',
                }}
              >
                ← Back to Community
              </a>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
