import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ArchiveAdminClient } from './ArchiveAdminClient';
import { ArchiveSeasonClient } from './ArchiveSeasonClient';
import { getSeasonPreview } from './archiveActions';

export const dynamic = 'force-dynamic';

export default async function ArchiveAdminPage() {
  await requireAdminSession();

  const [{ data: rows }, preview] = await Promise.all([
    supabaseAdmin
      .from('archive_roles')
      .select('id, role_type, year, name, note')
      .order('year', { ascending: false }),
    getSeasonPreview(),
  ]);

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
              Archive <em style={{ color: 'var(--gold-light)' }}>Admin</em>
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: 'rgba(245,240,232,.65)', marginTop: '0.75rem' }}>
              Archive the current season and manage past presidents and captains.
            </p>
          </div>
        </div>
        <div className="section-inner" style={{ padding: '3rem 2rem 5rem', display: 'flex', flexDirection: 'column', gap: '4rem' }}>

          {/* ── Season archive ── */}
          <section>
            <div style={{ marginBottom: '1.75rem' }}>
              <span className="section-tag">Season Archive</span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--green-deep)', margin: '.25rem 0 .5rem' }}>
                Archive 2026 Season
              </h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                Saves all competition results to the archive, then clears match scores so the new season can begin.
              </p>
            </div>
            <ArchiveSeasonClient
              counts={preview.counts}
              totalMatches={preview.totalMatches}
              alreadyArchived={preview.alreadyArchived}
            />
          </section>

          {/* ── Archive roles ── */}
          <section>
            <div style={{ marginBottom: '1.75rem' }}>
              <span className="section-tag">Archive Roles</span>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--green-deep)', margin: '.25rem 0 .5rem' }}>
                Past Presidents &amp; Captains
              </h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Changes appear immediately on the archive pages.
              </p>
            </div>
            <ArchiveAdminClient presidents={presidents} captains={captains} />
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
