import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { MEMBERS, fmt, getTrend } from '@/lib/handicapData';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyMemberSession, SESSION_COOKIE } from '@/lib/memberSession';
import { MyDetailsDropdown } from './MyDetailsDropdown';
import { CompDatesCard } from './CompDatesCard';
import { ResultsDropdown } from './ResultsDropdown';
import { ResultsNavDropdown } from './ResultsNavDropdown';
import { CalendarModal } from './CalendarModal';

const TOP_HANDICAPS = [...MEMBERS]
  .filter(m => m.h[2026] !== undefined)
  .sort((a, b) => {
    const diff = (a.h[2026] as number) - (b.h[2026] as number);
    return diff !== 0 ? diff : a.surname.localeCompare(b.surname);
  })
  .slice(0, 10);

export default async function Dashboard() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  const session = sessionCookie ? await verifyMemberSession(sessionCookie.value) : null;
  if (!session) redirect('/login');

  const email = session.email;

  const today          = new Date().toISOString().split('T')[0];
  const oneMonthLater  = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [{ data: events }, { data: notices }, { data: officers }, { data: green }, { data: memberProfile }, { data: upcomingMatches }] =
    await Promise.all([
      supabaseAdmin.from('events').select('*').gte('event_date', new Date().toISOString()).order('event_date').limit(8),
      supabaseAdmin.from('notices').select('*').order('published_at', { ascending: false }).limit(5),
      supabaseAdmin.from('officers').select('*').eq('group_name', 'Committee').order('sort_order'),
      supabaseAdmin.from('green_status').select('*').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
      supabaseAdmin.from('member_profiles').select('first_name').eq('member_email', email).maybeSingle(),
      supabaseAdmin.from('fixture_bookings')
        .select('competition, player1, player2, player3, player4, date, time_slot')
        .gte('date', today)
        .lte('date', oneMonthLater)
        .order('date')
        .order('time_slot'),
    ]);

  const firstName = memberProfile?.first_name;

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)', position: 'relative' }}>
          <a href="/members/book-a-game" className="dashboard-book-btn" style={{
            position: 'absolute',
            right: 'clamp(1.5rem, 5vw, 4rem)',
            bottom: '15%',
            display: 'inline-block',
            padding: '15px 34px',
            border: '3px solid #c9a84c',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '17px',
            fontWeight: 700,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: '#c9a84c',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            background: 'transparent',
            transition: 'background .15s, color .15s',
          }}>
            Book a Match
          </a>
          <div className="section-inner">
            <div className="section-tag" style={{ color: '#c9a84c', borderTopColor: '#c9a84c' }}>Members Area</div>
            {firstName && (
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                fontWeight: 400,
                color: 'rgba(245,240,232,.75)',
                margin: '0 0 0.15rem',
                letterSpacing: '-.01em',
              }}>
                Welcome, {firstName}
              </p>
            )}
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Members <em style={{ color: '#c9a84c', fontStyle: 'italic' }}>Dashboard</em>
            </h1>
            {green && (
              <div style={{
                marginTop: '1.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 16px',
                background: 'rgba(255,255,255,.07)',
                border: '1px solid rgba(255,255,255,.12)',
              }}>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  background: green.status === 'open_good' ? '#4caf50' : green.status === 'open_fair' ? '#ff9800' : '#f44336',
                }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(245,240,232,.85)' }}>
                  {green.message}
                </span>
              </div>
            )}
            <div style={{ marginTop: '2rem' }}>
              <a href="/members/logout" style={{
                display: 'inline-block',
                padding: '7px 14px',
                border: '1px solid rgba(192,57,43,.35)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: 'rgba(230,100,85,.95)',
                textDecoration: 'none',
              }}>
                Sign out
              </a>
            </div>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>

          {/* Quick links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: '3rem', alignItems: 'flex-start' }}>
            <MyDetailsDropdown />
            {[
              { label: 'Handicap standings', href: '/members/handicaps' },
              { label: 'Competition Dates', href: '/members/competitions' },
            ].map(({ label, href }) => (
              <a key={href} href={href} style={{
                padding: '6px 11px',
                border: '1px solid rgba(45,90,61,.2)',
                fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontSize: '12px',
                fontWeight: 300,
                letterSpacing: '0.12em',
                textTransform: 'uppercase' as const,
                color: '#272727',
                textDecoration: 'none',
                whiteSpace: 'nowrap' as const,
              }}>
                {label}
              </a>
            ))}
            <CalendarModal upcomingMatches={upcomingMatches ?? []} />
            <ResultsNavDropdown />
            {[
              { label: 'Notices', href: '/notices' },
              { label: 'Make a Payment', href: '/members/payment' },
              { label: 'Constitution & Rules', href: '/members/constitution' },
              { label: 'Archive', href: '/members/archive' },
            ].map(({ label, href }) => (
              <a key={href} href={href} style={{
                padding: '6px 11px',
                border: '1px solid rgba(45,90,61,.2)',
                fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontSize: '12px',
                fontWeight: 300,
                letterSpacing: '0.12em',
                textTransform: 'uppercase' as const,
                color: '#272727',
                textDecoration: 'none',
                whiteSpace: 'nowrap' as const,
              }}>
                {label}
              </a>
            ))}
          </div>

          {/* Notices */}
          {notices && notices.length > 0 && (
            <section style={{ marginBottom: '3.5rem' }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '22px',
                fontWeight: 500,
                color: 'var(--green-deep)',
                marginBottom: '1.25rem',
              }}>Club notices</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(45,90,61,.08)' }}>
                {notices.map((n) => (
                  <div key={n.id} style={{ background: 'var(--cream)', padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <strong style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', color: 'var(--green-deep)' }}>{n.title}</strong>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
                        {n.author} · {new Date(n.published_at).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', lineHeight: 1.7, color: 'var(--text-mid)', margin: 0 }}>{n.body}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Competition Dates / Results card */}
          <CompDatesCard events={events ?? []} />

          {/* Results card */}
          <section style={{ marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 500, color: 'var(--green-deep)' }}>
                Results
              </div>
              <ResultsDropdown />
            </div>
            <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', fontStyle: 'italic', color: 'var(--text-mid)', lineHeight: 1.7, margin: 0 }}>
              Match results, competition dates, and draw sheets for the 2026 season.
            </p>
          </section>

          {/* Handicap preview */}
          <section style={{ marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 500, color: 'var(--green-deep)' }}>
                Handicaps — 2026 season
              </div>
              <a href="/members/handicaps" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--green-mid)', textDecoration: 'none' }}>
                View full table →
              </a>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Libre Baskerville', serif" }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(45,90,61,.15)' }}>
                    {['#', 'Name', 'Handicap', 'Trend'].map((h) => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Name' ? 'left' : 'center', fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase' as const, color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TOP_HANDICAPS.map((m, i) => {
                    const t = getTrend(m);
                    return (
                      <tr key={`${m.surname}-${m.firstname}`} style={{ borderBottom: '1px solid rgba(45,90,61,.07)' }}>
                        <td style={{ padding: '11px 12px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>{i + 1}</td>
                        <td style={{ padding: '11px 12px', fontSize: '15px', color: 'var(--text-dark)' }}>{m.surname}, {m.firstname}</td>
                        <td style={{ padding: '11px 12px', textAlign: 'center', fontSize: '15px', fontWeight: 600, color: 'var(--green-deep)', fontFamily: "'DM Sans', sans-serif" }}>
                          {fmt(m.h[2026])}
                        </td>
                        <td style={{ padding: '11px 12px', textAlign: 'center', fontSize: '12px', color: t.color, fontFamily: "'DM Sans', sans-serif" }}>
                          {t.symbol}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Committee */}
          {officers && officers.length > 0 && (
            <section>
              <style>{`
                .committee-photo-grid {
                  display: grid;
                  grid-template-columns: repeat(4, 1fr);
                  gap: 2rem 1.5rem;
                }
                @media (max-width: 600px) {
                  .committee-photo-grid {
                    grid-template-columns: repeat(2, 1fr);
                  }
                }
              `}</style>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 500, color: 'var(--green-deep)', marginBottom: '1.5rem' }}>
                Club committee
              </div>
              <div className="committee-photo-grid">
                {officers.map((o) => (
                  <div key={o.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    {o.photo_filename ? (
                      <img
                        src={`/committee/${o.photo_filename}`}
                        alt={o.name}
                        style={(() => {
                          const overrides: Record<string, { objectFit: 'contain' | 'cover'; objectPosition: string; background?: string; transform?: string; transformOrigin?: string }> = {
                            'Tracy Greasley': { objectFit: 'contain', objectPosition: '15% center', background: '#f4f4f4' },
                            'Judith Heaton':  { objectFit: 'cover',   objectPosition: 'center 35%', transform: 'scale(1.3)', transformOrigin: 'center top' },
                            'Brian Coles':    { objectFit: 'cover',   objectPosition: 'center 35%', transform: 'scale(1.3)', transformOrigin: 'center top' },
                          };
                          const ov = overrides[o.name] ?? { objectFit: 'cover' as const, objectPosition: 'center top' };
                          return { width: '120px', height: '120px', borderRadius: '8px', marginBottom: '0.75rem', border: '1px solid rgba(45,90,61,.12)', ...ov };
                        })()}
                      />
                    ) : (
                      <div style={{ width: '120px', height: '120px', borderRadius: '8px', marginBottom: '0.75rem', background: 'var(--green-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(45,90,61,.12)' }}>
                        <svg viewBox="0 0 100 100" width="56" height="56" fill="rgba(245,240,232,.35)">
                          <circle cx="50" cy="35" r="20" />
                          <ellipse cx="50" cy="85" rx="32" ry="25" />
                        </svg>
                      </div>
                    )}
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '9px', fontWeight: 600, letterSpacing: '.16em', textTransform: 'uppercase' as const, color: '#c9a84c', marginBottom: '4px' }}>{o.role}</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 500, color: 'var(--green-deep)' }}>{o.name}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
