import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NewsletterGrid } from './NewsletterGrid';

export const dynamic = 'force-dynamic';

export default async function Newsletter() {
  const { data: rows } = await supabaseAdmin
    .from('newsletters')
    .select('id, title, issue_date, issue_label, pdf_public_url, thumbnail_public_url')
    .order('sort_order', { ascending: false });

  const issues = (rows ?? []).map(r => ({
    title: r.title,
    date: new Date(r.issue_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    issue: r.issue_label,
    src: r.thumbnail_public_url,
    pdf: r.pdf_public_url,
    type: 'image' as const,
  }));

  return (
    <>
      <Navbar />
      <main>

        {/* ── Green header ── */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)' }}>
              News &amp; Events
            </div>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
              Newsletter <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>2026</em>
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: 'rgba(245,240,232,.72)', maxWidth: '540px', lineHeight: 1.7 }}>
              Recent editions of the Barnes Bowling Club newsletter.
            </p>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ background: 'var(--cream)', padding: '3rem 2rem' }}>
          <div style={{
            maxWidth: '1100px',
            margin: '0 auto',
            backgroundColor: 'var(--green-deep)',
            backgroundImage: [
              'repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 8px)',
              'repeating-linear-gradient(-45deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 8px)',
            ].join(', '),
            border: '18px solid #8B5E3C',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
            borderRadius: '4px',
            padding: '3.5rem 2rem 4.5rem',
          }}>
            <p style={{ fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif", fontSize: '17px', color: 'rgba(245,240,232,0.85)', lineHeight: 1.8, margin: '0 0 2.5rem' }}>
              Catch up on past editions of <em>On the Green</em> — the Barnes Bowling Club newsletter.
            </p>
            {issues.length === 0 ? (
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '14px', color: 'rgba(245,240,232,.55)', fontStyle: 'italic' }}>
                No newsletters published yet.
              </p>
            ) : (
              <NewsletterGrid issues={issues} />
            )}
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
