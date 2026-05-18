import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HowToPlayCards } from '@/components/HowToPlayCards';
import { createClient } from '@/lib/supabase/server';

export default async function HowToPlay() {
  const supabase = await createClient();
  const { data: sections } = await supabase
    .from('how_to_play')
    .select('*')
    .order('sort_order');

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)' }}>
              Beginner&apos;s Guide
            </div>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
              How to play <em style={{ color: 'var(--gold-light)' }}>Barnes Bowls</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.7)' }}>
              Barnes Bowling Club plays by 18th-century Elizabethan rules — older and quite different
              from modern flat green or crown green bowls. Choose a topic below to find out more.
            </p>
          </div>
        </div>

        {/* Card grid — click "Find out more" to expand each section */}
        <div style={{ background: 'var(--cream)', padding: '4rem 2rem 5rem' }}>
          <div className="section-inner">
            {sections && sections.length > 0 ? (
              <HowToPlayCards sections={sections} />
            ) : (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Content coming soon.</p>
            )}

            {/* CTA */}
            <div style={{
              marginTop: '4rem',
              padding: '2rem 2.5rem',
              background: 'var(--green-deep)',
              color: 'var(--cream)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', marginBottom: '4px' }}>
                  Ready to give it a try?
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(245,240,232,.6)', fontFamily: "'Libre Baskerville', serif" }}>
                  Beginners are always welcome — equipment provided on the day
                </div>
              </div>
              <a href="/apply" className="btn-gold" style={{ color: '#ffffff' }}>Apply for Membership →</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
