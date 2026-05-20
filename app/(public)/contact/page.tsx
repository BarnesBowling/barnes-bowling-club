import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function Contact() {
  return (
    <>
      <Navbar />
      <main>
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)' }}>Get in Touch</div>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
              Contact <em style={{ color: 'var(--gold-light)' }}>the club</em>
            </h1>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '4rem 2rem' }}>
          <div className="contact-grid">
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                <div>
                  <div className="section-tag">Address</div>
                  <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '16px', lineHeight: 1.7, color: 'var(--text-mid)' }}>
                    Sun Inn, Church Road<br />
                    Barnes, London<br />
                    SW13 9HE
                  </p>
                </div>
                <div>
                  <div className="section-tag">Email</div>
                  <a href="mailto:info@barnesbowling.com" style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-mid)' }}>
                    info@barnesbowling.com
                  </a>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', fontFamily: "'Libre Baskerville', serif", fontStyle: 'italic' }}>
                    We aim to respond within 48 hours
                  </p>
                </div>
                <div>
                  <div className="section-tag">Season</div>
                  <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '16px', lineHeight: 1.7, color: 'var(--text-mid)' }}>
                    25th April to early October<br />
                    Play 7 days a week 11am - 11pm weather permitting
                  </p>
                </div>
                <div>
                  <div className="section-tag">Social</div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '.5rem' }}>
                    <a href="https://www.instagram.com/barnesbowlingclub" target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--green-mid)', fontWeight: 500 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 18, height: 18 }}>
                        <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" />
                        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                      </svg>
                      Instagram
                    </a>
                    <a href="https://www.facebook.com/barnesbowlingclub" target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--green-mid)', fontWeight: 500 }}>
                      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                      Facebook
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--cream-warm)', padding: '2.5rem' }}>
              <Link href="/apply" className="section-tag" style={{ textDecoration: 'none' }}>Membership enquiry</Link>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 500, color: 'var(--green-deep)', marginBottom: '1rem' }}>
                Thinking of Joining?
              </h2>
              <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', lineHeight: 1.8, color: 'var(--green-deep)', marginBottom: '0.9rem' }}>
                If you&apos;ve been wondering whether bowls might be for you, the best thing to do is come along and try. We&apos;re a warm, welcoming Club and there&apos;s nothing better than seeing the green for yourself.
              </p>
              <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', lineHeight: 1.8, color: 'var(--green-deep)', marginBottom: '0.9rem' }}>
                <strong>Wednesday Club Nights</strong> are the perfect introduction. From 6pm every Wednesday, it&apos;s a relaxed, free social evening — no booking, no fee, no experience needed. Just turn up. You&apos;ll meet Members and Committee Members, have a roll-up on the green, and get a real feel for the Club.
              </p>
              <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', lineHeight: 1.8, color: 'var(--green-deep)', marginBottom: '0.9rem' }}>
                There&apos;s always someone happy to lend a hand and show you the ropes. Bowls is one of the few sports where women and men play together as equals — it&apos;s social, surprisingly competitive when you want it to be, and good fun whatever the weather.
              </p>
              <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', lineHeight: 1.8, color: 'var(--green-deep)', marginBottom: '0.9rem' }}>
                A little about us — Barnes Bowling Club is home to <strong>London&apos;s oldest bowling green</strong>, the original Elizabethan green where the game has been played since 1725. We have over <strong>100 Members</strong>, and we&apos;re always delighted to welcome newcomers aged 18 and over.
              </p>
              <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', lineHeight: 1.8, color: 'var(--green-deep)', marginBottom: '2rem' }}>
                <strong>A note on formal applications:</strong> Before any application can be accepted, we ask that you have visited the Club and played with at least two Committee Members. Wednesday Club Nights are the easiest way to do this — and the best way for us to get to know each other.
              </p>
              <Link href="/apply" className="btn-gold" style={{ display: 'inline-block', color: '#ffffff' }}>
                Submit a membership enquiry →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
