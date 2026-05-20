import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { pastPresidents } from '@/data/archive-roles';

export const metadata = { title: 'Past Presidents — Barnes Bowling Club' };

export default function PastPresidentsPage() {
  return (
    <>
      <style>{`
        .timeline-wrap {
          position: relative;
          padding: 2rem 0 3rem;
        }
        .timeline-wrap::before {
          content: '';
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, #A89560 0%, rgba(168,149,96,0.25) 100%);
        }
        .tl-entry {
          display: flex;
          align-items: center;
          min-height: 48px;
          position: relative;
        }
        .tl-entry.tl-left  { flex-direction: row; }
        .tl-entry.tl-right { flex-direction: row-reverse; }
        .tl-content {
          flex: 0 0 calc(50% - 24px);
          padding: 6px 20px;
        }
        .tl-entry.tl-left  .tl-content { text-align: right; }
        .tl-entry.tl-right .tl-content { text-align: left; }
        .tl-dot {
          flex: 0 0 12px;
          height: 12px;
          border-radius: 50%;
          background: #A89560;
          border: 2px solid #C4AF80;
          z-index: 1;
          box-shadow: 0 0 0 3px rgba(168,149,96,0.15);
        }
        .tl-spacer {
          flex: 0 0 calc(50% - 24px);
        }
        .tl-year {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #A89560;
          margin-bottom: 2px;
        }
        .tl-name {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          font-weight: 500;
          color: var(--text-dark);
          line-height: 1.3;
        }
        .tl-name.tl-tbd {
          color: var(--text-muted);
          font-style: italic;
          font-size: 14px;
        }
        @media (max-width: 600px) {
          .timeline-wrap::before {
            left: 20px;
          }
          .tl-entry.tl-left,
          .tl-entry.tl-right {
            flex-direction: row;
          }
          .tl-spacer { display: none; }
          .tl-dot { margin: 0 12px 0 14px; }
          .tl-content {
            flex: 1;
            text-align: left !important;
            padding: 6px 8px 6px 0;
          }
        }
      `}</style>
      <Navbar />
      <main>
        {/* Header */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
              <a href="/members/archive" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none', marginBottom: 0 }}>
                Archive
              </a>
            </div>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Past <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Presidents</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Presidents</em> of Barnes Bowling Club, 1977 to present.
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>

          <div className="timeline-wrap">
            {pastPresidents.map((entry, i) => {
              const side = i % 2 === 0 ? 'tl-left' : 'tl-right';
              const isTbd = entry.name === 'TBD';
              return (
                <div key={entry.year} className={`tl-entry ${side}`}>
                  <div className="tl-content">
                    <div className="tl-year">{entry.year}</div>
                    <div className={`tl-name${isTbd ? ' tl-tbd' : ''}`}>{isTbd ? 'To be added' : entry.name}</div>
                  </div>
                  <div className="tl-dot" />
                  <div className="tl-spacer" />
                </div>
              );
            })}
          </div>

          {/* Back links */}
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <a href="/members/archive" style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: 'var(--green-mid)',
              textDecoration: 'none',
              letterSpacing: '.05em',
            }}>
              ← Back to Archive
            </a>
            <a href="/members/dashboard" style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              letterSpacing: '.05em',
            }}>
              ← Back to dashboard
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
