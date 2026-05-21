'use client';

import { useState, useEffect, useActionState } from 'react';

// ── Bookings (localStorage) ───────────────────────────────────────────────────

interface BookedMatch {
  competition: string;
  player1: string;
  player2: string;
  player3: string | null;
  player4: string | null;
  date: string;
  time: string;
}

function loadBookings(): BookedMatch[] {
  try { return JSON.parse(localStorage.getItem('booked_matches') ?? '[]'); }
  catch { return []; }
}

function cancelBooking(date: string, time: string): void {
  try {
    const all = JSON.parse(localStorage.getItem('booked_matches') ?? '[]') as BookedMatch[];
    localStorage.setItem('booked_matches', JSON.stringify(all.filter(m => !(m.date === date && m.time === time))));
    const fixtures = JSON.parse(localStorage.getItem('bbc_fixture_bookings') ?? '[]') as Array<{ date: string; time_slot: string }>;
    localStorage.setItem('bbc_fixture_bookings', JSON.stringify(fixtures.filter(f => !(f.date === date && f.time_slot === time))));
  } catch {}
}

const DEFAULT_PREFS = { newsletters: true, events: true, bookings: true };
import { savePersonalDetails, saveEmergencyContact } from './actions';
import { createClient } from '@/lib/supabase/client';

const GOLD = '#A89560';

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: 'rgba(27,59,38,.5)',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 13px',
  border: '1px solid rgba(45,90,61,.2)',
  background: '#fff',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '14px',
  color: '#1a2e1f',
  outline: 'none',
  boxSizing: 'border-box',
};

const readOnlyStyle: React.CSSProperties = {
  ...inputStyle,
  background: 'rgba(45,90,61,.04)',
  color: 'rgba(27,59,38,.55)',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  WebkitAppearance: 'none',
  paddingRight: '32px',
  cursor: 'pointer',
};

const saveBtn: React.CSSProperties = {
  display: 'inline-block',
  padding: '9px 24px',
  background: GOLD,
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  marginTop: '1.25rem',
  transition: 'background .15s',
};

const fieldGroup = (cols = 1): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${cols}, 1fr)`,
  gap: '1rem',
  marginBottom: '1rem',
});

const statusMsg = (ok: boolean): React.CSSProperties => ({
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  color: ok ? '#2e7d32' : '#c0392b',
  marginTop: '0.5rem',
});

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ width: 18, height: 18, flexShrink: 0, transition: 'transform .25s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function AccordionRow({
  title, open, onToggle, children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ borderBottom: '1px solid #e0e0e0' }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '1.25rem 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{
          fontFamily: "'Optima', 'Playfair Display', serif",
          fontSize: '16px',
          fontWeight: 400,
          color: '#1a2e1f',
          letterSpacing: '.02em',
        }}>
          {title}
        </span>
        <Chevron open={open} />
      </button>
      {open && (
        <div style={{ paddingBottom: '2rem' }}>
          {children}
        </div>
      )}
    </div>
  );
}

interface Profile {
  title?: string;
  first_name?: string;
  last_name?: string;
  mobile?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postcode?: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_phone?: string;
  emergency_contact_email?: string;
}

interface Balance {
  membershipFee: number;
  guestFee: number;
  manserFee: number;
  wrongBiasFee: number;
  eventFee: number;
}

interface Props {
  email: string;
  memberId: string;
  memberName: string;
  profile: Profile | null;
  balance: Balance | null;
}

export function MyDetailsClient({ email, memberId, memberName, profile, balance }: Props) {
  const [openSection, setOpenSection] = useState<string | null>('details');

  const [detailsState, detailsAction] = useActionState(savePersonalDetails, null);
  const [ecState,      ecAction]      = useActionState(saveEmergencyContact, null);

  const [pwCurrent,   setPwCurrent]   = useState('');
  const [pwNew,       setPwNew]       = useState('');
  const [pwConfirm,   setPwConfirm]   = useState('');
  const [pwMsg,       setPwMsg]       = useState<{ ok: boolean; text: string } | null>(null);
  const [pwPending,   setPwPending]   = useState(false);

  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [bookings, setBookings] = useState<BookedMatch[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bbc_email_prefs');
      if (stored) setPrefs(JSON.parse(stored));
    } catch {}
    setBookings(loadBookings());
  }, []);

  function savePrefs() {
    try { localStorage.setItem('bbc_email_prefs', JSON.stringify(prefs)); } catch {}
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 2000);
  }

  function toggle(key: string) {
    setOpenSection(o => o === key ? null : key);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (pwNew.length < 8) { setPwMsg({ ok: false, text: 'New password must be at least 8 characters.' }); return; }
    if (pwNew !== pwConfirm) { setPwMsg({ ok: false, text: 'Passwords do not match.' }); return; }
    setPwPending(true);
    try {
      const supabase = createClient();
      // Re-authenticate with current password first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('No authenticated session found. Please log in again.');
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: user.email, password: pwCurrent });
      if (signInErr) throw new Error('Current password is incorrect.');
      const { error: updateErr } = await supabase.auth.updateUser({ password: pwNew });
      if (updateErr) throw new Error(updateErr.message);
      setPwMsg({ ok: true, text: 'Password changed successfully.' });
      setPwCurrent(''); setPwNew(''); setPwConfirm('');
    } catch (err: unknown) {
      setPwMsg({ ok: false, text: err instanceof Error ? err.message : 'Failed to change password.' });
    } finally {
      setPwPending(false);
    }
  }

  const total = balance
    ? balance.membershipFee + balance.guestFee + balance.manserFee + balance.wrongBiasFee + balance.eventFee
    : 0;

  const fmtGBP = (n: number) => `£${n.toFixed(2)}`;

  const firstName = profile?.first_name || memberName.split(' ')[0] || 'Member';

  return (
    <div>
      {/* Profile header — LRC style */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', paddingBottom: '2.5rem', borderBottom: '1px solid #e0e0e0' }}>
        {/* Avatar */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: '#f5f0e8',
          border: `3px solid ${GOLD}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
          flexShrink: 0,
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#1b3b26" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 38, height: 38 }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>

        {/* Welcome heading */}
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 400,
          color: '#1b3b26',
          margin: '0 0 0.5rem',
          letterSpacing: '-.01em',
        }}>
          Welcome, {firstName}
        </h2>

        {/* Member number */}
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '14px',
          fontWeight: 700,
          letterSpacing: '.16em',
          textTransform: 'uppercase',
          marginBottom: '0.35rem',
        }}>
          <span style={{ color: GOLD }}>Member No. </span>
          <span style={{ color: 'var(--green-deep)' }}>{memberId}</span>
        </div>

        {/* Email */}
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          color: 'rgba(27,59,38,.45)',
        }}>
          {email}
        </div>
      </div>

      {/* ── Accordion 1: Member Details ── */}
      <AccordionRow title="Member Details" open={openSection === 'details'} onToggle={() => toggle('details')}>
        <form action={detailsAction}>
          <div style={fieldGroup()}>
            <div>
              <label style={labelStyle}>Title</label>
              <div style={{ position: 'relative' }}>
                <select name="title" defaultValue={profile?.title ?? ''} style={selectStyle}>
                  <option value="">Select…</option>
                  {['Mr','Mrs','Ms','Miss','Dr','Prof','Rev','Other'].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(27,59,38,.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, pointerEvents: 'none' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          <div style={fieldGroup(2)}>
            <div>
              <label style={labelStyle}>First Name <span style={{ color: '#c0392b' }}>*</span></label>
              <input name="first_name" required style={inputStyle} defaultValue={profile?.first_name ?? ''} autoComplete="given-name" />
            </div>
            <div>
              <label style={labelStyle}>Last Name <span style={{ color: '#c0392b' }}>*</span></label>
              <input name="last_name" required style={inputStyle} defaultValue={profile?.last_name ?? ''} autoComplete="family-name" />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Email Address</label>
            <input style={readOnlyStyle} readOnly value={email} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Mobile</label>
            <input name="mobile" type="tel" style={inputStyle} defaultValue={profile?.mobile ?? ''} autoComplete="tel" />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Address Line 1</label>
            <input name="address_line1" style={inputStyle} defaultValue={profile?.address_line1 ?? ''} autoComplete="address-line1" />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Address Line 2</label>
            <input name="address_line2" style={inputStyle} defaultValue={profile?.address_line2 ?? ''} autoComplete="address-line2" />
          </div>

          <div style={fieldGroup(2)}>
            <div>
              <label style={labelStyle}>City</label>
              <input name="city" style={inputStyle} defaultValue={profile?.city ?? ''} autoComplete="address-level2" />
            </div>
            <div>
              <label style={labelStyle}>Postcode</label>
              <input name="postcode" style={inputStyle} defaultValue={profile?.postcode ?? ''} autoComplete="postal-code" />
            </div>
          </div>

          {detailsState?.error   && <p style={statusMsg(false)}>{detailsState.error}</p>}
          {detailsState?.success && <p style={statusMsg(true)}>Details saved successfully.</p>}

          <button type="submit" style={saveBtn}>Save Details</button>
        </form>
      </AccordionRow>

      {/* ── Accordion 2: Emergency Contact ── */}
      <AccordionRow title="Emergency Contact" open={openSection === 'emergency'} onToggle={() => toggle('emergency')}>
        <form action={ecAction}>
          <div style={fieldGroup(2)}>
            <div>
              <label style={labelStyle}>Contact Name</label>
              <input name="ec_name" style={inputStyle} defaultValue={profile?.emergency_contact_name ?? ''} />
            </div>
            <div>
              <label style={labelStyle}>Relationship</label>
              <input name="ec_relationship" style={inputStyle} defaultValue={profile?.emergency_contact_relationship ?? ''} placeholder="e.g. Spouse, Sibling" />
            </div>
          </div>
          <div style={fieldGroup(2)}>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input name="ec_phone" type="tel" style={inputStyle} defaultValue={profile?.emergency_contact_phone ?? ''} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input name="ec_email" type="email" style={inputStyle} defaultValue={profile?.emergency_contact_email ?? ''} />
            </div>
          </div>

          {ecState?.error   && <p style={statusMsg(false)}>{ecState.error}</p>}
          {ecState?.success && <p style={statusMsg(true)}>Emergency contact saved successfully.</p>}

          <button type="submit" style={saveBtn}>Save Contact</button>
        </form>
      </AccordionRow>

      {/* ── Accordion 4: Account Statement ── */}
      <AccordionRow title="Account Statement" open={openSection === 'statement'} onToggle={() => toggle('statement')}>
        {balance ? (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', marginBottom: '1.5rem' }}>
              <tbody>
                {[
                  { label: 'Membership Fee',   value: balance.membershipFee },
                  { label: 'Guest Fee',        value: balance.guestFee },
                  { label: 'Manser Entry Fee', value: balance.manserFee },
                  { label: 'Wrong Bias Fee',   value: balance.wrongBiasFee },
                  { label: 'Event Fee',        value: balance.eventFee },
                ].map(({ label, value }) => (
                  <tr key={label} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 0', color: 'rgba(27,59,38,.7)' }}>{label}</td>
                    <td style={{ padding: '10px 0', textAlign: 'right', color: value > 0 ? '#c0392b' : 'rgba(27,59,38,.45)' }}>
                      {fmtGBP(value)}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td style={{ padding: '14px 0 6px', fontWeight: 700, color: '#1a2e1f', fontFamily: "'Playfair Display', serif", fontSize: '15px' }}>
                    Total Outstanding
                  </td>
                  <td style={{ padding: '14px 0 6px', textAlign: 'right', fontWeight: 700, color: total > 0 ? '#c0392b' : '#2e7d32', fontSize: '16px' }}>
                    {fmtGBP(total)}
                  </td>
                </tr>
              </tbody>
            </table>

            {total > 0 && (
              <a
                href="/members/payment"
                style={{
                  ...saveBtn,
                  display: 'inline-block',
                  textDecoration: 'none',
                  marginTop: 0,
                }}
              >
                Make a Payment
              </a>
            )}
          </div>
        ) : (
          <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', color: 'rgba(27,59,38,.55)', fontStyle: 'italic' }}>
            No balance record found. Contact the club if you believe this is incorrect.
          </p>
        )}
      </AccordionRow>

      {/* ── Accordion 5: Email Preferences ── */}
      <AccordionRow title="Email Preferences" open={openSection === 'prefs'} onToggle={() => toggle('prefs')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {([
            { key: 'newsletters', label: 'Club newsletters & updates' },
            { key: 'events',      label: 'Events & social notices' },
            { key: 'bookings',    label: 'Booking confirmations & reminders' },
          ] as { key: keyof typeof DEFAULT_PREFS; label: string }[]).map(({ key, label }) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#1a2e1f' }}>
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={e => setPrefs(p => ({ ...p, [key]: e.target.checked }))}
                style={{ width: 16, height: 16, accentColor: GOLD, cursor: 'pointer', flexShrink: 0 }}
              />
              {label}
            </label>
          ))}
        </div>
        <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button type="button" onClick={savePrefs} style={saveBtn}>Save Preferences</button>
          {prefsSaved && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#2e7d32' }}>Saved</span>}
        </div>
      </AccordionRow>

      {/* ── Accordion 6: My Bookings ── */}
      <AccordionRow title="My Bookings" open={openSection === 'bookings'} onToggle={() => toggle('bookings')}>
        {bookings.length === 0 ? (
          <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', color: 'rgba(27,59,38,.55)', fontStyle: 'italic' }}>
            You have no upcoming bookings.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {[...bookings]
              .sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.time.localeCompare(b.time))
              .map((bk, i) => {
                const players = [bk.player1, bk.player2, bk.player3, bk.player4].filter(Boolean);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', padding: '1rem 1.25rem', background: '#fff', border: '1px solid rgba(45,90,61,.12)' }}>
                    <div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 700, color: '#1a2e1f', marginBottom: '2px' }}>
                        {new Date(bk.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })} · {bk.time}
                      </div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(27,59,38,.55)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                        {bk.competition}
                      </div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(27,59,38,.7)' }}>
                        {players.join(', ')}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        cancelBooking(bk.date, bk.time);
                        setBookings(loadBookings());
                      }}
                      style={{ flexShrink: 0, background: 'none', border: '1px solid rgba(180,0,0,.25)', color: '#a00', fontFamily: "'DM Sans', sans-serif", fontSize: '11px', padding: '4px 10px', cursor: 'pointer', letterSpacing: '.05em' }}
                    >
                      Cancel
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </AccordionRow>

      {/* ── Change Password ─────────────────────────────────────────────── */}
      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(45,90,61,.12)' }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 500, color: '#1a2e1f', margin: '0 0 1.5rem' }}>
          Change Password
        </h2>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
          <div>
            <label style={labelStyle}>Current Password</label>
            <input type="password" required value={pwCurrent} onChange={e => setPwCurrent(e.target.value)} style={inputStyle} placeholder="Your current password" />
          </div>
          <div>
            <label style={labelStyle}>New Password</label>
            <input type="password" required value={pwNew} onChange={e => setPwNew(e.target.value)} style={inputStyle} placeholder="Minimum 8 characters" />
          </div>
          <div>
            <label style={labelStyle}>Confirm New Password</label>
            <input type="password" required value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} style={inputStyle} placeholder="Repeat new password" />
          </div>
          {pwMsg && (
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: pwMsg.ok ? '#2e7d32' : '#c0392b', padding: '10px 14px', background: pwMsg.ok ? 'rgba(46,125,50,.06)' : 'rgba(192,57,43,.06)', borderLeft: `3px solid ${pwMsg.ok ? '#2e7d32' : '#c0392b'}` }}>
              {pwMsg.text}
            </div>
          )}
          <div>
            <button type="submit" disabled={pwPending} style={{ ...saveBtn, opacity: pwPending ? .7 : 1, cursor: pwPending ? 'default' : 'pointer' }}>
              {pwPending ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Sign out ── */}
      <div style={{ paddingTop: '2rem', borderTop: '1px solid #e0e0e0', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
        <a
          href="/api/member-logout"
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'rgba(27,59,38,.5)', textDecoration: 'none', letterSpacing: '.06em', textTransform: 'uppercase' }}
        >
          Sign out
        </a>
      </div>

    </div>
  );
}
