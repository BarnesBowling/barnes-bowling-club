import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { DeleteMemberButton } from './DeleteMemberButton';

async function inviteMember(formData: FormData) {
  'use server';
  await requireAdminSession();

  const firstName = String(formData.get('first_name')).trim();
  const lastName  = String(formData.get('last_name')).trim();
  const email     = String(formData.get('email')).trim().toLowerCase();

  if (!firstName || !lastName || !email) {
    redirect('/admin/members?error=Please+fill+in+all+fields');
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://barnesbowling.com';
  const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: `${firstName} ${lastName}` },
    redirectTo: `${siteUrl}/auth/callback`,
  });

  if (error) {
    redirect(`/admin/members?error=${encodeURIComponent(error.message)}`);
  }

  await supabaseAdmin.from('member_balances').upsert(
    {
      member_email:    email,
      membership_fee:  0,
      guest_fee:       0,
      manser_fee:      0,
      wrong_bias_fee:  0,
      event_fee:       0,
    },
    { onConflict: 'member_email', ignoreDuplicates: true }
  );

  redirect('/admin/members?success=invited');
}

async function resendInvite(formData: FormData) {
  'use server';
  await requireAdminSession();

  const email   = String(formData.get('email'));
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://barnesbowling.com';

  const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/callback`,
  });

  if (error) {
    redirect(`/admin/members?error=${encodeURIComponent(error.message)}`);
  }
  redirect('/admin/members?success=resent');
}

async function removeMember(formData: FormData) {
  'use server';
  await requireAdminSession();

  const userId = String(formData.get('user_id'));
  const email  = String(formData.get('email'));

  await supabaseAdmin.auth.admin.deleteUser(userId);
  await supabaseAdmin.from('member_balances').delete().eq('member_email', email);

  redirect('/admin/members?success=removed');
}

export default async function MembersAdmin({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  try { await requireAdminSession(); } catch { redirect('/login?redirect=/admin/members'); }

  const params = await searchParams;
  const successMsg = params.success;
  const errorMsg   = params.error;

  const { data: { users = [] } } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  const members = [...users].sort((a, b) => {
    const aActive = !!a.email_confirmed_at;
    const bActive = !!b.email_confirmed_at;
    if (aActive !== bActive) return aActive ? 1 : -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const inputStyle = {
    padding: '.65rem .75rem',
    border: '1px solid rgba(45,90,61,.2)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    color: 'var(--text-dark)',
    background: 'white',
    width: '100%',
    boxSizing: 'border-box' as const,
    outline: 'none',
  };

  const labelStyle = {
    fontSize: '10px',
    fontWeight: 600 as const,
    letterSpacing: '.12em',
    textTransform: 'uppercase' as const,
    color: 'var(--gold)',
    display: 'block' as const,
    marginBottom: '6px',
  };

  return (
    <>
      <Navbar />
      <main style={{ padding: '3rem 0', background: 'var(--cream)', minHeight: '80vh' }}>
        <div className="section-inner" style={{ padding: '0 2rem', display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>

          {/* Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '.5rem' }}>
              <a href="/admin" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '.05em' }}>
                ← Admin
              </a>
            </div>
            <span className="section-tag">Admin</span>
            <h1 className="section-h2">Member management</h1>
            <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', color: 'var(--text-muted)', marginTop: '.5rem' }}>
              Invite new members and manage existing accounts.
            </p>
          </div>

          {/* Status banners */}
          {successMsg && (
            <div style={{
              padding: '1rem 1.25rem',
              background: 'rgba(45,90,61,.07)',
              border: '1px solid rgba(45,90,61,.2)',
              borderLeft: '4px solid var(--green-deep)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: 'var(--green-deep)',
              fontWeight: 500,
            }}>
              {successMsg === 'invited' && 'Invitation sent — the member will receive an email to set their password.'}
              {successMsg === 'resent'  && 'Invitation resent successfully.'}
              {successMsg === 'removed' && 'Member account removed.'}
            </div>
          )}
          {errorMsg && (
            <div style={{
              padding: '1rem 1.25rem',
              background: 'rgba(192,57,43,.06)',
              border: '1px solid rgba(192,57,43,.2)',
              borderLeft: '4px solid #c0392b',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: '#c0392b',
            }}>
              {decodeURIComponent(errorMsg)}
            </div>
          )}

          {/* ── Invite form ── */}
          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--green-deep)', marginBottom: '1.5rem' }}>
              Invite a new member
            </h2>
            <form
              action={inviteMember}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                maxWidth: '560px',
                background: 'white',
                padding: '2rem',
                border: '1px solid rgba(45,90,61,.12)',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>First name</label>
                  <input name="first_name" required style={inputStyle} autoComplete="off" />
                </div>
                <div>
                  <label style={labelStyle}>Last name</label>
                  <input name="last_name" required style={inputStyle} autoComplete="off" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email address</label>
                <input name="email" type="email" required style={inputStyle} autoComplete="off" />
              </div>
              <div style={{ paddingTop: '.25rem' }}>
                <button
                  className="btn-gold"
                  style={{ padding: '10px 24px', fontSize: '12px' }}
                >
                  Send Invitation →
                </button>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)', marginTop: '.75rem', lineHeight: 1.6 }}>
                  The member will receive an email with a link to set their password. A <code style={{ fontFamily: 'monospace' }}>member_balances</code> record will be created automatically.
                </p>
              </div>
            </form>
          </section>

          {/* ── Members table ── */}
          <section style={{ paddingBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', color: 'var(--green-deep)', margin: 0 }}>
                All members
              </h2>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-muted)' }}>
                {members.length} account{members.length !== 1 ? 's' : ''}
                {' · '}
                {members.filter(u => !u.email_confirmed_at).length} pending
              </span>
            </div>

            {members.length === 0 ? (
              <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No member accounts yet.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans', sans-serif" }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(45,90,61,.15)' }}>
                      {['Name', 'Email', 'Status', 'Date invited', 'Actions'].map(h => (
                        <th key={h} style={{
                          padding: '10px 14px',
                          textAlign: 'left',
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '.12em',
                          textTransform: 'uppercase',
                          color: 'var(--text-muted)',
                          whiteSpace: 'nowrap',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((u) => {
                      const isActive  = !!u.email_confirmed_at;
                      const name      = (u.user_metadata?.full_name as string | undefined) ?? '—';
                      const invited   = new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(45,90,61,.07)' }}>

                          {/* Name */}
                          <td style={{ padding: '13px 14px', fontSize: '14px', color: 'var(--text-dark)', fontWeight: 500 }}>
                            {name}
                          </td>

                          {/* Email */}
                          <td style={{ padding: '13px 14px', fontSize: '13px', color: 'var(--text-muted)' }}>
                            {u.email ?? '—'}
                          </td>

                          {/* Status */}
                          <td style={{ padding: '13px 14px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 10px',
                              fontSize: '10px',
                              fontWeight: 600,
                              letterSpacing: '.08em',
                              textTransform: 'uppercase',
                              borderRadius: '2px',
                              background: isActive ? 'rgba(74,158,106,.12)' : 'rgba(201,168,76,.12)',
                              color:      isActive ? '#2d8a4e'              : 'var(--gold)',
                            }}>
                              {isActive ? 'Active' : 'Pending'}
                            </span>
                          </td>

                          {/* Date invited */}
                          <td style={{ padding: '13px 14px', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {invited}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '13px 14px' }}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>

                              {/* Resend invite — only for pending */}
                              {!isActive && u.email && (
                                <form action={resendInvite}>
                                  <input type="hidden" name="email" value={u.email} />
                                  <button
                                    type="submit"
                                    style={{
                                      padding: '4px 11px',
                                      background: 'none',
                                      border: '1px solid rgba(45,90,61,.3)',
                                      color: 'var(--green-mid)',
                                      fontFamily: "'DM Sans', sans-serif",
                                      fontSize: '11px',
                                      fontWeight: 500,
                                      letterSpacing: '.04em',
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    Resend invite
                                  </button>
                                </form>
                              )}

                              {/* Remove — client component for confirm dialog */}
                              <DeleteMemberButton
                                action={removeMember}
                                userId={u.id}
                                email={u.email ?? ''}
                                name={name}
                              />

                            </div>
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
