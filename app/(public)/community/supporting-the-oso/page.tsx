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
                As part of our Tricentenary celebrations in 2025, Barnes Bowling Club was proud to make a funding contribution to the{' '}
                <strong>OSO Arts Centre</strong> — our wonderful local theatre on Barnes Pond — specifically to support their{' '}
                <strong>Ticket Subsidy Scheme</strong>, which helps make theatre and the arts accessible to local residents who could not otherwise afford to attend.
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
                  The OSO is a registered charity whose aim is to provide access to the arts for everyone in the community, regardless of financial circumstances. Working with local partners including the Castelnau Community Project, the Power Station Youth Club and local primary schools, the scheme offers <strong>50% or 100% subsidies</strong> on ticket costs — covering Youth Theatre, classes, workshops and performances including the much-loved annual pantomime. The scheme supports around 300 local residents a year and costs £3,000 per year to run.
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

              <p style={{ marginBottom: '2.5rem' }}>
                The OSO is a treasured part of Barnes life — a fully accessible, welcoming venue that
                goes out of its way to ensure everyone can participate. What makes the Ticket Subsidy
                Scheme particularly special is the way it is handled: requests are processed
                discreetly, so recipients are indistinguishable from any other member of the
                audience. For us, contributing to this scheme as part of our Tricentenary felt like
                exactly the right thing to do — connecting 300 years of community life on our green
                with the next generation of arts-goers just around the corner on Barnes Pond.
              </p>

            </div>

            {/* External link */}
            <a
              href="https://www.osoarts.org.uk"
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
