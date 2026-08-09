import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CorporateHireForm } from './CorporateHireForm';

export const metadata = {
  title: 'Corporate Hire — Barnes Bowling Club',
  description: 'Barnes Bowling Club offers a unique and memorable setting for corporate events, team days, and private hire on our historic green, established in 1725.',
};

export default function CorporateHirePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Page header */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)' }}>
              Barnes Bowling Club
            </div>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
              Corporate <em style={{ color: 'var(--gold-light)' }}>Hire</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              A unique and historic setting for corporate events, team days, and private hire.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="section-inner" style={{ padding: '3.5rem 2rem 5.5rem' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>

            {/* Decorative rule */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
              <div style={{ width: '48px', height: '1px', background: 'rgba(45,90,61,.2)' }} />
            </div>

            <div style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: '16px',
              lineHeight: 1.9,
              color: 'var(--text-mid)',
              marginBottom: '3rem',
            }}>
              <p style={{ marginBottom: '1.5rem' }}>
                Barnes Bowling Club offers a unique and memorable setting for corporate events, team days,
                and private hire. Our historic green, established in 1725, provides an extraordinary backdrop
                for entertaining clients, rewarding teams, and creating lasting impressions.
              </p>

              <p style={{ marginBottom: '1.5rem' }}>
                We offer the green for a limited number of corporate hire dates each season, so early enquiry
                is recommended. Whether you are looking to entertain clients, reward your team, or create a
                truly memorable away day, Barnes Bowling Club provides a unique setting that guests never forget.
              </p>

              <p style={{ marginBottom: '1.5rem' }}>
                Our Elizabethan bowling green, tucked behind the Sun Inn in the heart of Barnes, offers
                something genuinely different — a team building experience that is inclusive, sociable, and
                surprisingly competitive. No experience is needed, and our members are on hand throughout to
                guide your guests and make everyone feel welcome.
              </p>

              <p style={{ margin: 0 }}>
                For enquiries about corporate hire, please contact us at{' '}
                <a
                  href="mailto:info@barnesbowling.com"
                  style={{ color: 'var(--green-mid)', textDecoration: 'underline' }}
                >
                  info@barnesbowling.com
                </a>{' '}
                or use the enquiry form below.
              </p>
            </div>

            {/* Testimonial */}
            <div style={{ marginBottom: '3.5rem' }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--green-deep)',
                margin: '0 0 0.6rem',
              }}>
                What Our Guests Say
              </h2>
              <div style={{ width: '36px', height: '2px', background: 'var(--gold)', marginBottom: '2rem' }} />

              <blockquote style={{
                margin: 0,
                padding: '2rem 2.25rem',
                background: 'var(--cream, #f5f0e8)',
                boxShadow: '0 2px 12px rgba(27,59,38,.08)',
                borderLeft: '3px solid var(--gold)',
              }}>
                <p style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '16px',
                  lineHeight: 1.85,
                  fontStyle: 'italic',
                  color: 'var(--green-deep)',
                  margin: '0 0 1.25rem',
                }}>
                  &ldquo;The competition format worked very well and people were thrilled to be awarded medals.
                  Many colleagues have told me how much they enjoyed talking to the club members and learning
                  from them. Their friendliness and the unique game combine to make the club a very special
                  place — it feels like a safe haven from the world!&rdquo;
                </p>
                <footer style={{
                  fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(45,90,61,.65)',
                  letterSpacing: '.04em',
                }}>
                  <span style={{ color: 'var(--gold)', marginRight: '0.4rem' }}>—</span>
                  Joanna Lipkowska, Hansard · July 2026
                </footer>
              </blockquote>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid rgba(45,90,61,.12)', marginBottom: '3rem' }} />

            <CorporateHireForm />

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
