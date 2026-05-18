import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const NOTICES: { title: string; pdf: string }[] = [
  { title: 'Sun Inn Bins',         pdf: '/notices/sun-inn-bins.pdf' },
  { title: 'Nightly Club Pack-up', pdf: '/notices/nightly-club-packup.pdf' },
];

// Scale trick: render iframe at full quality size, shrink visually with CSS transform.
// PDF renders at PDF_W × PDF_H; CSS scale brings the visual output down to CARD_W × CARD_H.
const CARD_W = 143;
const CARD_H = Math.round(CARD_W * 1.414);   // 202px  (A4 portrait ratio)
const PDF_W  = 930;
const PDF_H  = Math.round(PDF_W  * 1.414);   // 1315px
const SCALE  = CARD_W / PDF_W;               // ≈ 0.154

export default function Notices() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── Green header ── */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)' }}>
              News &amp; Events
            </div>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
              Notices <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>2026</em>
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: 'rgba(245,240,232,.72)', maxWidth: '540px', lineHeight: 1.7 }}>
              Club announcements, important updates and member information.
            </p>
          </div>
        </div>

        {/* ── Noticeboard ── */}
        <div style={{ background: '#f5f0e6', borderBottom: '1px solid rgba(45,90,61,.07)' }}>
          <div className="section-inner" style={{ padding: '4rem 2rem 5rem' }}>
            <div className="notice-board">
              <div className="notice-grid">
                {NOTICES.map(({ title, pdf }) => (
                  <div key={pdf} className="notice-card" style={{ width: CARD_W, height: CARD_H }}>
                    <div className="notice-pin notice-pin-left" />
                    <div className="notice-pin notice-pin-right" />
                    <div className="notice-card-inner">
                      {/* Wrapper clipped to card dimensions; iframe renders full-quality then CSS scales it down */}
                      <a
                        href={pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'block', lineHeight: 0, width: '100%', height: '100%' }}
                      >
                        <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
                          <iframe
                            src={`${pdf}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                            width={PDF_W}
                            height={PDF_H}
                            style={{
                              border: 'none',
                              display: 'block',
                              pointerEvents: 'none',
                              transform: `scale(${SCALE})`,
                              transformOrigin: 'top left',
                            }}
                            title={title}
                          />
                        </div>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
