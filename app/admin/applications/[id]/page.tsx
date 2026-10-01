import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { redirect, notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ApplicationPDFButton } from './ApplicationPDFButton';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function saveApplication(formData: FormData) {
  'use server';
  await requireAdminSession();
  const id             = String(formData.get('id'));
  const status         = String(formData.get('status'))          || 'pending';
  const receivedDate   = String(formData.get('received_date'))   || null;
  const approvedDate   = String(formData.get('approved_date'))   || null;
  const membershipNum  = String(formData.get('membership_number')) || null;
  const signedBy       = String(formData.get('signed_by'))       || null;
  await supabaseAdmin.from('membership_applications').update({
    status,
    received_date:     receivedDate  || null,
    approved_date:     approvedDate  || null,
    membership_number: membershipNum || null,
    signed_by:         signedBy      || null,
  }).eq('id', id);
  revalidatePath(`/admin/applications/${id}`);
  revalidatePath('/admin/applications');
  redirect(`/admin/applications/${id}`);
}

const optima = "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const inputStyle = {
  padding: '.65rem .75rem',
  border: '1px solid rgba(45,90,61,.2)',
  fontFamily: optima,
  fontSize: '14px',
  width: '100%',
  boxSizing: 'border-box' as const,
  color: 'var(--green-deep)',
  background: '#fff',
};
const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: 'var(--gold)',
  display: 'block',
  marginBottom: '5px',
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '3px' }}>
        {label}
      </dt>
      <dd style={{ margin: 0, fontFamily: optima, fontSize: '14px', color: 'var(--green-deep)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
        {value || '—'}
      </dd>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: '17px',
      fontWeight: 700,
      color: 'var(--green-deep)',
      margin: '0 0 1rem',
      paddingBottom: '.5rem',
      borderBottom: '1px solid rgba(45,90,61,.12)',
    }}>
      {children}
    </h2>
  );
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  try { await requireAdminSession(); } catch { redirect('/login?redirect=/admin/applications'); }

  const { id } = await params;

  const { data: app } = await supabaseAdmin
    .from('membership_applications')
    .select('*')
    .eq('id', id)
    .single();

  if (!app) notFound();

  const statusColor = app.status === 'approved'
    ? { bg: 'rgba(45,200,80,.18)', color: '#b0ffc8' }
    : app.status === 'rejected'
    ? { bg: 'rgba(200,80,60,.22)', color: '#ffc4c4' }
    : { bg: 'rgba(168,149,96,.22)', color: 'var(--gold)' };

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginBottom: '.75rem', flexWrap: 'wrap' }}>
              <a href="/admin" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>Admin</a>
              <span style={{ color: 'rgba(245,240,232,.35)', fontSize: '13px' }}>›</span>
              <a href="/admin/applications" style={{ fontFamily: optima, fontSize: '13px', color: 'rgba(245,240,232,.65)', textDecoration: 'none' }}>Applications</a>
            </div>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)', margin: '0 0 .75rem' }}>
              {app.full_name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{
                padding: '3px 13px', borderRadius: '12px',
                fontSize: '11px', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
                background: statusColor.bg, color: statusColor.color,
              }}>
                {app.status ?? 'pending'}
              </span>
              <span style={{ fontFamily: optima, fontSize: '13px', color: 'rgba(245,240,232,.55)' }}>
                Submitted {new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="section-inner" style={{ padding: '3rem 2rem 5rem' }}>
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

            {/* Left: applicant details */}
            <div style={{ flex: '1 1 480px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>

              <section>
                <SectionHeading>Personal Details</SectionHeading>
                <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '.9rem 1.5rem', margin: 0 }}>
                  <Field label="Full Name"      value={app.full_name} />
                  <Field label="Date of Birth"  value={app.dob ?? ''} />
                  <Field label="Email"          value={app.email} />
                  <Field label="Phone"          value={app.phone ?? ''} />
                  <Field label="Address"        value={app.address ?? ''} />
                  <Field label="Rejoining"      value={
                    app.rejoining === 'yes'
                      ? `Yes${app.last_membership_date ? ` — last membership: ${app.last_membership_date}` : ''}`
                      : 'No'
                  } />
                </dl>
              </section>

              <section>
                <SectionHeading>Visit &amp; Proposer</SectionHeading>
                <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '.9rem 1.5rem', margin: 0 }}>
                  <Field label="Committee Members Met" value={app.committee_members ?? ''} />
                  <Field label="Visit Date"            value={app.visit_date ?? ''} />
                  <Field label="Proposer"              value={app.proposer_name ?? ''} />
                  <Field label="Seconder"              value={app.seconder_name ?? ''} />
                </dl>
              </section>

              <section>
                <SectionHeading>Confirmations</SectionHeading>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                  {([
                    ['Agreed to joining and annual fees',  app.agree_to_fees],
                    ['Agreed to annual membership fee',    app.agree_to_annual_fee],
                    ['Agreed to GDPR and privacy policy',  app.agree_to_gdpr],
                  ] as [string, boolean][]).map(([label, ticked]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', fontFamily: optima, fontSize: '14px', color: 'var(--green-deep)' }}>
                      <span style={{
                        flexShrink: 0, marginTop: '1px',
                        width: '17px', height: '17px', borderRadius: '3px',
                        background: ticked ? 'var(--green-deep)' : 'transparent',
                        border: ticked ? 'none' : '1.5px solid rgba(45,90,61,.35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '10px',
                      }}>
                        {ticked ? '✓' : ''}
                      </span>
                      {label}
                    </div>
                  ))}
                </div>
              </section>

              {app.signature && (
                <section>
                  <SectionHeading>Signature</SectionHeading>
                  <div style={{ border: '1px solid rgba(45,90,61,.18)', padding: '1rem', background: '#fff', maxWidth: '440px', borderRadius: '2px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={app.signature}
                      alt="Applicant signature"
                      style={{ width: '100%', maxHeight: '130px', objectFit: 'contain', display: 'block' }}
                    />
                  </div>
                </section>
              )}
            </div>

            {/* Right: committee panel + PDF */}
            <div style={{ flexShrink: 0, width: '300px', minWidth: '260px' }}>
              <div style={{
                background: 'rgba(45,90,61,.03)',
                border: '1px solid rgba(45,90,61,.15)',
                borderTop: '3px solid var(--green-deep)',
                padding: '1.5rem',
                position: 'sticky',
                top: '1.5rem',
              }}>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(45,90,61,.45)', marginBottom: '1.25rem' }}>
                  For Club Use Only
                </div>
                <form action={saveApplication} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input type="hidden" name="id" value={app.id} />
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select name="status" defaultValue={app.status ?? 'pending'} style={inputStyle}>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Received Date</label>
                    <input name="received_date" type="date" defaultValue={app.received_date ?? ''} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Approved Date</label>
                    <input name="approved_date" type="date" defaultValue={app.approved_date ?? ''} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Membership Number</label>
                    <input name="membership_number" type="text" defaultValue={app.membership_number ?? ''} placeholder="e.g. 247" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Signed By</label>
                    <input name="signed_by" type="text" defaultValue={app.signed_by ?? ''} placeholder="e.g. Club Secretary" style={inputStyle} />
                  </div>
                  <button className="btn" type="submit" style={{ marginTop: '.25rem' }}>Save</button>
                </form>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <ApplicationPDFButton app={{
                  id:                   app.id,
                  full_name:            app.full_name,
                  dob:                  app.dob ?? null,
                  email:                app.email,
                  phone:                app.phone ?? null,
                  address:              app.address ?? null,
                  rejoining:            app.rejoining ?? null,
                  last_membership_date: app.last_membership_date ?? null,
                  committee_members:    app.committee_members ?? null,
                  visit_date:           app.visit_date ?? null,
                  proposer_name:        app.proposer_name ?? null,
                  seconder_name:        app.seconder_name ?? null,
                  agree_to_fees:        app.agree_to_fees ?? false,
                  agree_to_annual_fee:  app.agree_to_annual_fee ?? false,
                  agree_to_gdpr:        app.agree_to_gdpr ?? false,
                  signature:            app.signature ?? null,
                  status:               app.status ?? 'pending',
                  received_date:        app.received_date ?? null,
                  approved_date:        app.approved_date ?? null,
                  membership_number:    app.membership_number ?? null,
                  signed_by:            app.signed_by ?? null,
                  created_at:           app.created_at,
                }} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
