'use client';

import { useState, useEffect } from 'react';
import { saveName, saveMobile, saveAddress, saveEmergencyContact, saveEmail, changePassword } from './actions';
import Link from 'next/link';

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

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: 14, height: 14, display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

// ── Design tokens ─────────────────────────────────────────────────────────────

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
  transition: 'background .15s',
};

const cancelBtnStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '9px 20px',
  background: 'none',
  color: 'rgba(27,59,38,.6)',
  border: '1px solid rgba(27,59,38,.2)',
  borderRadius: '4px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

const pencilBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '3px 5px',
  color: GOLD,
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  opacity: 0.8,
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

const displayVal: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '14px',
  color: '#1a2e1f',
  lineHeight: 1.5,
};

const displayEmpty: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '14px',
  color: 'rgba(27,59,38,.4)',
  fontStyle: 'italic',
};

// ── Shared layout ─────────────────────────────────────────────────────────────

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

function EditActions({ onSave, onCancel, pending }: { onSave: () => void; onCancel: () => void; pending: boolean }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
      <button type="button" onClick={onSave} disabled={pending}
        style={{ ...saveBtn, opacity: pending ? .7 : 1, cursor: pending ? 'default' : 'pointer' }}>
        {pending ? 'Saving…' : 'Save'}
      </button>
      <button type="button" onClick={onCancel} style={cancelBtnStyle}>Cancel</button>
    </div>
  );
}

// ── Interfaces ────────────────────────────────────────────────────────────────

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

interface LedgerBalance {
  debits: number;
  credits: number;
  balance: number;
}

interface Props {
  email: string;
  memberId: string | null;
  memberName: string;
  profile: Profile | null;
  balance: Balance | null;
  photoIdFilename?: string | null;
  ledgerBalance: LedgerBalance;
}

// ── Inline-edit sections ──────────────────────────────────────────────────────

function NameSection({ profile, onNameChange }: {
  profile: Profile | null;
  onNameChange?: (firstName: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle]         = useState(profile?.title      ?? '');
  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName]   = useState(profile?.last_name  ?? '');
  const [saved, setSaved] = useState({
    title:     profile?.title      ?? '',
    firstName: profile?.first_name ?? '',
    lastName:  profile?.last_name  ?? '',
  });
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  const displayName = [saved.title, saved.firstName, saved.lastName].filter(Boolean).join(' ');

  async function handleSave() {
    if (!firstName.trim() || !lastName.trim()) {
      setStatus({ ok: false, text: 'First and last name are required.' });
      return;
    }
    setPending(true);
    setStatus(null);
    const fd = new FormData();
    fd.set('title', title);
    fd.set('first_name', firstName.trim());
    fd.set('last_name', lastName.trim());
    const result = await saveName(null, fd);
    setPending(false);
    if (result?.error) {
      setStatus({ ok: false, text: result.error });
    } else {
      const next = { title, firstName: firstName.trim(), lastName: lastName.trim() };
      setSaved(next);
      onNameChange?.(firstName.trim());
      setStatus({ ok: true, text: 'Name updated.' });
      setTimeout(() => { setEditing(false); setStatus(null); }, 800);
    }
  }

  function handleCancel() {
    setTitle(saved.title);
    setFirstName(saved.firstName);
    setLastName(saved.lastName);
    setEditing(false);
    setStatus(null);
  }

  if (!editing) {
    return (
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={labelStyle}>Full Name</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '2px' }}>
          <span style={displayName ? displayVal : displayEmpty}>{displayName || 'Not provided'}</span>
          <button type="button" onClick={() => setEditing(true)} style={pencilBtnStyle} title="Edit name">
            <PencilIcon />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>Title</label>
        <div style={{ position: 'relative' }}>
          <select value={title} onChange={e => setTitle(e.target.value)} style={selectStyle}>
            <option value="">Select…</option>
            {['Mr','Mrs','Ms','Miss','Dr','Prof','Rev','Other'].map(t => <option key={t}>{t}</option>)}
          </select>
          <svg viewBox="0 0 24 24" fill="none" stroke="rgba(27,59,38,.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 13, height: 13, pointerEvents: 'none' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
      <div style={fieldGroup(2)}>
        <div>
          <label style={labelStyle}>First Name <span style={{ color: '#c0392b' }}>*</span></label>
          <input style={inputStyle} value={firstName} onChange={e => setFirstName(e.target.value)} autoComplete="given-name" />
        </div>
        <div>
          <label style={labelStyle}>Last Name <span style={{ color: '#c0392b' }}>*</span></label>
          <input style={inputStyle} value={lastName} onChange={e => setLastName(e.target.value)} autoComplete="family-name" />
        </div>
      </div>
      {status && <p style={statusMsg(status.ok)}>{status.text}</p>}
      <EditActions onSave={handleSave} onCancel={handleCancel} pending={pending} />
    </div>
  );
}

function MobileSection({ profile }: { profile: Profile | null }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(profile?.mobile ?? '');
  const [saved, setSaved] = useState(profile?.mobile ?? '');
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSave() {
    setPending(true);
    setStatus(null);
    const fd = new FormData();
    fd.set('mobile', value.trim());
    const result = await saveMobile(null, fd);
    setPending(false);
    if (result?.error) {
      setStatus({ ok: false, text: result.error });
    } else {
      setSaved(value.trim());
      setStatus({ ok: true, text: 'Mobile number updated.' });
      setTimeout(() => { setEditing(false); setStatus(null); }, 800);
    }
  }

  function handleCancel() {
    setValue(saved);
    setEditing(false);
    setStatus(null);
  }

  if (!editing) {
    return (
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={labelStyle}>Mobile</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '2px' }}>
          <span style={saved ? displayVal : displayEmpty}>{saved || 'Not provided'}</span>
          <button type="button" onClick={() => setEditing(true)} style={pencilBtnStyle} title="Edit mobile number">
            <PencilIcon />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={labelStyle}>Mobile</label>
      <input type="tel" style={inputStyle} value={value} onChange={e => setValue(e.target.value)} autoComplete="tel" />
      {status && <p style={statusMsg(status.ok)}>{status.text}</p>}
      <EditActions onSave={handleSave} onCancel={handleCancel} pending={pending} />
    </div>
  );
}

function AddressSection({ profile }: { profile: Profile | null }) {
  const [editing, setEditing] = useState(false);
  const [line1, setLine1]         = useState(profile?.address_line1 ?? '');
  const [line2, setLine2]         = useState(profile?.address_line2 ?? '');
  const [city, setCity]           = useState(profile?.city          ?? '');
  const [postcode, setPostcode]   = useState(profile?.postcode      ?? '');
  const [saved, setSaved] = useState({
    line1:    profile?.address_line1 ?? '',
    line2:    profile?.address_line2 ?? '',
    city:     profile?.city          ?? '',
    postcode: profile?.postcode      ?? '',
  });
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  const displayAddress = [saved.line1, saved.line2, saved.city, saved.postcode].filter(Boolean).join(', ');

  async function handleSave() {
    setPending(true);
    setStatus(null);
    const fd = new FormData();
    fd.set('address_line1', line1);
    fd.set('address_line2', line2);
    fd.set('city', city);
    fd.set('postcode', postcode);
    const result = await saveAddress(null, fd);
    setPending(false);
    if (result?.error) {
      setStatus({ ok: false, text: result.error });
    } else {
      setSaved({ line1: line1.trim(), line2: line2.trim(), city: city.trim(), postcode: postcode.trim() });
      setStatus({ ok: true, text: 'Address updated.' });
      setTimeout(() => { setEditing(false); setStatus(null); }, 800);
    }
  }

  function handleCancel() {
    setLine1(saved.line1);
    setLine2(saved.line2);
    setCity(saved.city);
    setPostcode(saved.postcode);
    setEditing(false);
    setStatus(null);
  }

  if (!editing) {
    return (
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={labelStyle}>Home Address</div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', paddingTop: '2px' }}>
          <span style={displayAddress ? displayVal : displayEmpty}>{displayAddress || 'Not provided'}</span>
          <button type="button" onClick={() => setEditing(true)} style={pencilBtnStyle} title="Edit home address">
            <PencilIcon />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>Address Line 1</label>
        <input style={inputStyle} value={line1} onChange={e => setLine1(e.target.value)} autoComplete="address-line1" />
      </div>
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>Address Line 2</label>
        <input style={inputStyle} value={line2} onChange={e => setLine2(e.target.value)} autoComplete="address-line2" />
      </div>
      <div style={fieldGroup(2)}>
        <div>
          <label style={labelStyle}>City</label>
          <input style={inputStyle} value={city} onChange={e => setCity(e.target.value)} autoComplete="address-level2" />
        </div>
        <div>
          <label style={labelStyle}>Postcode</label>
          <input style={inputStyle} value={postcode} onChange={e => setPostcode(e.target.value)} autoComplete="postal-code" />
        </div>
      </div>
      {status && <p style={statusMsg(status.ok)}>{status.text}</p>}
      <EditActions onSave={handleSave} onCancel={handleCancel} pending={pending} />
    </div>
  );
}

function ECSection({ profile }: { profile: Profile | null }) {
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(profile?.emergency_contact_name         ?? '');
  const [rel, setRel]         = useState(profile?.emergency_contact_relationship ?? '');
  const [phone, setPhone]     = useState(profile?.emergency_contact_phone        ?? '');
  const [ecEmail, setEcEmail] = useState(profile?.emergency_contact_email        ?? '');
  const [saved, setSaved] = useState({
    name:    profile?.emergency_contact_name         ?? '',
    rel:     profile?.emergency_contact_relationship ?? '',
    phone:   profile?.emergency_contact_phone        ?? '',
    email:   profile?.emergency_contact_email        ?? '',
  });
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  const displayLine1 = saved.name
    ? (saved.rel ? `${saved.name} (${saved.rel})` : saved.name)
    : '';
  const displayLine2 = [saved.phone, saved.email].filter(Boolean).join(' · ');
  const hasData = displayLine1 || displayLine2;

  async function handleSave() {
    setPending(true);
    setStatus(null);
    const fd = new FormData();
    fd.set('ec_name', name);
    fd.set('ec_relationship', rel);
    fd.set('ec_phone', phone);
    fd.set('ec_email', ecEmail);
    const result = await saveEmergencyContact(null, fd);
    setPending(false);
    if (result?.error) {
      setStatus({ ok: false, text: result.error });
    } else {
      setSaved({ name: name.trim(), rel: rel.trim(), phone: phone.trim(), email: ecEmail.trim() });
      setStatus({ ok: true, text: 'Emergency contact updated.' });
      setTimeout(() => { setEditing(false); setStatus(null); }, 800);
    }
  }

  function handleCancel() {
    setName(saved.name);
    setRel(saved.rel);
    setPhone(saved.phone);
    setEcEmail(saved.email);
    setEditing(false);
    setStatus(null);
  }

  if (!editing) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <div>
            {hasData ? (
              <>
                {displayLine1 && <div style={displayVal}>{displayLine1}</div>}
                {displayLine2 && (
                  <div style={{ ...displayVal, color: 'rgba(27,59,38,.6)', fontSize: '13px', marginTop: '2px' }}>
                    {displayLine2}
                  </div>
                )}
              </>
            ) : (
              <span style={displayEmpty}>Not provided</span>
            )}
          </div>
          <button type="button" onClick={() => setEditing(true)} style={pencilBtnStyle} title="Edit emergency contact">
            <PencilIcon />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={fieldGroup(2)}>
        <div>
          <label style={labelStyle}>Contact Name</label>
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Relationship</label>
          <input style={inputStyle} value={rel} onChange={e => setRel(e.target.value)} placeholder="e.g. Spouse, Sibling" />
        </div>
      </div>
      <div style={fieldGroup(2)}>
        <div>
          <label style={labelStyle}>Phone Number</label>
          <input type="tel" style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" style={inputStyle} value={ecEmail} onChange={e => setEcEmail(e.target.value)} />
        </div>
      </div>
      {status && <p style={statusMsg(status.ok)}>{status.text}</p>}
      <EditActions onSave={handleSave} onCancel={handleCancel} pending={pending} />
    </div>
  );
}

function EmailSection({ initialEmail, onEmailChange }: {
  initialEmail: string;
  onEmailChange?: (email: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialEmail);
  const [saved, setSaved] = useState(initialEmail);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSave() {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) { setStatus({ ok: false, text: 'Email address is required.' }); return; }
    setPending(true);
    setStatus(null);
    const fd = new FormData();
    fd.set('email', trimmed);
    const result = await saveEmail(null, fd);
    setPending(false);
    if (result?.error) {
      setStatus({ ok: false, text: result.error });
    } else {
      setSaved(trimmed);
      onEmailChange?.(trimmed);
      setStatus({ ok: true, text: 'Email updated. Use your new address to log in next time.' });
      setTimeout(() => { setEditing(false); setStatus(null); }, 1500);
    }
  }

  function handleCancel() {
    setValue(saved);
    setEditing(false);
    setStatus(null);
  }

  if (!editing) {
    return (
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={labelStyle}>Email Address</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '2px' }}>
          <span style={displayVal}>{saved}</span>
          <button type="button" onClick={() => setEditing(true)} style={pencilBtnStyle} title="Edit email address">
            <PencilIcon />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={labelStyle}>Email Address</label>
      <input
        type="email"
        style={inputStyle}
        value={value}
        onChange={e => setValue(e.target.value)}
        autoComplete="email"
      />
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(27,59,38,.5)', marginTop: '6px' }}>
        This is also your login email. You will need to use the new address next time you sign in.
      </p>
      {status && <p style={statusMsg(status.ok)}>{status.text}</p>}
      <EditActions onSave={handleSave} onCancel={handleCancel} pending={pending} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function MyDetailsClient({ email, memberId, memberName, profile, balance, photoIdFilename, ledgerBalance }: Props) {
  const [openSection, setOpenSection] = useState<string | null>('details');

  const [pwCurrent,   setPwCurrent]   = useState('');
  const [pwNew,       setPwNew]       = useState('');
  const [pwConfirm,   setPwConfirm]   = useState('');
  const [pwMsg,       setPwMsg]       = useState<{ ok: boolean; text: string } | null>(null);
  const [pwPending,   setPwPending]   = useState(false);

  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [bookings, setBookings] = useState<BookedMatch[]>([]);

  const initialFirstName = profile?.first_name || memberName.split(' ')[0] || 'Member';
  const [liveFirstName, setLiveFirstName] = useState(initialFirstName);
  const [liveEmail, setLiveEmail] = useState(email);

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
      const fd = new FormData();
      fd.append('current_password', pwCurrent);
      fd.append('new_password', pwNew);
      const result = await changePassword(null, fd);
      if (result?.error) throw new Error(result.error);
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

  return (
    <div>
      {/* Profile header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem', paddingBottom: '2.5rem', borderBottom: '1px solid #e0e0e0' }}>
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

        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 400,
          color: '#1b3b26',
          margin: '0 0 0.5rem',
          letterSpacing: '-.01em',
        }}>
          Welcome, {liveFirstName}
        </h2>

        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '14px',
          fontWeight: 700,
          letterSpacing: '.16em',
          textTransform: 'uppercase',
          marginBottom: '0.35rem',
        }}>
          <span style={{ color: GOLD }}>Member No. </span>
          <span style={{ color: 'var(--green-deep)' }}>{memberId ?? '—'}</span>
        </div>

        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          color: 'rgba(27,59,38,.45)',
        }}>
          {liveEmail}
        </div>
      </div>

      {/* Member Photo ID */}
      {photoIdFilename && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '2.5rem',
          padding: '1.5rem',
          background: 'rgba(45,90,61,.02)',
          border: '1px solid rgba(45,90,61,.08)',
        }}>
          <div style={{
            width: 105,
            aspectRatio: '35/45',
            overflow: 'hidden',
            border: `2px solid ${GOLD}`,
            flexShrink: 0,
          }}>
            <img
              src={`/member-photos/${photoIdFilename}`}
              alt="Your member photo ID"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
            />
          </div>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            color: GOLD,
            marginTop: '0.75rem',
          }}>
            Your Member Photo ID
          </div>
        </div>
      )}

      {/* Account Balance Card — read-only, no edit affordance */}
      {(() => {
        const bal = ledgerBalance.balance;
        const isZero   = Math.abs(bal) < 0.005;
        const isOwed   = bal >  0.005;
        const color    = isOwed ? '#c0392b' : '#2e7d32';
        const label    = isZero ? 'Account Clear' : isOwed ? 'Outstanding' : 'In Credit';
        const amount   = isZero ? '£0.00' : `£${Math.abs(bal).toFixed(2)}`;

        return (
          <Link
            href="/members/account"
            style={{ textDecoration: 'none', display: 'block', marginBottom: '2rem' }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                background: '#fff',
                border: `1.5px solid ${isOwed ? 'rgba(192,57,43,.25)' : 'rgba(45,90,61,.15)'}`,
                cursor: 'pointer',
                transition: 'border-color .15s, box-shadow .15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 10px rgba(0,0,0,.07)';
                (e.currentTarget as HTMLDivElement).style.borderColor = isOwed ? 'rgba(192,57,43,.5)' : 'rgba(45,90,61,.35)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                (e.currentTarget as HTMLDivElement).style.borderColor = isOwed ? 'rgba(192,57,43,.25)' : 'rgba(45,90,61,.15)';
              }}
            >
              <div>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(27,59,38,.45)',
                  marginBottom: '6px',
                }}>
                  {isZero ? 'Account Balance' : isOwed ? 'Outstanding Balance' : 'Account Balance'}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '24px',
                    fontWeight: 500,
                    color,
                    letterSpacing: '-.01em',
                  }}>
                    {amount}
                  </span>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '.1em',
                    textTransform: 'uppercase',
                    color,
                    opacity: 0.85,
                  }}>
                    {label}
                  </span>
                </div>
                {!isZero && (
                  <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '11px',
                    color: 'rgba(27,59,38,.4)',
                    marginTop: '4px',
                  }}>
                    Debits {fmtGBP(ledgerBalance.debits)} · Payments {fmtGBP(ledgerBalance.credits)}
                  </div>
                )}
              </div>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '.05em',
                color: GOLD,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                View Statement
                <span style={{ fontSize: '14px' }}>→</span>
              </div>
            </div>
          </Link>
        );
      })()}

      {/* ── Accordion 1: Member Details ── */}
      <AccordionRow title="Member Details" open={openSection === 'details'} onToggle={() => toggle('details')}>
        <NameSection profile={profile} onNameChange={setLiveFirstName} />
        <EmailSection initialEmail={email} onEmailChange={setLiveEmail} />
        <MobileSection profile={profile} />
        <AddressSection profile={profile} />
      </AccordionRow>

      {/* ── Accordion 2: Emergency Contact ── */}
      <AccordionRow title="Emergency Contact" open={openSection === 'emergency'} onToggle={() => toggle('emergency')}>
        <ECSection profile={profile} />
      </AccordionRow>

      {/* ── Accordion 3: Account Statement ── */}
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

      {/* ── Accordion 4: Email Preferences ── */}
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

      {/* ── Accordion 5: My Bookings ── */}
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

      {/* ── Change Password ── */}
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
