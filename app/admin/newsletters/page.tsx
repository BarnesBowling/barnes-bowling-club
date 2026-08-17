import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NewslettersAdminClient } from './NewslettersAdminClient';

export const dynamic = 'force-dynamic';

export default async function NewslettersAdminPage() {
  await requireAdminSession();

  const { data: newsletters } = await supabaseAdmin
    .from('newsletters')
    .select('id, title, issue_date, issue_label, pdf_storage_path, pdf_public_url, thumbnail_storage_path, thumbnail_public_url, thumbnail_source, sort_order')
    .order('sort_order', { ascending: false });

  return (
    <>
      <Navbar />
      <main>
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a href="/admin" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>Admin</a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Newsletter <em style={{ color: 'var(--gold-light)' }}>Management</em>
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: 'rgba(245,240,232,.65)', marginTop: '0.75rem' }}>
              Upload new newsletters and manage existing editions.
            </p>
          </div>
        </div>
        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>
          <NewslettersAdminClient initialNewsletters={newsletters ?? []} />
        </div>
      </main>
      <Footer />
    </>
  );
}
