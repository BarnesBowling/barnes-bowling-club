import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';

export default async function News() {
  const supabase = await createClient();
  const { data: notices } = await supabase
    .from('notices')
    .select('*')
    .order('published_at', { ascending: false });

  return (
    <>
      <Navbar />
      <main>
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)' }}>Latest</div>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
              Club <em style={{ color: 'var(--gold-light)' }}>news &amp; notices</em>
            </h1>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '4rem 2rem' }}>
          {notices && notices.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {notices.map((n) => (
                <article
                  key={n.id}
                  style={{
                    padding: '2.5rem 0',
                    borderBottom: '1px solid rgba(45,90,61,.1)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 500, color: 'var(--green-deep)', margin: 0 }}>
                      {n.title}
                    </h2>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.1em', whiteSpace: 'nowrap' }}>
                      {new Date(n.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '15px', lineHeight: 1.85, color: 'var(--text-mid)', marginBottom: '1rem' }}>
                    {n.body}
                  </p>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase' }}>
                    — {n.author}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: "'Libre Baskerville', serif", color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No notices at this time. Check back soon.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
