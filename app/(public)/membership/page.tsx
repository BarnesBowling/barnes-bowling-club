import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

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
          <div style={{ marginTop: '3rem' }}>
            <div className="membership-card">
              <div className="membership-card-tag">Full Member</div>
              <div className="membership-card-name">Playing Member</div>
              <div className="membership-price">£215</div>
              <div className="membership-price-note">per season</div>
              <ul className="membership-features">
                <li>Unlimited green access, Apr–Oct</li>
                <li>All club competitions &amp; trophies</li>
                <li>International Day participation</li>
                <li>Equipment provided for beginners</li>
                <li>Coaching from experienced members</li>
                <li>Club newsletter &amp; social events</li>
              </ul>
              <div className="joining-fee-box">
                <div className="joining-fee-label">One-Time Joining Fee</div>
                <div className="joining-fee-amount">£100</div>
                <div className="joining-fee-note">Payable once on first joining the club</div>
              </div>
              <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', color: 'rgba(245,240,232,.5)', textAlign: 'center', margin: '1.25rem 0 0', fontStyle: 'italic' }}>
                Online payments coming soon.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
