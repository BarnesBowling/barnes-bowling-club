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

  const [{ data: profile }, { data: balanceRow }] = await Promise.all([
    supabaseAdmin.from('member_profiles').select('*').eq('member_email', email).maybeSingle(),
    supabaseAdmin.from('member_balances').select('membership_fee, guest_fee, manser_fee, wrong_bias_fee, event_fee').eq('member_email', email).maybeSingle(),
  ]);

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
            <div className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)' }}>Members Area</div>
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
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
