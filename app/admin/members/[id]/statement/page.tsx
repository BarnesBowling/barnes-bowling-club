import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { redirect, notFound } from 'next/navigation';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { StatementPDFButton } from './StatementPDFButton';
import type { StatementEntry } from './StatementPDFButton';

const CATEGORY_LABELS: Record<string, string> = {
  membership_fee: 'Membership Fee',
  joining_fee:    'Joining Fee',
  guest_fee:      'Guest Fee',
  event_fee:      'Event Fee',
  manser_fee:     'Manser Fee',
  wrong_bias_fee: 'Wrong Bias Fee',
  miscellaneous:  'Miscellaneous',
  payment:        'Payment',
};

function fmtDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function fmtGBP(n: number): string {
  return `£${Math.abs(n).toFixed(2)}`;
}

export default async function MemberStatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try { await requireAdminSession(); } catch { redirect('/login?redirect=/admin/club-members'); }

  const { id } = await params;

  const [{ data: member }, { data: rawEntries }] = await Promise.all([
    supabaseAdmin
      .from('club_members')
      .select('full_name, membership_number, status')
      .eq('id', id)
      .single(),
    supabaseAdmin
      .from('member_ledger')
      .select('id, date, description, category, amount, type, guest_names, num_guests, cost_per_guest, metadata')
      .eq('member_id', id)
      .order('date', { ascending: true })
      .order('created_at', { ascending: true }),
  ]);

  if (!member) notFound();

  const entries: StatementEntry[] = (rawEntries ?? []).map(e => ({
    ...e,
    amount: Number(e.amount),
    type: e.type as 'debit' | 'credit',
    metadata: e.metadata as Record<string, unknown> | null,
  }));

  // Compute running balance (debit = positive, credit = negative)
  let running = 0;
  const rows = entries.map(e => {
    running += e.type === 'credit' ? -e.amount : e.amount;
    return { ...e, balance: running };
  });

  const finalBalance = running;

  // ── Styles ────────────────────────────────────────────────────────────────

  const thStyle: React.CSSProperties = {
    padding: '10px 12px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,.85)',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    background: 'var(--green-deep)',
    borderBottom: 'none',
  };

  const tdStyle: React.CSSProperties = {
    padding: '11px 12px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    color: 'var(--text-dark)',
    borderBottom: '1px solid rgba(45,90,61,.07)',
    verticalAlign: 'top',
  };

  return (
    <>
      <Navbar />
      <main style={{ padding: '3rem 0', background: 'var(--cream)', minHeight: '80vh' }}>
        <div className="section-inner" style={{ padding: '0 2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

          {/* ── Back + header ── */}
          <div>
            <a
              href="/admin/club-members"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                letterSpacing: '.05em',
                display: 'inline-block',
                marginBottom: '.75rem',
              }}
            >
              ← Back to Members
            </a>
            <span className="section-tag">Admin</span>
            <h1 className="section-h2">Member Statement</h1>
          </div>

          {/* ── Member info card ── */}
          <div style={{
            background: '#fff',
            border: '1px solid rgba(45,90,61,.12)',
            padding: '1.5rem 2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem',
          }}>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>
                Name
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', color: 'var(--green-deep)', fontWeight: 700 }}>
                {member.full_name}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>
                Membership No.
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: 'var(--green-deep)', fontWeight: 600 }}>
                {member.membership_number ?? '—'}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>
                Status
              </div>
              <span style={{
                display: 'inline-block',
                padding: '3px 10px',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                fontFamily: "'DM Sans', sans-serif",
                ...(member.status === 'active'
                  ? { background: 'rgba(45,90,61,.1)', color: '#2d5a3d' }
                  : member.status === 'probationary'
                  ? { background: 'rgba(201,168,76,.15)', color: '#7a6040' }
                  : { background: 'rgba(0,0,0,.06)', color: '#666' }),
              }}>
                {member.status}
              </span>
            </div>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>
                Statement Date
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-muted)' }}>
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <StatementPDFButton
              member={member}
              entries={entries}
            />
          </div>

          {/* ── Ledger table ── */}
          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-deep)', marginBottom: '1.25rem' }}>
              Transaction History
            </h2>

            {rows.length === 0 ? (
              <div style={{
                padding: '2rem',
                background: '#fff',
                border: '1px solid rgba(45,90,61,.1)',
                fontFamily: "'Libre Baskerville', serif",
                fontSize: '14px',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
              }}>
                No transactions recorded for this member.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: '680px' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Date</th>
                      <th style={thStyle}>Description</th>
                      <th style={thStyle}>Category</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Debit</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Credit</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((e, i) => {
                      const isCredit  = e.type === 'credit';
                      const rowBg     = i % 2 === 0 ? '#fff' : 'rgba(45,90,61,.02)';
                      const balOwing  = e.balance > 0.005;
                      const balCredit = e.balance < -0.005;

                      // Guest fee extra detail
                      const guestNames = e.guest_names ?? (e.metadata?.guest_names as string | undefined);
                      const dateOfPlay = e.metadata?.date_of_play as string | undefined;
                      const numGuests  = e.num_guests ?? (e.metadata?.num_guests as number | undefined);

                      return (
                        <tr key={e.id} style={{ background: rowBg }}>
                          <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                            {fmtDate(e.date)}
                          </td>
                          <td style={tdStyle}>
                            <div style={{ fontWeight: 500 }}>{e.description}</div>
                            {e.category === 'guest_fee' && (
                              <div style={{ marginTop: '3px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {guestNames && (
                                  <span style={{ fontSize: '11px', color: 'var(--green-deep)' }}>
                                    Guests: {guestNames}
                                  </span>
                                )}
                                {!guestNames && numGuests && (
                                  <span style={{ fontSize: '11px', color: 'var(--green-deep)' }}>
                                    {numGuests} guest{numGuests !== 1 ? 's' : ''}
                                  </span>
                                )}
                                {dateOfPlay && (
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    Date of play: {fmtDate(dateOfPlay)}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td style={tdStyle}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 7px',
                              background: 'rgba(45,90,61,.07)',
                              fontSize: '10px',
                              fontWeight: 600,
                              letterSpacing: '.06em',
                              textTransform: 'uppercase',
                              color: 'var(--green-deep)',
                              whiteSpace: 'nowrap',
                              fontFamily: "'DM Sans', sans-serif",
                            }}>
                              {CATEGORY_LABELS[e.category] ?? e.category}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap', color: '#c0392b' }}>
                            {!isCredit ? fmtGBP(e.amount) : ''}
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap', color: '#2e7d32' }}>
                            {isCredit ? fmtGBP(e.amount) : ''}
                          </td>
                          <td style={{
                            ...tdStyle,
                            textAlign: 'right',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            color: balOwing ? '#c0392b' : balCredit ? '#2e7d32' : 'var(--text-dark)',
                          }}>
                            {e.balance >= 0
                              ? fmtGBP(e.balance)
                              : `−${fmtGBP(e.balance)}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td
                        colSpan={5}
                        style={{
                          ...tdStyle,
                          padding: '14px 12px',
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 700,
                          fontSize: '13px',
                          color: 'var(--green-deep)',
                          borderTop: '2px solid rgba(45,90,61,.2)',
                          borderBottom: 'none',
                          background: 'rgba(45,90,61,.04)',
                          textAlign: 'right',
                        }}
                      >
                        Final Balance
                      </td>
                      <td style={{
                        ...tdStyle,
                        padding: '14px 12px',
                        fontWeight: 700,
                        fontSize: '14px',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                        borderTop: '2px solid rgba(45,90,61,.2)',
                        borderBottom: 'none',
                        background: 'rgba(45,90,61,.04)',
                        color: finalBalance > 0.005 ? '#c0392b' : finalBalance < -0.005 ? '#2e7d32' : 'var(--text-dark)',
                      }}>
                        {finalBalance >= 0
                          ? fmtGBP(finalBalance)
                          : `−${fmtGBP(finalBalance)}`}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={6} style={{
                        padding: '8px 12px',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        fontStyle: 'italic',
                        borderBottom: 'none',
                        background: 'rgba(45,90,61,.04)',
                        textAlign: 'right',
                      }}>
                        {finalBalance > 0.005
                          ? 'Amount outstanding'
                          : finalBalance < -0.005
                          ? 'Member has a credit on account'
                          : 'Account fully settled'}
                      </td>
                    </tr>
                  </tfoot>
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
