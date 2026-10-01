import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { redirect, notFound } from 'next/navigation';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { MemberIndexCard } from './MemberIndexCard';

export const dynamic = 'force-dynamic';

export default async function MemberCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    await requireAdminSession();
  } catch {
    redirect(`/login?redirect=/admin/members/${id}`);
  }

  const { data: member } = await supabaseAdmin
    .from('club_members')
    .select('*')
    .eq('id', id)
    .single();

  if (!member) notFound();

  let photoUrl: string | null = null;
  if (member.photo_id_filename) {
    const { data } = await supabaseAdmin.storage
      .from('member-photos')
      .createSignedUrl(member.photo_id_filename, 3600);
    photoUrl = data?.signedUrl ?? null;
  }

  const m = {
    id: member.id as string,
    full_name: member.full_name as string,
    email: (member.email ?? null) as string | null,
    membership_number: (member.membership_number ?? null) as string | null,
    handicap: (member.handicap ?? 0) as number,
    status: (member.status ?? 'active') as 'active' | 'inactive' | 'probationary',
    joined_date: (member.joined_date ?? null) as string | null,
    notes: (member.notes ?? null) as string | null,
    created_at: member.created_at as string,
    auth_user_id: (member.auth_user_id ?? null) as string | null,
    photo_id_filename: (member.photo_id_filename ?? null) as string | null,
    has_key: (member.has_key ?? false) as boolean,
    card_issued: (member.card_issued ?? false) as boolean,
    card_issued_date: (member.card_issued_date ?? null) as string | null,
    phone: (member.phone ?? null) as string | null,
    emergency_contact_name: (member.emergency_contact_name ?? null) as string | null,
    emergency_contact_phone: (member.emergency_contact_phone ?? null) as string | null,
    address_line1: (member.address_line1 ?? null) as string | null,
    address_line2: (member.address_line2 ?? null) as string | null,
    city: (member.city ?? null) as string | null,
    postcode: (member.postcode ?? null) as string | null,
  };

  return (
    <>
      <Navbar />
      <main style={{ padding: '3rem 0', background: 'var(--cream)', minHeight: '80vh' }}>
        <div className="section-inner" style={{ padding: '0 2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <a
              href="/admin/club-members"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                letterSpacing: '.05em',
              }}
            >
              ← Club Roster
            </a>
          </div>
          <span className="section-tag">Admin</span>
          <h1 className="section-h2" style={{ marginBottom: '2rem' }}>{member.full_name}</h1>
          <MemberIndexCard
            memberId={id}
            initialMember={m}
            initialPhotoUrl={photoUrl}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
