import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyMemberSession, SESSION_COOKIE } from '@/lib/memberSession';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { PaymentColumns } from './PaymentColumns';

export default async function PaymentPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  const session = sessionCookie ? await verifyMemberSession(sessionCookie.value) : null;
  if (!session) redirect('/login?redirect=/members/payment');

  // Fetch live balance from member_ledger (same pattern as account page)
  const { data: clubMember } = await supabaseAdmin
    .from('club_members')
    .select('id')
    .eq('email', session.email)
    .maybeSingle();

  let balance = 0;
  if (clubMember) {
    const { data: transactions } = await supabaseAdmin
      .from('member_ledger')
      .select('amount, type')
      .eq('member_id', clubMember.id);

    for (const t of transactions ?? []) {
      const signed = t.type === 'credit' ? -Math.abs(Number(t.amount)) : Math.abs(Number(t.amount));
      balance += signed;
    }
  }

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a href="/members/dashboard" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>Members Area</a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Make a <em style={{ color: 'var(--gold-light)' }}>Payment</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              Pay your annual subscription, guest fees, or event charges securely online.
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>
          <PaymentColumns memberEmail={session.email} balance={balance} />

          <div style={{ marginTop: '2rem' }}>
            <a href="/members/dashboard" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--green-mid)', textDecoration: 'none', letterSpacing: '.05em' }}>
              ← Back to dashboard
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
