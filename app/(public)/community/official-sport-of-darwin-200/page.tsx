import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'The Official Sport of Darwin 200 — Barnes Bowling Club',
};

export default function OfficialSportOfDarwin200() {
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
              The Official Sport of <em style={{ color: 'var(--gold-light)' }}>Darwin 200</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              How Barnes Bowls Went Global
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3.5rem 2rem 5.5rem' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>

            {/* Hero image — Darwin 200 / Barnes Bowls branded */}
            <div style={{
              width: '100%',
              overflow: 'hidden',
              marginBottom: '2.5rem',
              background: '#0a1628',
            }}>
              <img
                src="/images/community/darwin-200.png"
                alt="Darwin 200 — Barnes Bowls Official Sport"
                style={{ width: '100%', display: 'block', objectFit: 'contain' }}
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
                In August 2023, the Darwin 200 Project appointed Barnes Bowls as its{' '}
                <strong>Official Sport</strong> — a wonderful honour for our little Club tucked behind
                the Sun Inn. The connection was inspired by the departure of the tall ship{' '}
                <em>Oosterschelde</em> from Plymouth, echoing Sir Francis Drake's famous voyage from
                the same port in 1588. As the only remaining bowling club in London still playing the
                Elizabethan game — diagonally on the green with biased woods — Barnes was the
                natural choice.
              </p>

              <p style={{ marginBottom: '1.5rem' }}>
                The link was made all the more fitting by the fact that Darwin 200 founder Andrew Fox
                is also our Club Treasurer. The Club entrusted Andrew with four woods and a jack to
                take aboard the tall ship in Rio de Janeiro in November 2023, ready to be played at
                landfalls throughout the epic voyage — all the way to Australia and back to Falmouth
                in July 2025.
              </p>

              <p style={{ marginBottom: '2rem' }}>
                Our ancient Barnes green was lovingly measured to create a perfect template that could
                be replicated anywhere in the world using red and white chain. From there, our
                300-year-old game went global.
              </p>

              {/* Pull-out quote */}
              <blockquote style={{
                margin: '2rem 0 2.5rem',
                padding: '1.75rem 2rem',
                borderTop: '2px solid var(--gold)',
                borderBottom: '2px solid var(--gold)',
                background: 'rgba(196,175,128,.08)',
              }}>
                <p style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '17px',
                  lineHeight: 1.8,
                  color: 'var(--green-deep)',
                  fontStyle: 'italic',
                  margin: '0 0 1rem',
                }}>
                  "I can confirm with enthusiasm that the committee of our club has unanimously agreed
                  to this partnership. I also confirm that I have been elected to act as official
                  liaison for the club. May I thank Darwin 200, yourself and Andrew for this wonderful
                  opportunity. It is a genuine honour to have been invited to 'take the voyage'
                  with you."
                </p>
                <cite style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '.07em',
                  textTransform: 'uppercase',
                  color: 'var(--gold)',
                  fontStyle: 'normal',
                }}>
                  Kevin Hill, Chairman, Barnes Bowling Club
                </cite>
              </blockquote>

              {/* Photo 1 */}
              <figure style={{ margin: '2rem 0', padding: 0 }}>
                <div style={{ width: '100%', overflow: 'hidden', background: 'var(--green-deep)' }}>
                  <img
                    src="/images/community/darwin-200/rio-1.jpg"
                    alt="Barnes Bowls being played in Rio de Janeiro"
                    style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                  />
                </div>
                <figcaption style={{
                  marginTop: '0.6rem',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: 'rgba(45,90,61,.55)',
                  letterSpacing: '.03em',
                }}>
                  The first international game of Barnes Bowls — Botanical Gardens, Rio de Janeiro
                </figcaption>
              </figure>

              <p style={{ marginBottom: '1.5rem' }}>
                The first international game of Barnes Bowls was played at the Botanical Gardens of
                Rio de Janeiro, right below the iconic Christ the Redeemer statue. Joining Andrew for
                this historic occasion were Sarah Darwin — Charles Darwin's great-great-granddaughter
                herself — along with John McKinley and Joe Grabowski. What a place to roll the first
                wood!
              </p>

              {/* Photo 2 */}
              <figure style={{ margin: '2rem 0', padding: 0 }}>
                <div style={{ width: '100%', overflow: 'hidden', background: 'var(--green-deep)', height: '420px' }}>
                  <img
                    src="/images/green_summer.webp"
                    alt="The Barnes Bowling Club green — home of the game since 1725"
                    style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover', objectPosition: 'center 30%' }}
                  />
                </div>
                <figcaption style={{
                  marginTop: '0.6rem',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: 'rgba(45,90,61,.55)',
                  letterSpacing: '.03em',
                }}>
                  The Barnes Bowling Club green — where it all began
                </figcaption>
              </figure>

              {/* Photo 3 */}
              <figure style={{ margin: '2rem 0', padding: 0 }}>
                <div style={{ width: '100%', overflow: 'hidden', background: 'var(--green-deep)' }}>
                  <img
                    src="/images/community/darwin-200/rio-3.jpg"
                    alt="Barnes Bowls in Rio de Janeiro, November 2023"
                    style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                  />
                </div>
                <figcaption style={{
                  marginTop: '0.6rem',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: 'rgba(45,90,61,.55)',
                  letterSpacing: '.03em',
                }}>
                  Barnes Bowls at the Botanical Gardens of Rio de Janeiro, November 2023
                </figcaption>
              </figure>

              <p style={{ marginBottom: '1.5rem' }}>
                The adventure didn't stop there. In May 2024, the game made it to the Galapagos
                Islands — bringing our Elizabethan tradition to one of the most extraordinary places
                on Earth. And Andrew has since secured an even larger green for a day of sport on the
                next Darwin 200 voyage in 2026–28, deep in the Atlantic Rainforest.
              </p>

              {/* Photo 4 */}
              <figure style={{ margin: '2rem 0 2.5rem', padding: 0 }}>
                <div style={{ width: '100%', overflow: 'hidden', background: 'var(--green-deep)' }}>
                  <img
                    src="/images/community/darwin-200/rio-4.jpg"
                    alt="Barnes Bowls — the game goes global"
                    style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                  />
                </div>
                <figcaption style={{
                  marginTop: '0.6rem',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: 'rgba(45,90,61,.55)',
                  letterSpacing: '.03em',
                }}>
                  The game continues — Barnes Bowls on the Darwin 200 voyage
                </figcaption>
              </figure>

              <p style={{ marginBottom: '2rem' }}>
                From a small green behind a pub in south-west London to the Botanical Gardens of Rio,
                the Galapagos Islands, and beyond — it's fair to say our little 300-year-old game is
                getting around.
              </p>

            </div>

            {/* External link */}
            <a
              href="https://darwin200.com"
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
              Find out more about Darwin 200
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
