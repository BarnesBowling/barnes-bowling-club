import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ApplicationsClient } from './ApplicationsClient';

export const dynamic = 'force-dynamic';

export default async function AdminApplicationsPage() {
  try { await requireAdminSession(); } catch { redirect('/login?redirect=/admin/applications'); }

  const { data: applications } = await supabaseAdmin
    .from('membership_applications')
    .select('id, full_name, email, created_at, proposer_name, seconder_name, status')
    .order('created_at', { ascending: false });

  return (
    <>
      <Navbar />
      <main>
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a href="/admin" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>Admin</a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Membership Applications
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              Review, approve or reject membership applications. Click a row to open the full record.
            </p>
          </div>
        </div>
        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>
          <ApplicationsClient initialApplications={applications ?? []} />
        </div>
      </main>
      <Footer />
    </>
  );
}
