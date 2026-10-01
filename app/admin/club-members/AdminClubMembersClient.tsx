'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { addClubMember, updateClubMember, deleteClubMember, inviteClubMember, checkMemberHasLedger, toggleMemberKey, setMemberCard, updateMemberPhone } from './actions';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ClubMember = {
  id: string;
  full_name: string;
  email: string | null;
  membership_number: string | null;
  handicap: number;
  status: 'active' | 'inactive' | 'probationary';
  joined_date: string | null;
  notes: string | null;
  created_at: string;
  auth_user_id: string | null;
  photo_id_filename?: string | null;
  has_key?: boolean | null;
  card_issued?: boolean | null;
  card_issued_date?: string | null;
  phone?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  postcode?: string | null;
};

type MemberPayload = {
  full_name: string;
  email: string;
  membership_number: string;
  handicap: number;
  status: string;
  joined_date: string;
  notes: string;
};

type RosterFilter = 'no-photo' | 'has-key' | 'card-not-issued' | 'no-mobile' | null;

type Props = {
  initialMembers: ClubMember[];
  initialPhotoUrls: Record<string, string>;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function hasValidPhoto(m: ClubMember): boolean {
  return !!(m.photo_id_filename && m.photo_id_filename !== 'test.jpeg');
}

function surnameKey(name: string): string {
  const parts = name.trim().split(' ');
  return parts.slice(1).join(' ') || parts[0];
}

function sortByName(arr: ClubMember[]): ClubMember[] {
  return [...arr].sort((a, b) => surnameKey(a.full_name).localeCompare(surnameKey(b.full_name)));
}

function fmtHcp(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function generateMembershipNumber(name: string, existingMembers: ClubMember[]): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return '';
  const firstInitial = parts[0][0].toUpperCase();
  const surnameInitial = parts[parts.length - 1][0].toUpperCase();
  let maxNum = 0;
  for (const m of existingMembers) {
    if (!m.membership_number) continue;
    const digits = m.membership_number.replace(/\D/g, '');
    if (digits) maxNum = Math.max(maxNum, parseInt(digits, 10));
  }
  return `BBC${firstInitial}${surnameInitial}${maxNum + 1}`;
}

function normalizeUKMobile(raw: string): string | null {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0044')) digits = '0' + digits.slice(4);
  else if (digits.startsWith('44')) digits = '0' + digits.slice(2);
  if (digits.length !== 11 || !digits.startsWith('07')) return null;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

function resizeImage(file: File, maxWidth: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const ratio = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('no canvas context')); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('toBlob failed')),
        'image/jpeg', 0.85,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image load failed')); };
    img.src = url;
  });
}

const EMPTY: MemberPayload = {
  full_name: '', email: '', membership_number: '', handicap: 0,
  status: 'active', joined_date: '', notes: '',
};

// ── Shared styles ─────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: '#fff',
  boxShadow: '3px 3px 0 rgba(45,90,61,.08), 0 4px 20px rgba(0,0,0,.04)',
  padding: '2rem 2rem 2.5rem',
  marginBottom: '2rem',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--green-mid)',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  height: '40px',
  padding: '0 10px',
  border: '1.5px solid rgba(45,90,61,.2)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '14px',
  color: 'var(--green-deep)',
  background: '#fff',
  width: '100%',
  boxSizing: 'border-box',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 22px',
  height: '44px',
  background: 'var(--green-mid)',
  color: '#fff',
  border: 'none',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

const btnSecondary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0 12px',
  height: '32px',
  background: '#fff',
  color: 'var(--green-mid)',
  border: '1.5px solid var(--green-mid)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '.07em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

const btnDanger: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0 12px',
  height: '32px',
  background: '#c00',
  color: '#fff',
  border: 'none',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  borderBottom: '2px solid rgba(45,90,61,.15)',
  whiteSpace: 'nowrap',
  verticalAlign: 'top',
};

const tdStyle: React.CSSProperties = {
  padding: '11px 12px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  color: 'var(--text-muted)',
  borderBottom: '1px solid rgba(45,90,61,.07)',
  verticalAlign: 'middle',
};

// ── MobileCell ────────────────────────────────────────────────────────────────

function MobileCell({ memberId, initialPhone, onUpdate }: {
  memberId: string;
  initialPhone: string | null;
  onUpdate: (id: string, phone: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(initialPhone ?? '');
  const [displayVal, setDisplayVal] = useState(initialPhone ?? '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const didCommitRef = useRef(false);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  async function commit() {
    if (saving) return;
    const trimmed = inputVal.trim();
    if (trimmed === displayVal || (!trimmed && !displayVal)) {
      setEditing(false);
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const result = await updateMemberPhone(memberId, trimmed);
      if (result.error) { setErr(result.error); return; }
      const normalized = trimmed ? (normalizeUKMobile(trimmed) ?? trimmed) : '';
      setDisplayVal(normalized);
      setInputVal(normalized);
      onUpdate(memberId, normalized || null);
      setEditing(false);
    } catch { setErr('Save failed'); }
    finally { setSaving(false); }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); didCommitRef.current = true; commit(); }
    if (e.key === 'Escape') { didCommitRef.current = true; setInputVal(displayVal); setEditing(false); setErr(null); }
  }

  function handleBlur() {
    if (didCommitRef.current) { didCommitRef.current = false; return; }
    commit();
  }

  if (!editing) {
    return (
      <div onClick={() => setEditing(true)} title="Click to edit mobile number" style={{ cursor: 'text', minWidth: '110px' }}>
        {displayVal
          ? <a href={`tel:${displayVal}`} onClick={e => e.stopPropagation()} style={{ color: 'var(--green-deep)', textDecoration: 'none', whiteSpace: 'nowrap' }}>{displayVal}</a>
          : <span style={{ color: 'rgba(45,90,61,.25)', fontStyle: 'italic', fontSize: '12px' }}>—</span>}
      </div>
    );
  }

  return (
    <div style={{ minWidth: '150px' }}>
      <input
        ref={inputRef}
        type="tel"
        value={inputVal}
        onChange={e => { setInputVal(e.target.value); setErr(null); }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={saving}
        placeholder="07xxx xxxxxx"
        style={{ ...inputStyle, height: '28px', fontSize: '12px', width: '150px' }}
      />
      {err && <div style={{ fontSize: '10px', color: '#c62828', marginTop: '2px', maxWidth: '150px', lineHeight: 1.3 }}>{err}</div>}
    </div>
  );
}

// ── RosterPhotoCell ───────────────────────────────────────────────────────────

function RosterPhotoCell({ memberId, photoUrl, onUploaded }: {
  memberId: string;
  photoUrl: string | null;
  onUploaded: (id: string, url: string, path: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(photoUrl);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const resized = await resizeImage(file, 600);
      const fd = new FormData();
      fd.set('id', memberId);
      fd.set('photo', new File([resized], 'photo.jpg', { type: 'image/jpeg' }));
      const res = await fetch('/api/admin/member-photo', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const json = await res.json() as { signedUrl?: string; path?: string };
      const url = json.signedUrl ?? '';
      const path = json.path ?? '';
      setCurrentUrl(url || null);
      onUploaded(memberId, url, path);
    } catch { /* silent — keep existing photo */ }
    finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div title={currentUrl ? 'Replace photo' : 'Upload photo'}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
        disabled={busy}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          overflow: 'hidden',
          border: currentUrl ? '2px solid rgba(45,90,61,.25)' : '2px dashed rgba(45,90,61,.2)',
          background: '#f0f0ef',
          cursor: busy ? 'wait' : 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'border-color .15s',
        }}
      >
        {busy ? (
          <span style={{ fontSize: '10px', color: '#999' }}>…</span>
        ) : currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )}
      </button>
    </div>
  );
}

// ── KeyCell ───────────────────────────────────────────────────────────────────

function KeyCell({ memberId, initialValue, onToggle }: {
  memberId: string;
  initialValue: boolean;
  onToggle: (id: string, value: boolean) => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [saving, startTransition] = useTransition();

  function handleClick() {
    const next = !value;
    startTransition(async () => {
      try {
        await toggleMemberKey(memberId, next);
        setValue(next);
        onToggle(memberId, next);
      } catch { /* silent */ }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={saving}
      title={value ? 'Has key — click to remove' : 'No key — click to assign'}
      style={{
        background: 'none',
        border: 'none',
        cursor: saving ? 'wait' : 'pointer',
        padding: '2px 6px',
        opacity: saving ? .55 : 1,
        fontSize: '16px',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ color: value ? '#2e7d32' : '#c62828', fontWeight: 700 }}>
        {value ? '✓' : '✗'}
      </span>
    </button>
  );
}

// ── CardCell ──────────────────────────────────────────────────────────────────

function CardCell({ memberId, initialIssued, initialDate, onUpdate }: {
  memberId: string;
  initialIssued: boolean;
  initialDate: string | null;
  onUpdate: (id: string, issued: boolean, date: string | null) => void;
}) {
  const [issued, setIssued] = useState(initialIssued);
  const [date, setDate] = useState(initialDate ?? '');
  const [editingDate, setEditingDate] = useState(false);
  const [saving, startTransition] = useTransition();

  function handleTickClick() {
    if (issued) {
      startTransition(async () => {
        try {
          await setMemberCard(memberId, false, null);
          setIssued(false);
          setDate('');
          onUpdate(memberId, false, null);
        } catch { /* silent */ }
      });
    } else {
      const today = new Date().toISOString().slice(0, 10);
      startTransition(async () => {
        try {
          await setMemberCard(memberId, true, today);
          setIssued(true);
          setDate(today);
          onUpdate(memberId, true, today);
        } catch { /* silent */ }
      });
    }
  }

  function handleDateBlur() {
    setEditingDate(false);
    startTransition(async () => {
      try {
        await setMemberCard(memberId, issued, date || null);
        onUpdate(memberId, issued, date || null);
      } catch { /* silent */ }
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px', minWidth: '70px' }}>
      <button
        onClick={handleTickClick}
        disabled={saving}
        title={issued ? 'Card issued — click to clear' : 'Card not issued — click to mark issued'}
        style={{
          background: 'none',
          border: 'none',
          cursor: saving ? 'wait' : 'pointer',
          padding: '2px 6px',
          opacity: saving ? .55 : 1,
          fontSize: '16px',
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span style={{ color: issued ? '#2e7d32' : '#c62828', fontWeight: 700 }}>
          {issued ? '✓' : '✗'}
        </span>
      </button>
      {issued && (
        editingDate ? (
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            onBlur={handleDateBlur}
            autoFocus
            style={{ ...inputStyle, height: '26px', fontSize: '11px', width: '130px' }}
          />
        ) : (
          <span
            onClick={() => setEditingDate(true)}
            title="Click to edit date"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer', paddingLeft: '6px', whiteSpace: 'nowrap' }}
          >
            {date ? fmtDate(date) : <em style={{ opacity: .6 }}>No date</em>}
          </span>
        )
      )}
    </div>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────

function StatusBadge({ status, invited, hasAuth }: { status: string; invited?: boolean; hasAuth?: boolean }) {
  if (hasAuth) return (
    <span style={{ display: 'inline-flex', gap: '4px', flexWrap: 'wrap' }}>
      <span style={{ display: 'inline-block', padding: '3px 10px', fontSize: '10px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", background: 'rgba(27,94,32,.15)', color: '#1b5e20' }}>joined</span>
      <span style={{ display: 'inline-block', padding: '3px 10px', fontSize: '10px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", ...(status === 'active' ? { background: 'rgba(45,90,61,.1)', color: '#2d5a3d' } : status === 'probationary' ? { background: 'rgba(201,168,76,.15)', color: '#7a6040' } : { background: 'rgba(0,0,0,.06)', color: '#666' }) }}>{status}</span>
    </span>
  );
  if (invited) return (
    <span style={{ display: 'inline-flex', gap: '4px', flexWrap: 'wrap' }}>
      <span style={{ display: 'inline-block', padding: '3px 10px', fontSize: '10px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", background: 'rgba(2,119,189,.12)', color: '#0277bd' }}>invited</span>
      <span style={{ display: 'inline-block', padding: '3px 10px', fontSize: '10px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", ...(status === 'active' ? { background: 'rgba(45,90,61,.1)', color: '#2d5a3d' } : status === 'probationary' ? { background: 'rgba(201,168,76,.15)', color: '#7a6040' } : { background: 'rgba(0,0,0,.06)', color: '#666' }) }}>{status}</span>
    </span>
  );
  const s: Record<string, React.CSSProperties> = {
    active:       { background: 'rgba(45,90,61,.1)',    color: '#2d5a3d' },
    inactive:     { background: 'rgba(0,0,0,.06)',      color: '#666' },
    probationary: { background: 'rgba(201,168,76,.15)', color: '#7a6040' },
  };
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', fontSize: '10px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", ...(s[status] ?? s.active) }}>
      {status}
    </span>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 500, color: 'var(--green-deep)', margin: '0 0 0.4rem' }}>
        {title}
      </h2>
      <div style={{ width: '40px', height: '2px', background: 'var(--gold)' }} />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AdminClubMembersClient({ initialMembers, initialPhotoUrls }: Props) {
  const [members, setMembers] = useState<ClubMember[]>(sortByName(initialMembers));
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>(initialPhotoUrls);
  const [search, setSearch] = useState('');
  const [rosterFilter, setRosterFilter] = useState<RosterFilter>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<MemberPayload>(EMPTY);
  const [addForm, setAddForm] = useState<MemberPayload>(EMPTY);
  const [addMemberNumManual, setAddMemberNumManual] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [addPending, startAddTransition] = useTransition();
  const [editPending, startEditTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [invitePending, setInvitePending] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<Set<string>>(
    new Set(initialMembers.filter(m => m.auth_user_id).map(m => m.id))
  );
  const [sortKey, setSortKey] = useState<'name' | 'membership_number'>('membership_number');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    if (msg?.ok) {
      const t = setTimeout(() => setMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  const activeCount    = members.filter(m => m.status === 'active').length;
  const noPhotoCount   = members.filter(m => !hasValidPhoto(m)).length;
  const hasKeyCount    = members.filter(m => m.has_key === true).length;
  const cardIssuedCount = members.filter(m => m.card_issued === true).length;
  const noMobileCount  = members.filter(m => !m.phone?.trim()).length;

  function toggleFilter(f: RosterFilter) {
    setRosterFilter(prev => prev === f ? null : f);
  }

  const baseFiltered = (() => {
    let list = search.trim()
      ? members.filter(m =>
          m.full_name.toLowerCase().includes(search.toLowerCase()) ||
          (m.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
          (m.membership_number ?? '').toLowerCase().includes(search.toLowerCase())
        )
      : members;

    if (rosterFilter === 'no-photo')             list = list.filter(m => !hasValidPhoto(m));
    else if (rosterFilter === 'has-key')         list = list.filter(m => m.has_key === true);
    else if (rosterFilter === 'card-not-issued') list = list.filter(m => !m.card_issued);
    else if (rosterFilter === 'no-mobile')       list = list.filter(m => !m.phone?.trim());

    return list;
  })();

  const filtered = [...baseFiltered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'name') {
      cmp = surnameKey(a.full_name).localeCompare(surnameKey(b.full_name));
      if (cmp === 0) cmp = a.full_name.localeCompare(b.full_name);
    } else {
      const aDigits = a.membership_number?.replace(/\D/g, '') ?? '';
      const bDigits = b.membership_number?.replace(/\D/g, '') ?? '';
      if (!aDigits && !bDigits) cmp = 0;
      else if (!aDigits) cmp = 1;
      else if (!bDigits) cmp = -1;
      else cmp = parseInt(aDigits, 10) - parseInt(bDigits, 10);
    }
    return sortAsc ? cmp : -cmp;
  });

  function startEdit(m: ClubMember) {
    setEditId(m.id);
    setEditForm({
      full_name: m.full_name,
      email: m.email ?? '',
      membership_number: m.membership_number ?? '',
      handicap: m.handicap,
      status: m.status,
      joined_date: m.joined_date ?? '',
      notes: m.notes ?? '',
    });
  }

  function cancelEdit() {
    setEditId(null);
    setEditForm(EMPTY);
  }

  function handleHeaderSort(key: 'name' | 'membership_number') {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(true); }
  }

  // ── Add ───────────────────────────────────────────────────────────────────

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    startAddTransition(async () => {
      try {
        const newId = await addClubMember(addForm);
        const newMember: ClubMember = {
          id: newId,
          full_name: addForm.full_name.trim(),
          email: addForm.email.trim() || null,
          membership_number: addForm.membership_number.trim() || null,
          handicap: addForm.handicap,
          status: addForm.status as ClubMember['status'],
          joined_date: addForm.joined_date || null,
          notes: addForm.notes.trim() || null,
          created_at: new Date().toISOString(),
          auth_user_id: null,
          has_key: false,
          card_issued: false,
          card_issued_date: null,
        };
        setMembers(prev => sortByName([...prev, newMember]));
        setAddForm(EMPTY);
        setAddMemberNumManual(false);
        setMsg({ ok: true, text: `${newMember.full_name} added to the roster.` });
      } catch (err: unknown) {
        setMsg({ ok: false, text: err instanceof Error ? err.message : 'Failed to add member.' });
      }
    });
  }

  // ── Save edit ─────────────────────────────────────────────────────────────

  function handleSaveEdit(id: string) {
    startEditTransition(async () => {
      try {
        await updateClubMember(id, editForm);
        setMembers(prev =>
          sortByName(prev.map(m => m.id !== id ? m : {
            ...m,
            full_name: editForm.full_name.trim(),
            email: editForm.email.trim() || null,
            membership_number: editForm.membership_number.trim() || null,
            handicap: editForm.handicap,
            status: editForm.status as ClubMember['status'],
            joined_date: editForm.joined_date || null,
            notes: editForm.notes.trim() || null,
          }))
        );
        setEditId(null);
        setMsg({ ok: true, text: `${editForm.full_name} updated.` });
      } catch (err: unknown) {
        setMsg({ ok: false, text: err instanceof Error ? err.message : 'Failed to update member.' });
      }
    });
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async function handleDelete(id: string, name: string) {
    let hasLedger = false;
    try { hasLedger = await checkMemberHasLedger(id); } catch { /* ignore */ }

    const ledgerWarning = hasLedger
      ? 'This member has transaction records. Deleting will also remove their account history.\n\n'
      : '';
    if (!confirm(`${ledgerWarning}Are you sure you want to delete ${name}? This cannot be undone.`)) return;

    startDeleteTransition(async () => {
      try {
        await deleteClubMember(id);
        setMembers(prev => prev.filter(m => m.id !== id));
        if (editId === id) setEditId(null);
        setMsg({ ok: true, text: `${name} removed from the roster.` });
      } catch (err: unknown) {
        setMsg({ ok: false, text: err instanceof Error ? err.message : 'Failed to delete member.' });
      }
    });
  }

  // ── Invite ────────────────────────────────────────────────────────────────

  async function handleInvite(m: ClubMember) {
    if (!m.email) {
      setMsg({ ok: false, text: `${m.full_name} has no email address. Add one before inviting.` });
      return;
    }
    if (!confirm(`Send a magic link invite to ${m.email}?`)) return;
    setInvitePending(m.id);
    try {
      await inviteClubMember(m.id, m.email);
      setInvitedIds(prev => new Set([...prev, m.id]));
      setMsg({ ok: true, text: `Invite sent to ${m.email}.` });
    } catch (err: unknown) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Failed to send invite.' });
    } finally {
      setInvitePending(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const COLS = 13; // Memb. No. | Full Name | Email | Phone | Status | Joined | Address | EC Name | EC Phone | Photo | Key | Card | Actions

  const filterChipBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 12px',
    border: '1.5px solid rgba(45,90,61,.2)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '.07em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    background: '#fff',
    color: 'var(--text-muted)',
    transition: 'background .12s, color .12s, border-color .12s',
  };

  const filterChipActive: React.CSSProperties = {
    ...filterChipBase,
    background: 'var(--green-deep)',
    color: '#fff',
    borderColor: 'var(--green-deep)',
  };

  return (
    <div>

      {/* Global status banner */}
      {msg && (
        <div style={{
          padding: '12px 16px',
          background: msg.ok ? 'rgba(45,90,61,.08)' : 'rgba(192,0,0,.06)',
          borderLeft: `4px solid ${msg.ok ? 'var(--green-mid)' : '#c00'}`,
          color: msg.ok ? 'var(--green-deep)' : '#900',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '14px',
          marginBottom: '1.5rem',
        }}>
          {msg.text}
        </div>
      )}

      {/* ── Add New Member ──────────────────────────────────────────────── */}
      <section style={card}>
        <SectionHeader title="Add New Member" />
        <form onSubmit={handleAdd} autoComplete="off">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Full Name *</label>
              <input
                required
                type="text"
                value={addForm.full_name}
                onChange={e => {
                  const newName = e.target.value;
                  setAddForm(f => ({
                    ...f,
                    full_name: newName,
                    ...(!addMemberNumManual && {
                      membership_number: generateMembershipNumber(newName, members),
                    }),
                  }));
                }}
                style={inputStyle}
                placeholder="e.g. Jane Smith"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={addForm.email}
                onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                style={inputStyle}
                placeholder="jane@example.com"
                autoComplete="new-email"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </div>
            <div>
              <label style={labelStyle}>Membership Number</label>
              <input
                type="text"
                value={addForm.membership_number}
                onChange={e => {
                  setAddMemberNumManual(true);
                  setAddForm(f => ({ ...f, membership_number: e.target.value }));
                }}
                style={inputStyle}
                placeholder={addForm.full_name.trim().split(/\s+/).length >= 2 ? 'Auto-generated from name' : 'e.g. BBCJS42'}
                autoComplete="off"
              />
              {!addMemberNumManual && addForm.membership_number && (
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'rgba(45,90,61,.5)', display: 'block', marginTop: '4px' }}>
                  Auto-generated — edit to override
                </span>
              )}
            </div>
            <div>
              <label style={labelStyle}>Handicap</label>
              <input
                type="number"
                min="-20"
                max="20"
                value={addForm.handicap}
                onChange={e => setAddForm(f => ({ ...f, handicap: Number(e.target.value) }))}
                style={inputStyle}
                autoComplete="off"
              />
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select
                value={addForm.status}
                onChange={e => setAddForm(f => ({ ...f, status: e.target.value }))}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="active">Active</option>
                <option value="probationary">Probationary</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Joined Date</label>
              <input
                type="date"
                value={addForm.joined_date}
                onChange={e => setAddForm(f => ({ ...f, joined_date: e.target.value }))}
                style={inputStyle}
                autoComplete="off"
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Notes (optional)</label>
              <textarea
                value={addForm.notes}
                onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))}
                style={{ ...inputStyle, height: '72px', padding: '8px 10px' }}
                placeholder="Any relevant notes about this member"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
          </div>
          <button type="submit" style={{ ...btnPrimary, opacity: addPending ? .65 : 1 }} disabled={addPending}>
            {addPending ? 'Adding…' : 'Add Member'}
          </button>
        </form>
      </section>

      {/* ── Member List ─────────────────────────────────────────────────── */}
      <section style={card}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <SectionHeader title="Member Roster" />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-muted)' }}>
            {activeCount} active · {members.length} total · No mobile: {noMobileCount} · No photo: {noPhotoCount} · Keys: {hasKeyCount} · Cards issued: {cardIssuedCount}
          </span>
        </div>

        {/* Search + filters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem' }}>
          <input
            type="text"
            name="club_member_lookup"
            inputMode="search"
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="Search by name, email, or membership number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, height: '40px', maxWidth: '320px', flex: '1 1 200px' }}
          />
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => toggleFilter('no-mobile')}
              style={rosterFilter === 'no-mobile' ? filterChipActive : filterChipBase}
            >
              No mobile <span style={{ opacity: .7 }}>({noMobileCount})</span>
            </button>
            <button
              onClick={() => toggleFilter('no-photo')}
              style={rosterFilter === 'no-photo' ? filterChipActive : filterChipBase}
            >
              No photo <span style={{ opacity: .7 }}>({noPhotoCount})</span>
            </button>
            <button
              onClick={() => toggleFilter('has-key')}
              style={rosterFilter === 'has-key' ? filterChipActive : filterChipBase}
            >
              Has key <span style={{ opacity: .7 }}>({hasKeyCount})</span>
            </button>
            <button
              onClick={() => toggleFilter('card-not-issued')}
              style={rosterFilter === 'card-not-issued' ? filterChipActive : filterChipBase}
            >
              Card not issued <span style={{ opacity: .7 }}>({members.length - cardIssuedCount})</span>
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {search || rosterFilter ? 'No members match your search or filter.' : 'No members in the roster yet.'}
          </p>
        ) : (
          <div className="admin-members-table-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1300px' }}>
              <thead>
                <tr>
                  <th
                    onClick={() => handleHeaderSort('membership_number')}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(45,90,61,.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                    style={{ ...thStyle, cursor: 'pointer', userSelect: 'none', color: sortKey === 'membership_number' ? 'var(--green-deep)' : undefined }}
                  >
                    Memb. No.{sortKey === 'membership_number' ? (sortAsc ? ' ↑' : ' ↓') : ' ↕'}
                  </th>
                  <th
                    onClick={() => handleHeaderSort('name')}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(45,90,61,.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                    style={{ ...thStyle, cursor: 'pointer', userSelect: 'none', color: sortKey === 'name' ? 'var(--green-deep)' : undefined }}
                  >
                    Full Name{sortKey === 'name' ? (sortAsc ? ' ↑' : ' ↓') : ' ↕'}
                  </th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Mobile</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Joined</th>
                  <th style={thStyle}>Address</th>
                  <th style={thStyle}>Emergency Contact</th>
                  <th style={thStyle}>EC Phone</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>Photo</th>
                  <th style={{ ...thStyle, textAlign: 'center' }}>
                    <span title="Key (£10 deposit)">🗝</span>
                  </th>
                  <th style={{ ...thStyle, textAlign: 'left' }}>Card</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => {
                  const isEditing = editId === m.id;
                  const rowBg = i % 2 === 0 ? '#fff' : 'rgba(45,90,61,.025)';

                  if (isEditing) {
                    return (
                      <tr key={m.id}>
                        <td colSpan={COLS} style={{ padding: 0, background: 'rgba(45,90,61,.03)', borderBottom: '2px solid rgba(45,90,61,.18)', borderTop: '1px solid rgba(45,90,61,.12)' }}>
                          <div style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--green-deep)', marginBottom: '1rem' }}>
                              Editing: {m.full_name}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                              <div style={{ gridColumn: 'span 2' }}>
                                <label style={labelStyle}>Full Name</label>
                                <input
                                  type="text"
                                  value={editForm.full_name}
                                  onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                                  autoComplete="off"
                                  autoCorrect="off"
                                  spellCheck={false}
                                  style={{ ...inputStyle, height: '36px', fontSize: '13px' }}
                                />
                              </div>
                              <div style={{ gridColumn: 'span 2' }}>
                                <label style={labelStyle}>Email</label>
                                <input
                                  type="email"
                                  value={editForm.email}
                                  onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                                  autoComplete="new-email"
                                  style={{ ...inputStyle, height: '36px', fontSize: '13px' }}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Membership Number</label>
                                <input
                                  type="text"
                                  value={editForm.membership_number}
                                  onChange={e => setEditForm(f => ({ ...f, membership_number: e.target.value }))}
                                  autoComplete="off"
                                  style={{ ...inputStyle, height: '36px', fontSize: '13px' }}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Handicap</label>
                                <input
                                  type="number"
                                  min="-20"
                                  max="20"
                                  value={editForm.handicap}
                                  onChange={e => setEditForm(f => ({ ...f, handicap: Number(e.target.value) }))}
                                  style={{ ...inputStyle, height: '36px', fontSize: '13px', width: '80px' }}
                                />
                              </div>
                              <div>
                                <label style={labelStyle}>Status</label>
                                <select
                                  value={editForm.status}
                                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                                  style={{ ...inputStyle, height: '36px', fontSize: '13px', cursor: 'pointer' }}
                                >
                                  <option value="active">Active</option>
                                  <option value="probationary">Probationary</option>
                                  <option value="inactive">Inactive</option>
                                </select>
                              </div>
                              <div>
                                <label style={labelStyle}>Joined Date</label>
                                <input
                                  type="date"
                                  value={editForm.joined_date}
                                  onChange={e => setEditForm(f => ({ ...f, joined_date: e.target.value }))}
                                  style={{ ...inputStyle, height: '36px', fontSize: '13px', width: '150px' }}
                                />
                              </div>
                              <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Notes</label>
                                <textarea
                                  value={editForm.notes}
                                  onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                                  autoComplete="off"
                                  autoCorrect="off"
                                  spellCheck={false}
                                  style={{ ...inputStyle, height: '64px', padding: '8px 10px', resize: 'vertical' }}
                                  placeholder="Any relevant notes"
                                />
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleSaveEdit(m.id)}
                                disabled={editPending}
                                style={{ ...btnPrimary, height: '36px', padding: '0 18px', fontSize: '11px', opacity: editPending ? .65 : 1 }}
                              >
                                {editPending ? 'Saving…' : 'Save'}
                              </button>
                              <button onClick={cancelEdit} style={{ ...btnSecondary, height: '36px', padding: '0 14px' }}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={m.id} style={{ background: rowBg }}>
                      <td style={{ ...tdStyle, fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 500, color: 'var(--green-deep)', whiteSpace: 'nowrap' }}>
                        {m.membership_number || '—'}
                      </td>
                      <td style={{ ...tdStyle, fontSize: '14px', fontWeight: 500, color: 'var(--text-dark)', whiteSpace: 'nowrap' }}>
                        {m.full_name}
                      </td>
                      <td style={tdStyle}>
                        {m.email
                          ? <a href={`mailto:${m.email}`} style={{ color: 'var(--green-deep)', textDecoration: 'underline' }}>{m.email}</a>
                          : '—'}
                      </td>
                      <td style={{ ...tdStyle, padding: '8px 10px' }}>
                        <MobileCell
                          memberId={m.id}
                          initialPhone={m.phone ?? null}
                          onUpdate={(id, phone) => setMembers(prev => prev.map(x => x.id !== id ? x : { ...x, phone: phone ?? null }))}
                        />
                      </td>
                      <td style={tdStyle}>
                        <StatusBadge status={m.status} invited={invitedIds.has(m.id)} hasAuth={!!m.auth_user_id} />
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                        {fmtDate(m.joined_date)}
                      </td>
                      <td style={{ ...tdStyle, fontSize: '12px', lineHeight: 1.5 }}>
                        {(m.address_line1 || m.address_line2 || m.city || m.postcode) ? (
                          <div>
                            {m.address_line1 && <div>{m.address_line1}</div>}
                            {m.address_line2 && <div>{m.address_line2}</div>}
                            {(m.city || m.postcode) && (
                              <div>{[m.city, m.postcode].filter(Boolean).join(' ')}</div>
                            )}
                          </div>
                        ) : <span style={{ color: 'rgba(45,90,61,.3)' }}>—</span>}
                      </td>
                      <td style={tdStyle}>
                        {m.emergency_contact_name || <span style={{ color: 'rgba(45,90,61,.3)' }}>—</span>}
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                        {m.emergency_contact_phone
                          ? <a href={`tel:${m.emergency_contact_phone}`} style={{ color: 'var(--green-deep)', textDecoration: 'none' }}>{m.emergency_contact_phone}</a>
                          : <span style={{ color: 'rgba(45,90,61,.3)' }}>—</span>}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', padding: '8px' }}>
                        <RosterPhotoCell
                          memberId={m.id}
                          photoUrl={photoUrls[m.id] ?? null}
                          onUploaded={(id, url, path) => {
                            setPhotoUrls(prev => ({ ...prev, [id]: url }));
                            setMembers(prev => prev.map(x => x.id !== id ? x : { ...x, photo_id_filename: path }));
                          }}
                        />
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center', padding: '8px' }}>
                        <KeyCell
                          memberId={m.id}
                          initialValue={m.has_key ?? false}
                          onToggle={(id, val) => setMembers(prev => prev.map(x => x.id !== id ? x : { ...x, has_key: val }))}
                        />
                      </td>
                      <td style={{ ...tdStyle, padding: '8px 10px' }}>
                        <CardCell
                          memberId={m.id}
                          initialIssued={m.card_issued ?? false}
                          initialDate={m.card_issued_date ?? null}
                          onUpdate={(id, issued, date) => setMembers(prev => prev.map(x => x.id !== id ? x : { ...x, card_issued: issued, card_issued_date: date }))}
                        />
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {!m.auth_user_id && (
                            <button
                              onClick={() => handleInvite(m)}
                              disabled={invitePending === m.id || !m.email}
                              title={m.email ? `Invite ${m.email}` : 'Add email first'}
                              style={{
                                display: 'inline-flex', alignItems: 'center', padding: '0 12px', height: '32px',
                                background: invitedIds.has(m.id) ? 'rgba(2,119,189,.08)' : 'rgba(2,119,189,.9)',
                                color: invitedIds.has(m.id) ? '#0277bd' : '#fff',
                                border: invitedIds.has(m.id) ? '1.5px solid #0277bd' : 'none',
                                fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 600,
                                letterSpacing: '.07em', textTransform: 'uppercase', cursor: m.email ? 'pointer' : 'not-allowed',
                                opacity: (!m.email || invitePending === m.id) ? .5 : 1,
                              }}
                            >
                              {invitePending === m.id ? 'Sending…' : invitedIds.has(m.id) ? 'Re-invite' : 'Invite'}
                            </button>
                          )}
                          <a
                            href={`/admin/members/${m.id}/statement`}
                            style={{ ...btnSecondary, textDecoration: 'none', borderColor: 'var(--gold)', color: 'var(--gold)' }}
                          >
                            Statement
                          </a>
                          <button onClick={() => startEdit(m)} style={btnSecondary}>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(m.id, m.full_name)}
                            style={{ ...btnDanger, opacity: deletePending ? .65 : 1 }}
                            disabled={deletePending}
                          >
                            Delete
                          </button>
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
  );
}
