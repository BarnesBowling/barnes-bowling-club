import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function Membership() {
  return (
    <>
      <Navbar />
      <main className="membership-section">
        <div className="section-inner">
          <div className="section-tag">Membership</div>
          <h2 className="section-h2">Join a <em>living piece</em><br />of London history</h2>
          <p className="section-lead">
            We may be a small private club, but we&apos;re a friendly, sociable one with a wonderfully colourful history. Over the years, our green has welcomed generations of Barnes residents, including musicians, artists and writers.
          </p>
          <p className="section-lead">
            Whether you&apos;re an experienced player or completely new to bowls, we encourage you to come down, meet us and give it a go.
          </p>

          {/* ── Two-column pricing ── */}
          <div style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'stretch' }}>

            {/* Left: Membership Fee */}
            <div className="membership-card" style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column' }}>
              <div className="membership-card-tag">Member</div>
              <div className="membership-card-name">Membership Fee</div>
              <div className="membership-price">£215</div>
              <div className="membership-price-note">per season</div>
              <ul className="membership-features" style={{ flex: 1 }}>
                <li>Unlimited green access, Apr–Oct</li>
                <li>All club competitions</li>
                <li>Equipment provided for beginners</li>
                <li>Coaching from experienced members</li>
                <li>Club newsletter &amp; social events</li>
                <li>Off-Season social events</li>
              </ul>
              <div className="joining-fee-box">
                <div className="joining-fee-label">One-Time Joining Fee</div>
                <div className="joining-fee-amount">£100</div>
                <div className="joining-fee-note">Payable once on first joining the club</div>
              </div>
              <Link href="/apply" className="pay-btn-gold">Apply for Membership →</Link>
            </div>

            {/* Right: Joining Fee */}
            <div className="membership-card" style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column' }}>
              <div className="membership-card-tag">Joining Fee</div>
              <div className="membership-card-name">Joining the Club</div>
              <div className="membership-price">£100</div>
              <div className="membership-price-note">one-time on joining</div>
              <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '15px', lineHeight: 1.9, color: 'rgba(245,240,232,.75)', margin: 0, flex: 1 }}>
                The one-time joining fee offers lifetime membership to our private club. Applicants are proposed and seconded by two active voting members and join a waitlist; membership and fees are non-transferable.
              </p>
            </div>

          </div>

          {/* ── Wednesday Club Nights ── */}
          <div style={{ marginTop: '2rem' }}>
            <div className="membership-card">
              <div className="membership-card-tag">No Experience Needed</div>
              <div className="membership-card-name">Wednesday Club Nights</div>
              <div style={{ marginTop: '1.5rem' }}>
                <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '15px', lineHeight: 1.9, color: 'rgba(245,240,232,.75)', margin: '0 0 1.25rem' }}>
                  Try your arm at one of our Wednesday evening roll-ups — just turn up! No experience is needed and all equipment is provided on the day.
                </p>
                <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '15px', lineHeight: 1.9, color: 'rgba(245,240,232,.75)', margin: 0 }}>
                  It&apos;s a relaxed, friendly evening — a great way to see if bowls is for you before committing to full membership.
                </p>
              </div>
              <div style={{ marginTop: '2.5rem' }}>
                <Link href="/roll-ups" className="pay-btn-gold">Find Out More →</Link>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
