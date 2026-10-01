import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { AdminClubMembersClient } from './AdminClubMembersClient';

export default async function AdminClubMembersPage() {
  try { await requireAdminSession(); } catch { redirect('/login?redirect=/admin/club-members'); }

  const { data: members } = await supabaseAdmin
    .from('club_members')
    .select('*')
    .order('full_name');

  // Batch-generate signed URLs for members with valid photos (treat "test.jpeg" as no photo)
  const photoPaths = (members ?? [])
    .filter(m => m.photo_id_filename && m.photo_id_filename !== 'test.jpeg')
    .map(m => m.photo_id_filename as string);

  const initialPhotoUrls: Record<string, string> = {};
  if (photoPaths.length > 0) {
    const { data: signed } = await supabaseAdmin.storage
      .from('member-photos')
      .createSignedUrls(photoPaths, 3600);
    if (signed) {
      const pathIndex = new Map(signed.map(s => [s.path, s.signedUrl]));
      for (const m of (members ?? [])) {
        if (!m.photo_id_filename || m.photo_id_filename === 'test.jpeg') continue;
        const url = pathIndex.get(m.photo_id_filename);
        if (url) initialPhotoUrls[m.id] = url;
      }
    }
  }

  return (
    <>
      <Navbar />
      <main>
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a href="/admin" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>Admin</a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Club Roster
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              Manage member records, handicaps, and membership numbers. The single source of truth for player data.
            </p>
          </div>
        </div>
        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>
          <AdminClubMembersClient initialMembers={members ?? []} initialPhotoUrls={initialPhotoUrls} />
        </div>
      </main>
      <Footer />
    </>
  );
}
