import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';

/* ── decorative SVG banners for article cards ─────────────── */
const CARD_COLORS = [
  { bg: '#2d5a3d', accent: '#c9a84c' },
  { bg: '#1a3a2a', accent: '#4a9e6a' },
  { bg: '#3d2b1a', accent: '#c9a84c' },
  { bg: '#2d5a3d', accent: '#f5f0e8' },
  { bg: '#1a3a2a', accent: '#c9a84c' },
  { bg: '#2d5a3d', accent: '#4a9e6a' },
];

function ArticleBanner({ index, title }: { index: number; title: string }) {
  const { bg, accent } = CARD_COLORS[index % CARD_COLORS.length];
  const initials = title.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <svg viewBox="0 0 600 220" style={{ width: '100%', display: 'block' }}>
      <rect width="600" height="220" fill={bg} />
      <circle cx="300" cy="110" r="120" fill="rgba(255,255,255,.03)" />
      <circle cx="300" cy="110" r="80" fill="rgba(255,255,255,.03)" />
      <circle cx="80" cy="220" r="90" fill="rgba(255,255,255,.02)" />
      <circle cx="520" cy="0" r="70" fill="rgba(255,255,255,.02)" />
      <line x1="0" y1="180" x2="600" y2="180" stroke={accent} strokeWidth="1" opacity="0.2" />
      <text x="300" y="125" fontSize="72" textAnchor="middle" fill={accent} opacity="0.12"
        fontFamily="Playfair Display,serif" fontWeight="700">{initials}</text>
      <text x="32" y="198" fontSize="9" fill={accent} opacity="0.45"
        fontFamily="DM Sans,sans-serif" letterSpacing="2">BARNES BOWLING CLUB</text>
    </svg>
  );
}

export default async function RollUpsPage() {
  const supabase = await createClient();
  const { data: notices } = await supabase
    .from('notices')
    .select('*')
    .order('published_at', { ascending: false });

  return (
    <>
      <Navbar />
      <main>

        {/* Hero */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)' }}>
              All Welcome
            </div>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
              Wednesday Roll-ups —<br />
              <em style={{ color: 'var(--gold-light)' }}>come and have a go!</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.7)', maxWidth: '600px' }}>
              Every Wednesday evening we open the green for informal roll-ups.
              No experience needed, no equipment required — just turn up and give it a try.
            </p>
          </div>
        </div>

        {/* Info panel */}
        <div style={{ background: 'var(--cream-warm)', padding: '4rem 2rem' }}>
          <div className="section-inner">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1px',
              background: 'rgba(45,90,61,.1)',
              marginBottom: '4rem',
            }}>
              {[
                { label: 'When', value: 'Every Wednesday evening', sub: 'Throughout the season, Apr–Oct' },
                { label: 'Where', value: 'The Sun Inn, Barnes', sub: 'Barnes High Street, SW13 9LB' },
                { label: 'Equipment', value: 'All provided', sub: 'Just wear flat-soled shoes' },
                { label: 'Cost', value: 'Free to try', sub: 'No booking needed — just turn up' },
              ].map(({ label, value, sub }) => (
                <div key={label} style={{ background: 'var(--cream-warm)', padding: '2rem 1.75rem' }}>
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
                    fontSize: '18px',
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

            {/* Description */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '4rem',
              marginBottom: '4rem',
            }}>
              <div>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '26px',
                  fontWeight: 500,
                  color: 'var(--green-deep)',
                  margin: '0 0 1.25rem',
                }}>
                  What to expect
                </h2>
                <p style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '15px',
                  lineHeight: 1.9,
                  color: 'var(--text-mid)',
                  margin: '0 0 1rem',
                }}>
                  Every Wednesday from 6–8pm, we open the green to anyone over 16 who wants to
                  try their hand. Bring flat-soled shoes and a willingness to have a go — that&apos;s it.
                </p>
                <p style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '15px',
                  lineHeight: 1.9,
                  color: 'var(--text-mid)',
                  margin: 0,
                }}>
                  The BBQ is usually fired up, drinks are usually flowing, and it&apos;s the perfect
                  way to meet our members in a relaxed setting.
                </p>
              </div>
              <div>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '26px',
                  fontWeight: 500,
                  color: 'var(--green-deep)',
                  margin: '0 0 1.25rem',
                }}>
                  Thinking of joining?
                </h2>
                <p style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '15px',
                  lineHeight: 1.9,
                  color: 'var(--text-mid)',
                  margin: '0 0 1.5rem',
                }}>
                  Roll-ups are a perfect way to see if bowls is for you before committing to
                  full membership. Many of our members first discovered the club on a Wednesday
                  evening. If you enjoy it, speak to any committee member about applying.
                </p>
                <a href="/apply" className="btn-gold">Apply for Membership →</a>
              </div>
            </div>
          </div>
        </div>

        {/* News / Blog articles */}
        <div style={{ background: 'var(--cream)', padding: '4rem 2rem 6rem' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ marginBottom: '1rem' }}>Club News</div>
            <h2 className="section-h2" style={{ marginBottom: '3rem' }}>
              Latest from the <em>club</em>
            </h2>

            {notices && notices.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {notices.map((n, i) => (
                  <article key={n.id} style={{
                    border: '1px solid rgba(45,90,61,.1)',
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: '280px 1fr',
                  }}>
                    {/* Banner image */}
                    <div style={{ lineHeight: 0 }}>
                      <ArticleBanner index={i} title={n.title} />
                    </div>

                    {/* Text */}
                    <div style={{ padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '.14em',
                          textTransform: 'uppercase',
                          color: 'var(--gold)',
                          marginBottom: '10px',
                        }}>
                          {new Date(n.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {' · '}{n.author}
                        </div>
                        <h3 style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: '22px',
                          fontWeight: 500,
                          color: 'var(--green-deep)',
                          margin: '0 0 1rem',
                          lineHeight: 1.3,
                        }}>
                          {n.title}
                        </h3>
                        <p style={{
                          fontFamily: "'Libre Baskerville', serif",
                          fontSize: '14px',
                          lineHeight: 1.8,
                          color: 'var(--text-mid)',
                          margin: 0,
                        }}>
                          {n.body}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily: "'Libre Baskerville', serif", color: 'var(--text-muted)', fontStyle: 'italic' }}>
                News articles coming soon.
              </p>
            )}
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
