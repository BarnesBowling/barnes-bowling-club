import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { redirect, notFound } from 'next/navigation';
import { requireViewerSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { StatementEntry } from './StatementPDFButton';
import { EmailStatementButton } from './EmailStatementButton';
import { PAYMENT_INFO } from './paymentInfo';
import { StatementTransactionsClient } from './StatementTransactionsClient';

export default async function MemberStatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let session: { email: string; role: 'admin' | 'viewer' };
  try {
    session = await requireViewerSession();
  } catch {
    redirect(`/login?redirect=/admin/members/${id}/statement`);
  }

  const backHref = session.role === 'viewer' ? '/admin/statements' : '/admin';
  const backLabel = session.role === 'viewer' ? '← Back to Statements' : '← Admin panel';

  const [{ data: member, error: memberError }, { data: rawEntries }] = await Promise.all([
    supabaseAdmin
      .from('club_members')
      .select('full_name, membership_number, status, email, statement_last_emailed_at')
      .eq('id', id)
      .single(),
    supabaseAdmin
      .from('member_ledger')
      .select('id, date, description, category, amount, type, guest_names, num_guests, cost_per_guest, metadata')
      .eq('member_id', id)
      .order('date', { ascending: true })
      .order('created_at', { ascending: true }),
  ]);

  if (memberError) {
    if (memberError.code === 'PGRST116') notFound();
    throw new Error(`Failed to load member statement: ${memberError.message}`);
  }
  if (!member) notFound();

  const entries: StatementEntry[] = (rawEntries ?? []).map(e => ({
    ...e,
    amount: Number(e.amount),
    type: e.type as 'debit' | 'credit',
    metadata: e.metadata as Record<string, unknown> | null,
  }));

  return (
    <>
      <Navbar />
      <main style={{ padding: '3rem 0', background: 'var(--cream)', minHeight: '80vh' }}>
        <div className="section-inner" style={{ padding: '0 2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div>
            <a
              href={backHref}
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
              {backLabel}
            </a>
            <span className="section-tag">{session.role === 'viewer' ? 'Statements' : 'Admin'}</span>
            <h1 className="section-h2">Member Statement</h1>
          </div>

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

          <div>
            <EmailStatementButton
              memberId={id}
              hasEmail={!!member.email}
              initialLastEmailed={(member as { statement_last_emailed_at?: string | null }).statement_last_emailed_at ?? null}
            />
          </div>

          <StatementTransactionsClient
            entries={entries}
            memberId={id}
            memberName={member.full_name}
            member={member}
            isAdmin={session.role === 'admin'}
          />

          {/* ── How to Pay ─────────────────────────────────────────────── */}
          <section style={{
            background: '#fff',
            border: '1px solid rgba(45,90,61,.12)',
            padding: '1.75rem 2rem',
          }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-deep)', marginBottom: '1.5rem', marginTop: 0 }}>
              How to Pay
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>

              {/* Bank transfer */}
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 700, color: 'var(--green-deep)', marginBottom: '0.6rem' }}>
                  Paying by bank transfer
                </div>
                <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', lineHeight: 1.7, color: 'var(--text-mid)', margin: '0 0 0.9rem' }}>
                  If you would prefer to pay by bank transfer, please use:
                </p>
                <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', alignItems: 'baseline' }}>
                  {[
                    ['Account name', PAYMENT_INFO.accountName],
                    ['Sort code', PAYMENT_INFO.sortCode],
                    ['Account number', PAYMENT_INFO.accountNumber],
                    ['Reference', member.membership_number ?? '—'],
                  ].map(([label, value]) => (
                    <>
                      <dt key={`dt-${label}`} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--gold)', whiteSpace: 'nowrap' }}>{label}</dt>
                      <dd key={`dd-${label}`} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600, color: 'var(--green-deep)', margin: 0 }}>{value}</dd>
                    </>
                  ))}
                </dl>
                <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '12px', lineHeight: 1.7, color: 'var(--text-muted)', margin: '0.9rem 0 0', fontStyle: 'italic' }}>
                  Please remember to email the club at{' '}
                  <a href={`mailto:${PAYMENT_INFO.email}`} style={{ color: 'var(--green-mid)' }}>{PAYMENT_INFO.email}</a>{' '}
                  to let us know your payment has been sent.
                </p>
              </div>

              {/* Card */}
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 700, color: 'var(--green-deep)', marginBottom: '0.6rem' }}>
                  Paying by card
                </div>
                <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '13px', lineHeight: 1.7, color: 'var(--text-mid)', margin: '0 0 0.9rem' }}>
                  Alternatively, you can pay by credit or debit card through our secure online payment portal.
                </p>
                <a
                  href={PAYMENT_INFO.paymentPageUrl}
                  style={{
                    display: 'inline-block',
                    padding: '10px 22px',
                    background: 'var(--gold)',
                    color: '#fff',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                  }}
                >
                  Pay Online →
                </a>
              </div>

            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
