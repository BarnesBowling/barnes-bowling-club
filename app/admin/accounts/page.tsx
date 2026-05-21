import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { deleteTransaction } from './actions';
import { AdminAccountForm } from './AdminAccountForm';

const CATEGORY_LABELS: Record<string, string> = {
  membership_fee: 'Membership Fee',
  guest_fee:      'Guest Fee',
  event_fee:      'Event Fee',
  manser_fee:     'Manser Fee',
  wrong_bias_fee: 'Wrong Bias Fee',
  miscellaneous:  'Miscellaneous',
  payment:        'Payment',
};

function fmtDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtGBP(n: number): string {
  return `£${Math.abs(n).toFixed(2)}`;
}

export default async function AdminAccountsPage() {
  try { await requireAdminSession(); } catch { redirect('/login?redirect=/admin/accounts'); }

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: members }, { data: transactions }] = await Promise.all([
    supabaseAdmin
      .from('club_members')
      .select('id, full_name, membership_number')
      .order('full_name'),
    supabaseAdmin
      .from('member_ledger')
      .select('*, club_members(full_name, membership_number)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  // Signed balance per member_id
  const balanceById: Record<string, number> = {};
  for (const t of transactions ?? []) {
    const signed = t.type === 'credit' ? -Number(t.amount) : Number(t.amount);
    balanceById[t.member_id] = (balanceById[t.member_id] ?? 0) + signed;
  }

  const membersWithBalance = (members ?? [])
    .filter(m => Math.abs(balanceById[m.id] ?? 0) > 0.001)
    .map(m => ({ ...m, balance: balanceById[m.id] ?? 0 }));

  const thStyle = {
    padding: '9px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600,
    letterSpacing: '.1em', textTransform: 'uppercase' as const, color: 'var(--text-muted)',
    textAlign: 'left' as const, borderBottom: '2px solid rgba(45,90,61,.12)', whiteSpace: 'nowrap' as const,
  };
  const tdStyle = {
    padding: '10px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
    color: 'var(--text-dark)', borderBottom: '1px solid rgba(45,90,61,.06)', verticalAlign: 'middle' as const,
  };

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

          {membersWithBalance.length > 0 && (
            <section>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-deep)', marginBottom: '1.25rem' }}>
                Outstanding balances
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                {membersWithBalance.map(m => (
                  <div key={m.id} style={{
                    background: '#fff',
                    border: `1px solid ${m.balance > 0 ? 'rgba(192,57,43,.2)' : 'rgba(46,125,50,.2)'}`,
                    padding: '.6rem .9rem', minWidth: '180px',
                  }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--green-deep)' }}>
                      {m.full_name}
                    </div>
                    {m.membership_number && (
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'rgba(45,90,61,.45)', marginBottom: '4px' }}>
                        {m.membership_number}
                      </div>
                    )}
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', fontWeight: 700, color: m.balance > 0 ? '#c0392b' : '#2e7d32' }}>
                      {m.balance > 0 ? fmtGBP(m.balance) : `−${fmtGBP(m.balance)}`}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-deep)', marginBottom: '1.5rem' }}>
              Add charge or payment
            </h2>
            <AdminAccountForm members={members ?? []} today={today} />
          </section>

          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-deep)', marginBottom: '1.25rem' }}>
              Recent transactions
            </h2>
            {!transactions || transactions.length === 0 ? (
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No transactions recorded yet.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: '680px' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Member</th>
                      <th style={thStyle}>Description</th>
                      <th style={thStyle}>Category</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
                      <th style={{ ...thStyle, width: '60px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t, i) => {
                      const isCredit = t.type === 'credit';
                      const cm = t.club_members as { full_name: string; membership_number: string | null } | null;
                      return (
                        <tr key={t.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(45,90,61,.018)' }}>
                          <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{fmtDate(t.date)}</td>
                          <td style={tdStyle}>
                            <div style={{ fontWeight: 500 }}>{cm?.full_name ?? t.member_id}</div>
                            {cm?.membership_number && <div style={{ fontSize: '11px', color: 'rgba(45,90,61,.4)' }}>{cm.membership_number}</div>}
                          </td>
                          <td style={tdStyle}>
                            <div>{t.description}</div>
                            {t.category === 'guest_fee' && t.metadata && (
                              <div style={{ fontSize: '11px', color: 'var(--green-deep)', marginTop: '3px' }}>
                                {(t.metadata as Record<string,unknown>).num_guests as number} guest{((t.metadata as Record<string,unknown>).num_guests as number) !== 1 ? 's' : ''} · £{((t.metadata as Record<string,unknown>).cost_per_guest as number).toFixed(2)}/guest
                                {(t.metadata as Record<string,unknown>).date_of_play ? ` · played ${fmtDate(String((t.metadata as Record<string,unknown>).date_of_play))}` : ''}
                                {(t.metadata as Record<string,unknown>).notes ? ` · ${(t.metadata as Record<string,unknown>).notes}` : ''}
                              </div>
                            )}
                          </td>
                          <td style={tdStyle}>
                            <span style={{ display: 'inline-block', padding: '2px 7px', background: 'rgba(45,90,61,.07)', fontSize: '10px', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--green-deep)', whiteSpace: 'nowrap' }}>
                              {CATEGORY_LABELS[t.category] ?? t.category}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap', color: isCredit ? '#2e7d32' : '#c0392b' }}>
                            {isCredit ? `−${fmtGBP(t.amount)}` : fmtGBP(t.amount)}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <form action={deleteTransaction} style={{ display: 'inline' }}>
                              <input type="hidden" name="id" value={t.id} />
                              <button style={{ background: 'none', border: '1px solid rgba(180,0,0,.2)', color: '#a00', fontSize: '10px', padding: '3px 8px', cursor: 'pointer' }}>Del</button>
                            </form>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
