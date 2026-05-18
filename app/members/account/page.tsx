import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyMemberSession, SESSION_COOKIE } from '@/lib/memberSession';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getMemberNumber } from '@/lib/memberNumber';
import { AccountClient } from './AccountClient';

export default async function AccountPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  const session = sessionCookie ? await verifyMemberSession(sessionCookie.value) : null;
  if (!session) redirect('/login?redirect=/members/account');

  const email = session.email;

  const [{ data: transactions }, { data: profile }] = await Promise.all([
    supabaseAdmin
      .from('member_transactions')
      .select('*')
      .eq('member_email', email)
      .order('date', { ascending: true })
      .order('created_at', { ascending: true }),
    supabaseAdmin
      .from('member_profiles')
      .select('first_name, last_name')
      .eq('member_email', email)
      .maybeSingle(),
  ]);

  const memberName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : null;

  const memberId =
    getMemberNumber(profile?.first_name ?? '', profile?.last_name ?? '') ??
    `BBC${email.slice(0, 6).toUpperCase().replace(/[^A-Z]/g, '')}`;

  return (
    <>
      <Navbar />
      <main>
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)' }}>Members Area</div>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              My <em style={{ color: '#c9a84c', fontStyle: 'italic' }}>Account</em>
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: 'rgba(245,240,232,.7)', marginTop: '0.75rem' }}>
              Your financial statement with Barnes Bowling Club.
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <a href="/members/dashboard" style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '12px',
              color: 'var(--green-deep)',
              textDecoration: 'none',
              letterSpacing: '.04em',
            }}>
              ← Back to Dashboard
            </a>
          </div>
          <AccountClient
            email={email}
            memberName={memberName}
            memberId={memberId}
            transactions={transactions ?? []}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
