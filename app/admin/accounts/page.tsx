import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { AdminAccountForm } from './AdminAccountForm';
import { AdminTransactionsClient } from './AdminTransactionsClient';

export default async function AdminAccountsPage() {
  try { await requireAdminSession(); } catch { redirect('/login?redirect=/admin/accounts'); }

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: members }, { data: transactions }] = await Promise.all([
    supabaseAdmin
      .from('club_members')
      .select('id, full_name, membership_number, email, status')
      .order('full_name'),
    supabaseAdmin
      .from('member_ledger')
      .select('*, club_members(full_name, membership_number)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  return (
    <>
      <Navbar />
      <main style={{ padding: '3rem 0', background: 'var(--cream)' }}>
        <div className="section-inner" style={{ padding: '0 2rem', display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>

          <div>
            <a href="/admin" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--green-deep)', textDecoration: 'none', letterSpacing: '.04em' }}>
              ← Admin panel
            </a>
            <span className="section-tag" style={{ display: 'block', marginTop: '1rem' }}>Admin</span>
            <h1 className="section-h2">Member Accounts</h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
              Add charges and payments to member accounts.
            </p>
          </div>

          <AdminTransactionsClient
            initialTransactions={transactions ?? []}
            members={members ?? []}
          />

          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-deep)', marginBottom: '1.5rem' }}>
              Add charge or payment
            </h2>
            <AdminAccountForm members={members ?? []} today={today} />
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
