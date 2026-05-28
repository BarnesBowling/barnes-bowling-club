import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GreenBanner } from '@/components/GreenBanner';
import { HeroCarousel } from '@/components/HeroCarousel';
import { createClient } from '@/lib/supabase/server';
import { getHeroImages } from '@/lib/images';

export default async function Home() {
  const supabase = await createClient();

  const heroImages = await getHeroImages();

  const [{ data: events }, { data: officers }] = await Promise.all([
    supabase
      .from('events')
      .select('*')
      .eq('visibility', 'public')
      .gte('event_date', new Date().toISOString())
      .order('event_date')
      .limit(10),
    supabase.from('officers').select('*').eq('group_name', 'Committee').order('sort_order'),
  ]);

  return (
    <>
      <Navbar />
      <GreenBanner />

      {/* ── 1. HERO ── */}
      <HeroCarousel />

      {/* ── 2. THREE CARDS ROW — What's Happening ── */}
      <section className="whats-happening">
        <div className="section-inner" style={{ padding: 0 }}>
          <div className="section-tag">At the Club</div>
          <h2 className="section-h2">What&apos;s Happening at<br /><em>Barnes Bowling Club</em></h2>
        </div>
        <div className="whats-happening-cards" style={{ maxWidth: '1200px', margin: '12px auto 0' }}>

          <Link href="/login?redirect=/members/results" className="whats-happening-card">
            <div className="whats-happening-card-bg" style={{ backgroundImage: `url('${heroImages['whats-happening-1'] ?? '/images/gallery1.JPG'}')`, backgroundPosition: 'center 60%' }} />
            <div className="whats-happening-panel">
              <div className="whats-happening-panel-footer">View Competitions</div>
              <div className="whats-happening-panel-center">
                <div className="whats-happening-panel-title">View Competitions</div>
                <span className="whats-happening-panel-btn">See Results</span>
              </div>
            </div>
          </Link>

          <Link href="/login?redirect=/members/calendar" className="whats-happening-card">
            <div className="whats-happening-card-bg" style={{ backgroundImage: `url('${heroImages['whats-happening-2'] ?? '/images/gallery5.JPG'}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
            <div className="whats-happening-panel">
              <div className="whats-happening-panel-footer">Log in to see calendar</div>
              <div className="whats-happening-panel-center">
                <div className="whats-happening-panel-title">Log in to see calendar</div>
                <span className="whats-happening-panel-btn">View Calendar</span>
              </div>
            </div>
          </Link>

          <Link href="/newsletter" className="whats-happening-card">
            <div className="whats-happening-card-bg" style={{ backgroundImage: `url('${heroImages['whats-happening-3'] ?? '/images/gallery2.JPG'}')` }} />
            <div className="whats-happening-panel">
              <div className="whats-happening-panel-footer">Club Notices</div>
              <div className="whats-happening-panel-center">
                <div className="whats-happening-panel-title">Club Notices</div>
                <span className="whats-happening-panel-btn">Read More</span>
              </div>
            </div>
          </Link>

        </div>
      </section>

      {/* ── 3. WIDE FEATURE BANNER ── */}
      <div className="featured-banner">
        <div className="featured-banner-bg" style={{ backgroundImage: `url('${heroImages['featured-banner'] ?? '/images/gallery4.JPG'}')` }} />
        <div className="featured-banner-overlay" />
        <div className="featured-banner-inner" style={{ justifyContent: 'center' }}>
          <Link
            href="/roll-ups"
            className="featured-banner-panel"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              background: 'rgba(0,0,0,0.45)',
              padding: '48px 64px',
              textDecoration: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              maxWidth: '420px',
            }}
          >
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.35rem, 2.4vw, 1.85rem)',
              fontWeight: 500,
              color: '#ffffff',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              lineHeight: 1.1,
            }}>
              Come and Play
            </div>
            <div style={{
              width: '60px',
              height: '1px',
              background: 'rgba(255,255,255,0.65)',
              margin: '16px 0',
            }} />
            <p style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: '17.5px',
              fontStyle: 'italic',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.92)',
              margin: 0,
            }}>
              The Green is open. Come and play.<br />
              Free Wednesday evenings from 6pm.<br />
              No experience needed.
            </p>
          </Link>
        </div>
      </div>

      {/* ── 4. THREE COLUMN ACTIVITIES GRID ── */}
      <section className="activities-section">
        <div className="section-inner" style={{ padding: 0 }}>
          <div className="section-tag">Explore</div>
          <h2 className="section-h2">Get Involved</h2>
        </div>
        <div className="activities-grid" style={{ maxWidth: '1200px', margin: '3rem auto 0' }}>

          <div className="activity-card">
            <div className="activity-card-img">
              <div className="activity-card-img-inner" style={{ backgroundImage: `url('${heroImages['activity-1'] ?? '/images/IMG_9105.JPG'}')` }} />
              <div className="activity-card-img-overlay" />
            </div>
            <div className="activity-card-body">
              <div className="activity-card-title">Book a Match Game</div>
              <p className="activity-card-desc">
                Play a friendly match on our historic undulating green. Open to members
                and visitors — turn up any Wednesday evening for a roll-up.
              </p>
              <Link href="/login?redirect=/members/book-a-game" className="activity-card-link">More Details →</Link>
            </div>
          </div>

          <div className="activity-card">
            <div className="activity-card-img">
              <div className="activity-card-img-inner" style={{ backgroundImage: `url('${heroImages['activity-2'] ?? '/images/DSC01189_b.jpg'}')`, backgroundPosition: 'center 80%' }} />
              <div className="activity-card-img-overlay" />
            </div>
            <div className="activity-card-body">
              <div className="activity-card-title">Photo Gallery</div>
              <p className="activity-card-desc">
                Browse photographs from our season — club matches, competitions, social
                evenings and the beautiful green that has been our home for three centuries.
              </p>
              <Link href="/gallery" className="activity-card-link">More Details →</Link>
            </div>
          </div>

          <div className="activity-card">
            <div className="activity-card-img">
              <div className="activity-card-img-inner" style={{ backgroundImage: `url('${heroImages['activity-3'] ?? '/images/gallery7.JPG'}')` }} />
              <div className="activity-card-img-overlay" />
            </div>
            <div className="activity-card-body">
              <div className="activity-card-title">Club History</div>
              <p className="activity-card-desc">
                Established in 1725, Barnes Bowling Club is London&apos;s oldest surviving pub green.
                Discover our heritage and the rules we still play by today.
              </p>
              <Link href="/history" className="activity-card-link">More Details →</Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── 5. HISTORY ── */}
      <section className="history-section" id="history">
        <div className="history-grid">
          <div className="history-text">
            <div className="section-tag">Our Heritage</div>
            <h2 className="section-h2">The <em>original</em> game,<br />still played today</h2>
            <p className="section-lead">
              Barnes Bowling Club is the only surviving pub green in London and plays by rules established
              long before W M Mitchell&apos;s modern flat green codes of 1840. With just two woods and an
              undulating green full of natural character, our game is unlike any other.
            </p>
            <p className="section-lead" style={{ marginTop: '1rem' }}>
              Our green sits in a walled garden behind the Sun Inn, adjacent to Barnes Pond in SW13 —
              one of the most important sites in Britain&apos;s sporting heritage, featured in Hugh Hornby&apos;s{' '}
              <em>Bowled Over</em>.
            </p>
          </div>
          <div className="history-facts">
            <div>
              <div className="history-fact-num">300<sup style={{ fontSize: '0.5em' }}>+</sup></div>
              <div className="history-fact-label">Years of continuous play on the same green, behind the same pub</div>
            </div>
            <div className="history-divider" />
            <div>
              <div className="history-fact-num">2</div>
              <div className="history-fact-label">Woods only — we play the Elizabethan game, not the four-bowl modern version</div>
            </div>
            <div className="history-divider" />
            <div>
              <div className="history-fact-num">1</div>
              <div className="history-fact-label">The only pub bowling green of its kind remaining anywhere in London</div>
            </div>
            <div className="history-divider" />
            <div>
              <div className="history-fact-num">Apr–Oct</div>
              <div className="history-fact-label">Season runs 25 Apr – early Oct, with competitions and an International Day</div>
            </div>
          </div>
        </div>

        {/* Watch our story callout */}
        <div style={{
          borderTop: '1px solid rgba(245,240,232,.12)',
          padding: '2rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          textAlign: 'center',
        }}>
          <img
            src="/images/icons/megaphone.png"
            alt=""
            aria-hidden="true"
            style={{ width: '68px', height: '68px', objectFit: 'contain', flexShrink: 0 }}
          />
          <div>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: 'rgba(245,240,232,.5)',
              marginBottom: '0.3rem',
            }}>
              Now Showing
            </div>
            <div style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: 'var(--cream)',
              fontStyle: 'italic',
              marginBottom: '0.6rem',
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
      </section>

      {/* ── 6. MEMBERSHIP ── */}
      <section className="membership-section" id="membership">
        <div className="section-inner">
          <div className="section-tag">Join the Club</div>
          <h2 className="section-h2">Join a <em>living piece</em><br />of London history</h2>
          <p className="section-lead">
            Membership is open to all. New members must be nominated by an existing member of
            12 months&apos; standing. We welcome players of all abilities — beginners very much included.
          </p>
          <div style={{ marginTop: '3rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'stretch', justifyContent: 'center' }}>

            <div className="membership-card" style={{ flex: '1 1 320px', maxWidth: '460px' }}>
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
              <Link href="/apply" className="pay-btn-gold">Apply for Membership →</Link>
              <p style={{ fontSize: '11px', color: 'rgba(245,240,232,.4)', textAlign: 'center', marginTop: '10px', fontFamily: "'DM Sans', sans-serif" }}>
                Payment collected only once your membership is confirmed
              </p>
            </div>

            <div className="membership-card" style={{ flex: '1 1 320px', maxWidth: '460px', display: 'flex', flexDirection: 'column' }}>
              <div className="membership-card-tag">No Experience Needed</div>
              <div className="membership-card-name">Wednesday Roll-ups — Welcome!</div>
              <div style={{ flex: 1, marginTop: '1.5rem' }}>
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
      </section>

      {/* ── 7. EVENTS (data-driven) ── */}
      {events && events.length > 0 && (
        <section className="season-section" id="season">
          <div className="section-inner">
            <div className="section-tag">{new Date().getFullYear()} Season</div>
            <h2 className="section-h2">Competitions &amp;<br /><em>events</em> this summer</h2>
            <p className="section-lead">
              The season runs 25th April through early October. Competitions have grown increasingly
              popular as members battle for our coveted trophies.
            </p>
            <div className="events-list">
              {events.map((ev) => {
                const d = new Date(ev.event_date);
                return (
                  <div className="event-row" key={ev.id}>
                    <div className="event-date">
                      <div className="event-date-day">{d.getDate()}</div>
                      <div className="event-date-mon">{d.toLocaleString('en-GB', { month: 'short' })}</div>
                    </div>
                    <div>
                      <div className="event-name">{ev.title}</div>
                      <div className="event-detail">{ev.location ?? ''}</div>
                    </div>
                    <div className={`event-badge ${ev.visibility === 'public' ? 'badge-open' : 'badge-members'}`}>
                      {ev.visibility === 'public' ? 'Open' : 'Members'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 8. OFFICERS (data-driven) ── */}
      {officers && officers.length > 0 && (
        <section className="officers-section" id="officers">
          <div className="section-inner">
            <div className="section-tag">Club Officers</div>
            <h2 className="section-h2">Meet the <em>committee</em></h2>
            <div className="officers-cards">
              {officers.map((o) => (
                <div key={o.id} className="officer-card">
                  <div className="officers-role">{o.role}</div>
                  <div className="officers-name">{o.name}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 9. FIND US ── */}
      <section className="find-section" id="visit">
        <div className="find-grid">
          <div>
            <div className="section-tag">Find Us</div>
            <h2 className="section-h2">Behind the<br /><em>Sun Inn</em></h2>
            <div className="find-details">
              <div className="find-item">
                <div className="find-icon">
                  <svg viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                </div>
                <div>
                  <div className="find-label">Address</div>
                  <div className="find-value">Sun Inn, Church Road<br />Barnes, London SW13 9HE</div>
                </div>
              </div>
              <div className="find-item">
                <div className="find-icon">
                  <svg viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" fill="none">
                    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
                  </svg>
                </div>
                <div>
                  <div className="find-label">Season</div>
                  <div className="find-value">25th April to early October<br />Play on Saturdays &amp; evenings</div>
                </div>
              </div>
              <div className="find-item">
                <div className="find-icon">
                  <svg viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <div className="find-label">Contact</div>
                  <div className="find-value">info@barnesbowling.com<br />Membership enquiries welcome</div>
                </div>
              </div>
              <div className="find-item">
                <div className="find-icon">
                  <svg viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" stroke="currentColor" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <div className="find-label">Joining</div>
                  <div className="find-value">Nomination required from<br />an existing member of 12 months</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ border: '2px solid rgba(201,168,76,.4)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <iframe
              src="https://maps.google.com/maps?q=Sun+Inn,+Church+Road,+Barnes,+London+SW13+9HE&t=&z=16&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="340"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Sun Inn, Barnes SW13"
            />
            <a
              href="https://maps.google.com/?q=Sun+Inn+Church+Road+Barnes+London+SW13+9HE"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                background: 'rgba(201,168,76,.08)',
                borderTop: '1px solid rgba(201,168,76,.25)',
                textDecoration: 'none',
              }}
            >
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(245,240,232,.65)', letterSpacing: '.04em' }}>
                Sun Inn · Church Road · Barnes SW13 9HE
              </span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--gold)', letterSpacing: '.05em', flexShrink: 0 }}>
                Open in Maps →
              </span>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
