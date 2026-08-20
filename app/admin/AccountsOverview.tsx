// Purely server-rendered — no 'use client' needed.

type LedgerBalance = {
  member_id: string;
  full_name: string;
  membership_number: string | null;
  balance: number; // positive = owes money, negative = in credit
};

type StripePayment = {
  id: string;
  member_email: string;
  date: string;
  description: string;
  amount: number; // negative = credit (money received)
  created_at: string;
};

type Props = {
  balances: LedgerBalance[];
  recentPayments: StripePayment[];
};

function fmtGBP(n: number) {
  return `£${Math.abs(n).toFixed(2)}`;
}
function fmtDate(iso: string) {
  return new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

const th: React.CSSProperties = {
  padding: '8px 12px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  textAlign: 'left',
  borderBottom: '2px solid rgba(45,90,61,.12)',
  whiteSpace: 'nowrap',
};
const td: React.CSSProperties = {
  padding: '9px 12px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  color: 'var(--text-dark)',
  borderBottom: '1px solid rgba(45,90,61,.06)',
  verticalAlign: 'middle',
};

export function AccountsOverview({ balances, recentPayments }: Props) {
  const owing   = balances.filter(b => b.balance >  0.005).sort((a, b) => b.balance - a.balance);
  const inCredit = balances.filter(b => b.balance < -0.005).sort((a, b) => a.balance - b.balance);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

      {/* ── Outstanding balances ── */}
      <div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', color: 'var(--green-deep)', marginBottom: '1rem', marginTop: 0 }}>
          Outstanding balances
          {owing.length > 0 && (
            <span style={{ marginLeft: '10px', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, color: '#c0392b', background: 'rgba(192,57,43,.08)', padding: '2px 8px', borderRadius: '2px' }}>
              {owing.length} member{owing.length !== 1 ? 's' : ''}
            </span>
          )}
        </h3>

        {owing.length === 0 ? (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No outstanding balances on the ledger.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: '420px' }}>
              <thead>
                <tr>
                  <th style={th}>Member</th>
                  <th style={th}>Membership No.</th>
                  <th style={{ ...th, textAlign: 'right' }}>Balance owed</th>
                </tr>
              </thead>
              <tbody>
                {owing.map((m, i) => (
                  <tr key={m.member_id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(45,90,61,.018)' }}>
                    <td style={td}>
                      <a href={`/admin/members/${m.member_id}/statement`} style={{ color: 'var(--green-deep)', textDecoration: 'underline', textUnderlineOffset: '2px', fontWeight: 500 }}>
                        {m.full_name}
                      </a>
                    </td>
                    <td style={{ ...td, color: 'var(--text-muted)', fontSize: '12px' }}>
                      {m.membership_number ?? '—'}
                    </td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: '#c0392b', whiteSpace: 'nowrap' }}>
                      {fmtGBP(m.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} style={{ ...td, borderTop: '2px solid rgba(45,90,61,.12)', borderBottom: 'none', fontWeight: 600, color: 'var(--green-deep)' }}>
                    Total outstanding
                  </td>
                  <td style={{ ...td, borderTop: '2px solid rgba(45,90,61,.12)', borderBottom: 'none', textAlign: 'right', fontWeight: 700, color: '#c0392b', whiteSpace: 'nowrap' }}>
                    {fmtGBP(owing.reduce((s, m) => s + m.balance, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {inCredit.length > 0 && (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#2e7d32', marginTop: '.75rem' }}>
            {inCredit.length} member{inCredit.length !== 1 ? 's are' : ' is'} in credit:{' '}
            {inCredit.map(m => `${m.full_name} (${fmtGBP(m.balance)})`).join(', ')}.
          </p>
        )}
      </div>

      {/* ── Incoming Stripe / PayPal payments ── */}
      <div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', color: 'var(--green-deep)', marginBottom: '1rem', marginTop: 0 }}>
          Recent online payments received
        </h3>

        {recentPayments.length === 0 ? (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No online payments recorded yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: '520px' }}>
              <thead>
                <tr>
                  <th style={th}>Date</th>
                  <th style={th}>Member email</th>
                  <th style={th}>Description</th>
                  <th style={{ ...th, textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p, i) => (
                  <tr key={p.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(45,90,61,.018)' }}>
                    <td style={{ ...td, whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                      {fmtDate(p.date)}
                    </td>
                    <td style={{ ...td, fontSize: '12px' }}>{p.member_email}</td>
                    <td style={td}>{p.description}</td>
                    <td style={{ ...td, textAlign: 'right', fontWeight: 700, color: '#2e7d32', whiteSpace: 'nowrap' }}>
                      {fmtGBP(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)', marginTop: '.75rem' }}>
          Showing last 20 online payments. Full ledger at{' '}
          <a href="/admin/accounts" style={{ color: 'var(--green-mid)' }}>Member Accounts</a>.
        </p>
      </div>

    </div>
  );
}
