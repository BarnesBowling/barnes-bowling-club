import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { CommitteeAdminClient } from './CommitteeAdminClient';

export const dynamic = 'force-dynamic';

export default async function CommitteeAdminPage() {
  await requireAdminSession();

  const { data: officers } = await supabaseAdmin
    .from('officers')
    .select('id, name, role, group_name, sort_order, photo_filename, photo_storage_path, photo_public_url')
    .order('group_name')
    .order('sort_order');

  return (
    <>
      <Navbar />
      <main>
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a href="/admin" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>Admin</a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Committee <em style={{ color: 'var(--gold-light)' }}>Photos</em>
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: 'rgba(245,240,232,.65)', marginTop: '0.75rem' }}>
              Upload and manage photos for all committee members. Photos stored here appear on the General Committee and Handicap Committee pages.
            </p>
          </div>
        </div>
        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>
          <CommitteeAdminClient initialOfficers={officers ?? []} />
        </div>
      </main>
      <Footer />
    </>
  );
}
