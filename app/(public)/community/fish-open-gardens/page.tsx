import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'FISH Open Gardens — Barnes Bowling Club',
};

export default function FishOpenGardens() {
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
              We Are Opening <em style={{ color: 'var(--gold-light)' }}>Our Garden</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              Barnes Bowling Club joins the FiSH Barnes Open Gardens 2026.
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3.5rem 2rem 5.5rem' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>

            {/* Hero image — Barnes Open Gardens flyer */}
            <div style={{
              width: '100%',
              overflow: 'hidden',
              marginBottom: '2.5rem',
              background: 'var(--green-deep)',
            }}>
              <img
                src="/images/community/fish-open-gardens.png"
                alt="Barnes Open Gardens — Sunday 31st May 2026"
                style={{ width: '100%', display: 'block', objectFit: 'cover' }}
              />
            </div>

            {/* YouTube embed */}
            <div style={{
              position: 'relative',
              width: '100%',
              paddingBottom: '56.25%',
              marginBottom: '2.5rem',
              background: '#000',
            }}>
              <iframe
                src="https://www.youtube.com/embed/dvZ0ghfp2B4"
                title="Barnes Open Gardens 2026 — Barnes Bowling Club"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 0,
                }}
              />
            </div>

            {/* Event details info box */}
            <div style={{
              background: 'rgba(196,175,128,.1)',
              border: '1px solid rgba(196,175,128,.35)',
              borderTop: '3px solid var(--gold)',
              padding: '1.5rem 1.75rem',
              marginBottom: '2.5rem',
            }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                margin: '0 0 1rem',
              }}>
                Event Details
              </p>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                lineHeight: 1.9,
                color: 'var(--green-deep)',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                columnGap: '0.75rem',
                rowGap: '0.2rem',
              }}>
                <span>Date</span><span><strong>Sunday 31st May 2026</strong></span>
                <span>Time</span><span>1pm to 6pm</span>
                <span>Tickets</span><span>£10 per ticket — under 16s free</span>
                <span>Location</span><span>Around Barnes, with shuttle buses circling the route</span>
              </div>
            </div>

            {/* Article body */}
            <div style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: '16px',
              lineHeight: 1.9,
              color: 'var(--text-mid)',
            }}>

              <p style={{ marginBottom: '1.5rem' }}>
                We're delighted to be opening the Barnes Bowling Club green as part of the{' '}
                <strong>FiSH Barnes Open Gardens 2026</strong> — a wonderful afternoon of community
                spirit, beautiful gardens, and a very good cause.
              </p>

              <p style={{ marginBottom: '2rem' }}>
                Once every two years, Barnes opens up. Around 20 of the most beautiful private gardens
                across our village throw open their gates for one afternoon to raise money for FiSH
                Neighbourhood Care — and we're proud to be one of them.
              </p>

              {/* Photo of the green */}
              <figure style={{ margin: '0 0 2.5rem', padding: 0 }}>
                <div style={{ width: '100%', overflow: 'hidden', background: 'var(--green-deep)' }}>
                  <img
                    src="/images/gallery9.JPG"
                    alt="The Barnes Bowling Club green"
                    style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: '380px' }}
                  />
                </div>
                <figcaption style={{
                  marginTop: '0.6rem',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: 'rgba(45,90,61,.55)',
                  letterSpacing: '.03em',
                }}>
                  Our 300-year-old green — open to visitors on 31st May
                </figcaption>
              </figure>

              {/* Two-column section */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
                marginBottom: '2.5rem',
              }}>

                {/* What to expect */}
                <div>
                  <h2 style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginBottom: '1rem',
                  }}>
                    What to Expect
                  </h2>
                  <p style={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: '15px',
                    lineHeight: 1.85,
                    color: 'var(--text-mid)',
                    marginBottom: '1rem',
                  }}>
                    From cottage gardens bursting with colour to woodland gardens with magnificent
                    specimen trees, you'll find every style imaginable — Victorian plots, modern
                    designs, hidden courtyards, and tranquil corners. It's a rare chance to peek
                    behind the gates of some of Barnes' best-kept secrets.
                  </p>
                  <p style={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: '15px',
                    lineHeight: 1.85,
                    color: 'var(--text-mid)',
                    marginBottom: '0.5rem',
                  }}>
                    On our beloved green, you'll find:
                  </p>
                  <ul style={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: '15px',
                    lineHeight: 1.85,
                    color: 'var(--text-mid)',
                    padding: '0',
                    margin: '0',
                    listStyle: 'none',
                  }}>
                    {[
                      'The historic bowling green in its summer glory',
                      'Members on hand to chat about the Club\'s 300-year heritage',
                      'A FiSH bus hopping between gardens around the village',
                      'Afternoon teas at the Barnes Green Centre',
                      'A Pimm\'s tent and live music from the Barnes Concert Band',
                    ].map((item, i) => (
                      <li key={i} style={{ marginBottom: '0.3rem' }}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* About FiSH */}
                <div>
                  <h2 style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginBottom: '1rem',
                  }}>
                    About FiSH
                  </h2>
                  <p style={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: '15px',
                    lineHeight: 1.85,
                    color: 'var(--text-mid)',
                    marginBottom: '1rem',
                  }}>
                    FiSH Neighbourhood Care provides volunteer friendship, help and support for older
                    people in Barnes, Mortlake and East Sheen. Every penny raised from Open Gardens
                    goes directly to keeping their vital work going.
                  </p>
                  <p style={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: '15px',
                    lineHeight: 1.85,
                    color: 'var(--text-mid)',
                  }}>
                    From regular phone calls and visits to shopping support and friendship for those
                    who would otherwise be isolated — FiSH makes an enormous difference to lives
                    across our community.
                  </p>
                </div>

              </div>

              <p style={{ marginBottom: '2.5rem' }}>
                We can't wait to welcome you to the green on 31st May. Bring friends, bring family,
                bring sun cream — and bring an appetite for cake!
              </p>

            </div>

            {/* CTA links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              <a
                href="https://www.fishhelp.org.uk/"
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
                }}
              >
                Buy Tickets / Find out more
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                  <path d="M7 1l4 4-4 4M1 5h10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a
                href="https://www.fishhelp.org.uk/"
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
                }}
              >
                Donate to FiSH
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                  <path d="M7 1l4 4-4 4M1 5h10" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>

            {/* Back link */}
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
      </main>
      <Footer />
    </>
  );
}
