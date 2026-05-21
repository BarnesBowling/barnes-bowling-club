import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { AdminResultsClient } from './AdminResultsClient';

export default async function AdminResultsPage() {
  try { await requireAdminSession(); } catch { redirect('/login?redirect=/admin/results'); }

  const [{ data: competitions }, { data: pairs }, { data: matches }] = await Promise.all([
    supabaseAdmin.from('competitions').select('*').order('name'),
    supabaseAdmin.from('pairs_teams').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('matches').select('*').order('match_date', { ascending: false }).limit(20),
  ]);

  return (
    <>
      <Navbar />
      <main>
        {/* Green header */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a href="/admin" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>Admin</a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Results <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>&amp; Leaderboard</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              Enter match results, register pair teams, and manage the season leaderboard.
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>
          <AdminResultsClient
            competitions={competitions ?? []}
            pairs={pairs ?? []}
            recentMatches={matches ?? []}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
