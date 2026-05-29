import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { HistoryTimeline } from './HistoryTimeline';
import { historyTimeline } from '@/data/history-timeline';

export default async function HistoryPage() {
  const supabase = await createClient();
  const [{ data: sections }, { data: timelineData }] = await Promise.all([
    supabase.from('history_sections').select('*').order('sort_order'),
    supabase.from('history_timeline').select('year, title, description').order('year'),
  ]);

  const timelineEntries = (timelineData && timelineData.length > 0)
    ? timelineData
    : historyTimeline;

  return (
    <>
      <Navbar />
      <main>

        {/* Hero */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem' }}>
          <div style={{ maxWidth: '740px', margin: '0 auto' }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '.22em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              fontFamily: "'DM Sans', sans-serif",
              borderTop: '1.5px solid var(--gold)',
              paddingTop: '8px',
              display: 'inline-block',
              marginBottom: '1.5rem',
            }}>
              Our Story
            </div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              fontWeight: 500,
              color: 'var(--cream)',
              lineHeight: 1.15,
              margin: '0 0 1.5rem',
            }}>
              Club <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>History</em>
            </h1>
            <p style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: '18px',
              lineHeight: 1.8,
              color: 'rgba(245,240,232,.7)',
              margin: 0,
              maxWidth: '560px',
            }}>
              Three centuries of bowling in the heart of Barnes.
              The Sun Inn was first recorded in 1746, with its bowling green already established alongside it.
            </p>

            {/* Watch our story callout */}
            <div style={{
              marginTop: '2.5rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(245,240,232,.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              flexWrap: 'wrap',
            }}>
              <img
                src="/images/icons/megaphone.png"
                alt=""
                aria-hidden="true"
                style={{ width: '64px', height: '64px', objectFit: 'contain', flexShrink: 0, filter: 'invert(1) sepia(1) saturate(4) brightness(1.2)', mixBlendMode: 'screen' }}
              />
              <div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '.15em',
                  textTransform: 'uppercase',
                  color: 'rgba(245,240,232,.45)',
                  marginBottom: '0.25rem',
                }}>
                  Now Showing
                </div>
                <div style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '17px',
                  color: 'var(--cream)',
                  fontStyle: 'italic',
                  marginBottom: '0.5rem',
                }}>
                  Watch our story — Bowling in Barnes
                </div>
                <a
                  href="https://youtu.be/LM6YeCjYpQE"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color: '#c9a84c',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  Find out more
                  <svg width="11" height="9" viewBox="0 0 12 10" fill="none" aria-hidden="true">
                    <path d="M7 1l4 4-4 4M1 5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Article body */}
        <div style={{ background: 'var(--cream)', padding: '4rem 2rem 6rem' }}>
          <div style={{ maxWidth: '740px', margin: '0 auto' }}>

            {sections && sections.length > 0 ? sections.map((s, i) => (
              <article key={s.id} style={{ marginBottom: i < sections.length - 1 ? '4rem' : 0 }}>

                {/* Section number + rule */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.25rem',
                }}>
                  <span style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '11px',
                    color: 'var(--gold)',
                    fontWeight: 500,
                    flexShrink: 0,
                  }}>
                    {String(s.sort_order).padStart(2, '0')}
                  </span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(45,90,61,.15)' }} />
                </div>

                {/* Heading */}
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  fontWeight: 500,
                  color: 'var(--green-deep)',
                  margin: '0 0 1.25rem',
                  lineHeight: 1.2,
                }}>
                  {s.title}
                </h2>

                {/* Body */}
                <div style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '16px',
                  lineHeight: 2,
                  color: 'var(--text-mid)',
                }}>
                  {s.body.split('\n\n').map((para: string, j: number) => (
                    <p key={j} style={{ margin: j > 0 ? '1.25em 0 0' : 0 }}>{para}</p>
                  ))}
                </div>

              </article>
            )) : (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: "'Libre Baskerville', serif" }}>
                History coming soon.
              </p>
            )}

            {/* History year timeline */}
            <HistoryTimeline entries={timelineEntries} />

            {/* Divider before CTA */}
            <div style={{ height: '1px', background: 'rgba(45,90,61,.12)', margin: '4rem 0' }} />

            {/* CTA */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
              padding: '2rem 2.5rem',
              background: 'var(--green-deep)',
            }}>
              <div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '20px',
                  color: 'var(--cream)',
                  marginBottom: '4px',
                }}>
                  Want to be part of the story?
                </div>
                <div style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '13px',
                  color: 'rgba(245,240,232,.6)',
                }}>
                  New members are always welcome — no experience needed
                </div>
              </div>
              <a href="/apply" className="btn-gold">Apply for Membership →</a>
            </div>

          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
