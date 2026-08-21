import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { redirect } from 'next/navigation';
import { requireViewerSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';

function fmtGBP(n: number): string {
  return `£${Math.abs(n).toFixed(2)}`;
}

export default async function StatementsPage() {
  let session: { email: string; role: 'admin' | 'viewer' };
  try {
    session = await requireViewerSession();
  } catch {
    redirect('/login?redirect=/admin/statements');
  }

  const [{ data: members }, { data: ledger }] = await Promise.all([
    supabaseAdmin
      .from('club_members')
      .select('id, full_name, membership_number, status')
      .order('full_name'),
    supabaseAdmin
      .from('member_ledger')
      .select('member_id, amount, type'),
  ]);

  const balances = new Map<string, number>();
  for (const entry of ledger ?? []) {
    const current = balances.get(entry.member_id) ?? 0;
    const amount = Number(entry.amount);
    balances.set(entry.member_id, current + (entry.type === 'credit' ? -amount : amount));
  }

  return (
    <>
      <Navbar />
      <main style={{ padding: '3rem 0', background: 'var(--cream)', minHeight: '80vh' }}>
        <div className="section-inner" style={{ padding: '0 2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            {session.role === 'admin' && (
              <a
                href="/admin"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: 'var(--green-deep)',
                  textDecoration: 'none',
                  letterSpacing: '.04em',
                }}
              >
                ← Admin panel
              </a>
            )}
            <span className="section-tag" style={{ display: 'block', marginTop: session.role === 'admin' ? '1rem' : 0 }}>
              Statements
            </span>
            <h1 className="section-h2">Member Statements</h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
              Read-only access to member balances and statements.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: '620px' }}>
              <thead>
                <tr>
                  {['Membership No.', 'Member', 'Status', 'Balance', ''].map((label, i) => (
                    <th
                      key={label || `blank-${i}`}
                      style={{
                        padding: '10px 12px',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '10px',
                        fontWeight: 600,
                        letterSpacing: '.1em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,.85)',
                        textAlign: i === 3 ? 'right' : 'left',
                        background: 'var(--green-deep)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(members ?? []).map((member, index) => {
                  const balance = balances.get(member.id) ?? 0;
                  const owing = balance > 0.005;
                  const credit = balance < -0.005;
                  return (
                    <tr key={member.id} style={{ background: index % 2 === 0 ? '#fff' : 'rgba(45,90,61,.02)' }}>
                      <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(45,90,61,.07)', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-muted)' }}>
                        {member.membership_number ?? '—'}
                      </td>
                      <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(45,90,61,.07)', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-dark)', fontWeight: 600 }}>
                        {member.full_name}
                      </td>
                      <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(45,90,61,.07)', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {member.status}
                      </td>
                      <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(45,90,61,.07)', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', textAlign: 'right', fontWeight: 700, color: owing ? '#c0392b' : credit ? '#2e7d32' : 'var(--text-dark)', whiteSpace: 'nowrap' }}>
                        {balance >= 0 ? fmtGBP(balance) : `−${fmtGBP(balance)}`}
                      </td>
                      <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(45,90,61,.07)', textAlign: 'right' }}>
                        <a
                          href={`/admin/members/${member.id}/statement`}
                          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--green-deep)', textDecoration: 'none' }}
                        >
                          View →
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
