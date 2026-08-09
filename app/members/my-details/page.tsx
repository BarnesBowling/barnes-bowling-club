import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getMemberNumber } from '@/lib/memberNumber';
import { MyDetailsClient } from './MyDetailsClient';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyMemberSession, SESSION_COOKIE } from '@/lib/memberSession';

export default async function MyDetailsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  const session = sessionCookie ? await verifyMemberSession(sessionCookie.value) : null;
  if (!session) redirect('/login?redirect=/members/my-details');

  const email = session.email;

  const [{ data: profile }, { data: balanceRow }, { data: clubMemberRow }] = await Promise.all([
    supabaseAdmin.from('member_profiles').select('*').eq('member_email', email).maybeSingle(),
    supabaseAdmin.from('member_balances').select('membership_fee, guest_fee, manser_fee, wrong_bias_fee, event_fee').eq('member_email', email).maybeSingle(),
    supabaseAdmin.from('club_members').select('id, photo_id_filename').eq('email', email).maybeSingle(),
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const photoIdFilename = (clubMemberRow as any)?.photo_id_filename as string | null ?? null;

  // Fetch ledger balance from member_ledger
  const clubMemberId = (clubMemberRow as { id?: string } | null)?.id ?? null;
  const { data: ledgerRows } = clubMemberId
    ? await supabaseAdmin.from('member_ledger').select('amount, type').eq('member_id', clubMemberId)
    : { data: [] };
  const ledgerDebits  = (ledgerRows ?? []).filter(r => r.type === 'debit').reduce((s, r) => s + Number(r.amount), 0);
  const ledgerCredits = (ledgerRows ?? []).filter(r => r.type === 'credit').reduce((s, r) => s + Number(r.amount), 0);
  const ledgerBalance = { debits: ledgerDebits, credits: ledgerCredits, balance: ledgerDebits - ledgerCredits };

  const memberNumber =
    getMemberNumber(profile?.first_name ?? '', profile?.last_name ?? '') ??
    `BBC${email.slice(0, 6).toUpperCase().replace(/[^A-Z]/g, '')}`;

  const memberName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : '';

  const balance = balanceRow
    ? {
        membershipFee: balanceRow.membership_fee ?? 0,
        guestFee:      balanceRow.guest_fee      ?? 0,
        manserFee:     balanceRow.manser_fee      ?? 0,
        wrongBiasFee:  balanceRow.wrong_bias_fee  ?? 0,
        eventFee:      balanceRow.event_fee       ?? 0,
      }
    : null;

  return (
    <>
      <Navbar />
      <main>
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a href="/members/dashboard" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>Members Area</a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              My <em style={{ color: '#c9a84c', fontStyle: 'italic' }}>Details</em>
            </h1>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3rem 2rem 5rem', maxWidth: '700px' }}>
          <MyDetailsClient
            email={email}
            memberId={memberNumber}
            memberName={memberName}
            profile={profile}
            balance={balance}
            photoIdFilename={photoIdFilename}
            ledgerBalance={ledgerBalance}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
