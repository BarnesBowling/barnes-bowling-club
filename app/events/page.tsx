import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { EVENTS, TBC_EVENTS } from '@/data/season-calendar-2026';

const EVENTS_2026: {
  day: string;
  month: string;
  name: string;
  detail: string;
  badge: 'open' | 'members' | 'full';
  badgeLabel: string;
  tbc?: boolean;
}[] = [
  ...EVENTS
    .filter(ev => ev.category === 'competition' || ev.category === 'match')
    .map(ev => ({
      day: ev.dateLabel,
      month: ev.month.slice(0, 3),
      name: ev.title,
      detail: ev.details ?? '',
      badge: 'members' as const,
      badgeLabel: 'Members',
      tbc: ev.tbc,
    })),
  ...TBC_EVENTS
    .filter(ev => ev.category === 'competition' || ev.category === 'match')
    .map(ev => ({
      day: '—',
      month: 'TBC',
      name: ev.title,
      detail: '',
      badge: 'members' as const,
      badgeLabel: 'Members',
      tbc: true,
    })),
];

export default function EventsPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* Hero */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)' }}>
              2026 Season
            </div>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
              Events <em style={{ color: 'var(--gold-light)' }}>2026</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.7)', maxWidth: '600px' }}>
              The full fixture list and competition schedule for the 2026 season.
              The green opens in April and closes in October — all events are held at
              The Sun Inn, Barnes High Street, SW13 9LB unless otherwise noted.
            </p>
          </div>
        </div>

        {/* Season at a glance */}
        <div style={{ backgroundColor: '#f9f7f4', backgroundImage: "url('/images/texture.png')", backgroundRepeat: 'repeat', backgroundSize: '43px 43px', padding: '3rem 2rem' }}>
          <div className="section-inner">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1px',
              background: 'rgba(45,90,61,.1)',
            }}>
              {[
                { label: 'Season Opens',  value: '25th April 2026',       sub: 'First play of the year' },
                { label: 'Season Closes', value: 'Early October 2026',    sub: 'Last roll-up of the year' },
                { label: 'Roll-Ups',      value: 'Every Wednesday',       sub: '6-8pm throughout the season' },
                { label: 'Venue',         value: 'The Sun Inn, Barnes',   sub: 'Barnes High Street, SW13 9LB' },
              ].map(({ label, value, sub }) => (
                <div key={label} style={{ backgroundColor: '#f9f7f4', backgroundImage: "url('/images/texture.png')", backgroundRepeat: 'repeat', backgroundSize: '43px 43px', padding: '2rem 1.75rem' }}>
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '9px',
                    fontWeight: 600,
                    letterSpacing: '.2em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    marginBottom: '8px',
                  }}>{label}</div>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '17px',
                    fontWeight: 500,
                    color: 'var(--green-deep)',
                    marginBottom: '4px',
                  }}>{value}</div>
                  <div style={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                  }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Events list */}
        <div className="season-section">
          <div className="section-inner">

            <div className="section-tag">Full Programme</div>
            <h2 className="section-h2">
              Fixtures &amp; <em>competitions</em>
            </h2>
            <p className="section-lead" style={{ marginBottom: 0 }}>
              Competitions are open to paid-up members. Open events welcome guests — no booking
              required unless stated. Check the noticeboard for any late changes.
            </p>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', margin: '2rem 0 0' }}>
              <span className="event-badge badge-open">All Welcome</span>
              <span className="event-badge badge-members">Members</span>
              <span className="event-badge badge-full">Sold Out</span>
            </div>

            <div className="events-list">
              {EVENTS_2026.map((ev, i) => (
                <div key={i} className="event-row">
                  <div className="event-date">
                    <div className="event-date-day">{ev.day}</div>
                    <div className="event-date-mon">{ev.month}</div>
                  </div>
                  <div>
                    <div className="event-name">
                      {ev.name}
                      {ev.tbc && (
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--text-muted)', border: '1px solid rgba(0,0,0,.15)', padding: '2px 6px', marginLeft: '8px', verticalAlign: 'middle' }}>
                          TBC
                        </span>
                      )}
                    </div>
                    <div
                      className="event-detail"
                      dangerouslySetInnerHTML={{ __html: ev.detail }}
                    />
                  </div>
                  <div>
                    <span className={`event-badge badge-${ev.badge}`}>{ev.badgeLabel}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'var(--cream-warm)', padding: '5rem 2rem' }}>
          <div className="section-inner">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
              padding: '2.5rem 3rem',
              background: 'var(--green-deep)',
            }}>
              <div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '22px',
                  color: 'var(--cream)',
                  marginBottom: '6px',
                }}>
                  Want to take part?
                </div>
                <div style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '14px',
                  color: 'rgba(245,240,232,.6)',
                }}>
                  Join the club and compete in the 2026 season — new members always welcome
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a href="/roll-ups" className="btn-gold" style={{ background: 'transparent', border: '1px solid rgba(201,168,76,.5)', color: 'var(--gold)' }}>
                  Try a Roll-Up →
                </a>
                <a href="/apply" className="btn-gold">
                  Apply for Membership →
                </a>
              </div>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
