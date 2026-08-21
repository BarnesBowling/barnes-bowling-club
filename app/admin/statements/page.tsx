import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { redirect } from 'next/navigation';
import { requireViewerSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';

function fmtGBP(n: number): string {
  return `£${Math.abs(n).toFixed(2)}`;
}

export default async function StatementsPage() {
  try { await requireViewerSession(); } catch { redirect('/login?redirect=/admin/statements'); }

  const [{ data: members }, { data: ledger }] = await Promise.all([
    supabaseAdmin
      .from('club_members')
      .select('id, full_name, membership_number, status')
      .order('full_name'),
    supabaseAdmin
      .from('member_ledger')
      .select('member_id, amount, type'),
  ]);

  // Compute per-member balance (positive = owes, negative = in credit)
  const balanceMap = new Map<string, number>();
  for (const row of ledger ?? []) {
    const signed = row.type === 'credit' ? -Number(row.amount) : Number(row.amount);
    balanceMap.set(row.member_id, (balanceMap.get(row.member_id) ?? 0) + signed);
  }

  const rows = (members ?? []).map(m => ({
    ...m,
    balance: balanceMap.get(m.id) ?? 0,
  }));

  const thStyle: React.CSSProperties = {
    padding: '9px 14px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,.85)',
    textAlign: 'left',
    background: 'var(--green-deep)',
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '11px 14px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    color: 'var(--text-dark)',
    borderBottom: '1px solid rgba(45,90,61,.07)',
    verticalAlign: 'middle',
  };

  return (
    <>
      <Navbar />
      <main style={{ padding: '3rem 0', background: 'var(--cream)', minHeight: '80vh' }}>
        <div className="section-inner" style={{ padding: '0 2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

          <div>
            <span className="section-tag">Admin</span>
            <h1 className="section-h2">Member Statements</h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
              View member account statements. Click a name to open their full statement.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: '480px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Membership No.</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Balance</th>
                  <th style={{ ...thStyle, width: '1%' }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m, i) => {
                  const owing  = m.balance > 0.005;
                  const credit = m.balance < -0.005;
                  return (
                    <tr key={m.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(45,90,61,.018)' }}>
                      <td style={{ ...tdStyle, fontWeight: 500 }}>{m.full_name}</td>
                      <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>
                        {m.membership_number ?? '—'}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '.07em',
                          textTransform: 'uppercase',
                          fontFamily: "'DM Sans', sans-serif",
                          ...(m.status === 'active'
                            ? { background: 'rgba(45,90,61,.1)', color: '#2d5a3d' }
                            : m.status === 'probationary'
                            ? { background: 'rgba(201,168,76,.15)', color: '#7a6040' }
                            : { background: 'rgba(0,0,0,.06)', color: '#666' }),
                        }}>
                          {m.status}
                        </span>
                      </td>
                      <td style={{
                        ...tdStyle,
                        textAlign: 'right',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        color: owing ? '#c0392b' : credit ? '#2e7d32' : 'var(--text-muted)',
                      }}>
                        {owing
                          ? fmtGBP(m.balance)
                          : credit
                          ? `−${fmtGBP(m.balance)}`
                          : '—'}
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                        <a
                          href={`/admin/members/${m.id}/statement`}
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '.06em',
                            textTransform: 'uppercase',
                            color: 'var(--green-mid)',
                            textDecoration: 'none',
                            padding: '4px 10px',
                            border: '1.5px solid var(--green-mid)',
                            display: 'inline-block',
                          }}
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
