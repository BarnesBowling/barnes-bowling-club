import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ArchiveAdminClient } from './ArchiveAdminClient';

export const dynamic = 'force-dynamic';

export default async function ArchiveAdminPage() {
  await requireAdminSession();

  const { data: rows } = await supabaseAdmin
    .from('archive_roles')
    .select('id, role_type, year, name, note')
    .order('year', { ascending: false });

  const presidents = (rows ?? []).filter(r => r.role_type === 'president');
  const captains   = (rows ?? []).filter(r => r.role_type === 'captain');

  return (
    <>
      <Navbar />
      <main>
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a href="/admin" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>Admin</a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Archive <em style={{ color: 'var(--gold-light)' }}>Roles</em>
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: 'rgba(245,240,232,.65)', marginTop: '0.75rem' }}>
              Edit past presidents and captains. Changes appear immediately on the archive pages.
            </p>
          </div>
        </div>
        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>
          <ArchiveAdminClient presidents={presidents} captains={captains} />
        </div>
      </main>
      <Footer />
    </>
  );
}
