import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyMemberSession, SESSION_COOKIE } from '@/lib/memberSession';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { AccountClient } from './AccountClient';

export default async function AccountPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  const session = sessionCookie ? await verifyMemberSession(sessionCookie.value) : null;
  if (!session) redirect('/login?redirect=/members/account');

  const email = session.email;

  // Look up club_members record — try by email first, then by auth_user_id via Supabase auth lookup
  const { data: clubMember } = await supabaseAdmin
    .from('club_members')
    .select('id, full_name, membership_number, auth_user_id')
    .eq('email', email)
    .maybeSingle();

  const memberId   = clubMember?.membership_number ?? `BBC${email.slice(0, 6).toUpperCase().replace(/[^A-Z]/g, '')}`;
  const memberName = clubMember?.full_name ?? null;

  // Fetch transactions from member_ledger
  const rawTransactions = clubMember
    ? (await supabaseAdmin
        .from('member_ledger')
        .select('*')
        .eq('member_id', clubMember.id)
        .order('date', { ascending: true })
        .order('created_at', { ascending: true })
      ).data ?? []
    : [];

  // Convert to signed amounts for AccountClient (debit=positive, credit=negative)
  const transactions = rawTransactions.map(t => ({
    id:           t.id,
    member_email: email,
    date:         t.date,
    description:  t.description,
    category:     t.category,
    amount:       t.type === 'credit' ? -Math.abs(Number(t.amount)) : Math.abs(Number(t.amount)),
    created_at:   t.created_at,
    metadata:     t.metadata ?? null,
  }));

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
              fontFamily: "'DM Sans', sans-serif", fontSize: '12px',
              color: 'var(--green-deep)', textDecoration: 'none', letterSpacing: '.04em',
            }}>
              ← Back to Dashboard
            </a>
          </div>
          <AccountClient
            email={email}
            memberName={memberName}
            memberId={memberId}
            transactions={transactions}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
