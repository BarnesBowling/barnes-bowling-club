import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyMemberSession, SESSION_COOKIE } from '@/lib/memberSession';

export default async function CompetitionsPage() {
  const cookieStore = await cookies();
  const sc = cookieStore.get(SESSION_COOKIE);
  const session = sc ? await verifyMemberSession(sc.value) : null;
  if (!session) redirect('/login');

  const year = new Date().getFullYear();

  const { data: events } = await supabaseAdmin
    .from('events')
    .select('*')
    .gte('event_date', `${year}-01-01`)
    .lte('event_date', `${year}-12-31`)
    .order('event_date');

  const past = events?.filter(e => new Date(e.event_date) < new Date()) ?? [];
  const upcoming = events?.filter(e => new Date(e.event_date) >= new Date()) ?? [];

  function EventTable({ rows, muted }: { rows: typeof events; muted?: boolean }) {
    if (!rows || rows.length === 0) return null;
    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Libre Baskerville', serif" }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(45,90,61,.15)' }}>
              {['Date', 'Competition / Event', 'Location', 'Type'].map((h) => (
                <th key={h} style={{
                  padding: '10px 16px',
                  textAlign: 'left',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase' as const,
                  color: 'var(--text-muted)',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => {
              const d = new Date(e.event_date);
              return (
                <tr key={e.id} style={{
                  borderBottom: '1px solid rgba(45,90,61,.07)',
                  opacity: muted ? 0.55 : 1,
                }}>
                  <td style={{
                    padding: '13px 16px',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    fontWeight: 600,
                    color: muted ? 'var(--text-muted)' : 'var(--gold)',
                    whiteSpace: 'nowrap' as const,
                  }}>
                    {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: '15px', color: 'var(--text-dark)', fontWeight: 500 }}>
                    {e.title}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
                    {e.location ?? '—'}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      fontSize: '10px',
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      letterSpacing: '.08em',
                      textTransform: 'uppercase' as const,
                      background: e.visibility === 'public' ? 'rgba(74,158,106,.12)' : 'rgba(201,168,76,.12)',
                      color: e.visibility === 'public' ? '#2d8a4e' : 'var(--gold)',
                      borderRadius: '2px',
                    }}>
                      {e.visibility === 'public' ? 'Open' : 'Members'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a href="/members/dashboard" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>Members Area</a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Competition Dates — <em style={{ color: 'var(--gold-light)' }}>{year} season</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              All fixtures, competitions and events for the {year} season. The season runs 25th April through early October.
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>

          {/* Upcoming */}
          {upcoming.length > 0 ? (
            <section style={{ marginBottom: '3.5rem' }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '22px',
                fontWeight: 500,
                color: 'var(--green-deep)',
                marginBottom: '1.25rem',
              }}>
                Upcoming fixtures &amp; competitions
              </div>
              <EventTable rows={upcoming} />
            </section>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: "'Libre Baskerville', serif", marginBottom: '3rem' }}>
              No upcoming fixtures scheduled. Check back closer to the season start.
            </p>
          )}

          {/* Past */}
          {past.length > 0 && (
            <section>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '22px',
                fontWeight: 500,
                color: 'var(--green-deep)',
                marginBottom: '1.25rem',
                opacity: 0.7,
              }}>
                Past fixtures
              </div>
              <EventTable rows={past} muted />
            </section>
          )}

          {(!events || events.length === 0) && (
            <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontFamily: "'Libre Baskerville', serif" }}>
              Competition dates for {year} will be published once the season programme is confirmed.
            </p>
          )}

          <div style={{ marginTop: '3rem' }}>
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
