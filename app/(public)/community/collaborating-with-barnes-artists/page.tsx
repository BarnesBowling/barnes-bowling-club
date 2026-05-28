import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Collaborating with Barnes Artists — Barnes Bowling Club',
};

export default function CollaboratingWithBarnesArtists() {
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
              Collaborating with <em style={{ color: 'var(--gold-light)' }}>Barnes Artists</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              A creative partnership born from our Tricentenary celebrations.
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3.5rem 2rem 5.5rem' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>

            {/* Hero image */}
            <div style={{
              width: '100%',
              aspectRatio: '16/7',
              overflow: 'hidden',
              marginBottom: '2.5rem',
              background: 'var(--green-deep)',
            }}>
              <img
                src="/images/community/supporting-barnes-artists.png"
                alt="Painting of people playing bowls on the green"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
                In spring 2025, Barnes Bowling Club and Barnes Artists came together for the fourth OSO Easter Art
                Fair — held from 17 to 21 April at the Arts Centre. Around 30 artists exhibited a wonderful mix of
                work across different genres and media, and the Club was proud to be part of it.
              </p>

              <p style={{ marginBottom: '1.5rem' }}>
                The fair featured a dedicated panel of works inspired by the Club, with Barnes Artists generously
                donating one of the paintings as a raffle prize for the Club — a gesture that spoke volumes about the
                warmth of the partnership. Michelle Hawes' piece{' '}
                <em>"Celebrating History"</em> was selected for the OSO's advance publicity, a fitting tribute to the
                subject matter.
              </p>

              {/* Inline photo 1 — Katie James */}
              <figure style={{ margin: '2rem 0', padding: 0 }}>
                <div style={{
                  width: '100%',
                  overflow: 'hidden',
                  background: 'var(--green-deep)',
                }}>
                  <img
                    src="/images/community/barnes-artists/katie-james.jpg"
                    alt="Katie James — painting exhibited at the OSO Easter Art Fair"
                    style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                  />
                </div>
                <figcaption style={{
                  marginTop: '0.6rem',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: 'rgba(45,90,61,.55)',
                  fontStyle: 'normal',
                  letterSpacing: '.03em',
                }}>
                  Work by Katie James, exhibited at the OSO Easter Art Fair 2025
                </figcaption>
              </figure>

              <p style={{ marginBottom: '1.5rem' }}>
                The partnership began in 2023, when the Club was planning how to mark its Tricentenary in 2025. We
                invited local artists down to the green to see if 300 years of history might spark some creativity —
                and it absolutely did. The 2024 season saw a real flurry of artistic activity, with David Pearce's
                painting of the coats and hats in the Clubhouse becoming the headline image of the November 2024
                Barnes Art Fair, where it sold almost immediately.
              </p>

              {/* Inline photo 2 — Fran Howard */}
              <figure style={{ margin: '2rem 0', padding: 0 }}>
                <div style={{
                  width: '100%',
                  overflow: 'hidden',
                  background: 'var(--green-deep)',
                }}>
                  <img
                    src="/images/community/barnes-artists/fran-howard.jpg"
                    alt="Fran Howard — watercolour of Barnes Bowling Club"
                    style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                  />
                </div>
                <figcaption style={{
                  marginTop: '0.6rem',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: 'rgba(45,90,61,.55)',
                  fontStyle: 'normal',
                  letterSpacing: '.03em',
                }}>
                  Watercolour by Fran Howard
                </figcaption>
              </figure>

              <p style={{ marginBottom: '1.5rem' }}>
                The OSO kindly agreed to group the works together as a joint panel — something they don't usually
                do — and the Club contributed £100 towards the cost of the display as part of its Tricentenary
                celebrations. It felt like the right way to honour both the green and the artists who had found
                inspiration in it.
              </p>

              {/* Inline photo 3 — artist at easel */}
              <figure style={{ margin: '2rem 0', padding: 0 }}>
                <div style={{
                  width: '100%',
                  overflow: 'hidden',
                  background: 'var(--green-deep)',
                }}>
                  <img
                    src="/images/community/barnes-artists/artist-at-easel.jpg"
                    alt="Artist painting on the bowling green"
                    style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                  />
                </div>
                <figcaption style={{
                  marginTop: '0.6rem',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: 'rgba(45,90,61,.55)',
                  fontStyle: 'normal',
                  letterSpacing: '.03em',
                }}>
                  An artist at work on the bowling green
                </figcaption>
              </figure>

              <p style={{ marginBottom: '2rem' }}>
                Many of the works — including pieces by Michelle Hawes and David Pearce — also featured in a book of
                Barnes Artists' works published in 2025. It is a lasting memento of a genuinely mutual collaboration,
                and a reminder that a 300-year-old bowling green can still inspire something new.
              </p>

            </div>

            {/* External link */}
            <a
              href="https://www.barnesartists.org/"
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
              Find out more about Barnes Artists
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
