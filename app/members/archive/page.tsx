import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const ARCHIVE_SECTIONS = [
  {
    title: 'Past season results',
    description: 'Final standings, competition results and match records from previous seasons.',
    items: [
      { label: '2025 season results', href: null },
      { label: '2024 season results', href: null },
      { label: '2023 season results', href: null },
    ],
  },
  {
    title: 'Past Presidents and Captains',
    description: 'A year-by-year record of the club\'s Past Presidents and Captains from 1977 to the present day.',
    items: [
      { label: 'Past Presidents', href: '/members/archive/presidents' },
      { label: 'Past Captains',   href: '/members/archive/captains'   },
    ],
  },
  {
    title: 'Historical documents',
    description: 'Club history, founding records and archival material.',
    items: [
      { label: 'Club history documents',  href: null },
      { label: 'Original rules & bylaws', href: null },
      { label: 'Centenary records',       href: null },
    ],
  },
  {
    title: 'Years in Photos',
    description: 'A photographic record of club life, seasons and events through the years.',
    items: [
      { label: 'Years in Photos', href: '/members/archive/years-in-photos' },
    ],
  },
];

export default function ArchivePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a href="/members/dashboard" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>Members Area</a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Archive
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              Past season results, club officers and historical documents from Barnes Bowling Club.
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>

          {ARCHIVE_SECTIONS.map((section) => (
            <section key={section.title} style={{ marginBottom: '3.5rem' }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '22px',
                fontWeight: 500,
                color: 'var(--green-deep)',
                marginBottom: '6px',
              }}>
                {section.title}
              </div>
              <p style={{
                fontFamily: "'Libre Baskerville', serif",
                fontSize: '14px',
                lineHeight: 1.75,
                color: 'var(--text-mid)',
                margin: '0 0 1.25rem',
              }}>
                {section.description}
              </p>
              {section.items.length === 0 ? (
                <p style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '14px',
                  fontStyle: 'italic',
                  color: 'var(--text-muted)',
                  margin: 0,
                }}>
                  Photos coming soon.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(45,90,61,.08)' }}>
                  {section.items.map((item) => (
                    <div key={item.label} style={{
                      background: 'var(--cream)',
                      padding: '1rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <span style={{
                        fontFamily: "'Libre Baskerville', serif",
                        fontSize: '14px',
                        color: 'var(--text-dark)',
                      }}>
                        {item.label}
                      </span>
                      {item.href ? (
                        <a
                          href={item.href}
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '11px',
                            fontWeight: 600,
                            letterSpacing: '.08em',
                            textTransform: 'uppercase',
                            color: 'var(--green-mid)',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          View →
                        </a>
                      ) : (
                        <span style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          fontStyle: 'italic',
                        }}>
                          Coming soon
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}

          {/* Back link */}
          <div style={{ marginTop: '1rem' }}>
            <a href="/members/dashboard" style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: 'var(--green-mid)',
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
