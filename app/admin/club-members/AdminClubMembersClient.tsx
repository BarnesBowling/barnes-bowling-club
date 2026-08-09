'use client';

import { useState, useTransition, useEffect } from 'react';
import { addClubMember, updateClubMember, deleteClubMember, inviteClubMember, savePhotoId, clearMemberPhoto, checkMemberHasLedger } from './actions';

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

type Props = { initialMembers: ClubMember[] };

// ── Helpers ───────────────────────────────────────────────────────────────────

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

// BBC + first initial of first name + first initial of surname + next consecutive number
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

// ── PhotoCell ─────────────────────────────────────────────────────────────────

function PhotoCell({ memberId, initialFilename, onUpdate }: {
  memberId: string;
  initialFilename?: string | null;
  onUpdate: (id: string, filename: string | null) => void;
}) {
  const [inputValue, setInputValue] = useState(initialFilename ?? '');
  const [savedFilename, setSavedFilename] = useState(initialFilename ?? '');
  const [saving, startSaveTransition] = useTransition();
  const [savedOk, setSavedOk] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setSavedFilename(initialFilename ?? '');
    setInputValue(initialFilename ?? '');
  }, [initialFilename]);

  function handleSave() {
    setSaveError(null);
    startSaveTransition(async () => {
      try {
        await savePhotoId(memberId, inputValue.trim() || null);
        const saved = inputValue.trim() || null;
        setSavedFilename(saved ?? '');
        onUpdate(memberId, saved);
        setSavedOk(true);
        setTimeout(() => setSavedOk(false), 2500);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Save failed');
      }
    });
  }

  function handleDelete() {
    if (!confirm('Remove this photo ID? This cannot be undone.')) return;
    setSaveError(null);
    startSaveTransition(async () => {
      try {
        await clearMemberPhoto(memberId);
        setSavedFilename('');
        setInputValue('');
        onUpdate(memberId, null);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Delete failed');
      }
    });
  }

  const thumbSrc = savedFilename.trim() ? `/member-photos/${savedFilename.trim()}` : null;

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', minWidth: '190px' }}>
      <div style={{
        width: 50,
        aspectRatio: '35/45',
        background: '#e8e8e8',
        flexShrink: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(0,0,0,.1)',
      }}>
        {thumbSrc ? (
          <img src={thumbSrc} alt="ID photo" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <input
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="e.g. jane-smith.jpg"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          style={{ ...inputStyle, height: '30px', fontSize: '12px' }}
        />
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              ...btnPrimary,
              height: '26px',
              fontSize: '10px',
              padding: '0 10px',
              minWidth: 0,
              opacity: saving ? .65 : 1,
              background: savedOk ? '#2e7d32' : 'var(--green-mid)',
            }}
          >
            {saving ? '…' : savedOk ? '✓ Saved' : 'Save'}
          </button>
          {savedFilename.trim() && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              style={{
                ...btnDanger,
                height: '26px',
                fontSize: '10px',
                padding: '0 10px',
                minWidth: 0,
                opacity: saving ? .65 : 1,
              }}
            >
              Delete
            </button>
          )}
        </div>
        {saveError && (
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#b91c1c' }}>
            {saveError}
          </span>
        )}
      </div>
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

export function AdminClubMembersClient({ initialMembers }: Props) {
  const [members, setMembers] = useState<ClubMember[]>(sortByName(initialMembers));
  const [search, setSearch] = useState('');
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

  const activeCount = members.filter(m => m.status === 'active').length;

  const baseFiltered = search.trim()
    ? members.filter(m =>
        m.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (m.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (m.membership_number ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : members;

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
    if (sortKey === key) {
      setSortAsc(a => !a);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  // ── Add ──────────────────────────────────────────────────────────────────

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

  // ── Photo update ──────────────────────────────────────────────────────────

  function handlePhotoUpdate(id: string, filename: string | null) {
    setMembers(prev => prev.map(m => m.id !== id ? m : { ...m, photo_id_filename: filename }));
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const COLS = 8; // Memb. No. | Full Name | Email | Handicap | Status | Joined | Photo ID | Actions

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
            {activeCount} active · {members.length} total
          </span>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.25rem', maxWidth: '360px' }}>
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
            style={{ ...inputStyle, height: '40px' }}
          />
        </div>

        {filtered.length === 0 ? (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {search ? 'No members match your search.' : 'No members in the roster yet.'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1020px' }}>
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
                  <th style={{ ...thStyle, textAlign: 'center' }}>Handicap</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Joined</th>
                  <th style={thStyle}>
                    Photo ID
                    <span style={{ display: 'block', fontWeight: 400, fontSize: '9px', letterSpacing: '.04em', textTransform: 'none', fontStyle: 'italic', color: 'var(--text-muted)', marginTop: '3px', whiteSpace: 'normal', maxWidth: '180px', lineHeight: 1.4 }}>
                      Upload to public/member-photos/ then enter filename
                    </span>
                  </th>
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

                            {/* Member label */}
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--green-deep)', marginBottom: '1rem' }}>
                              Editing: {m.full_name}
                            </div>

                            {/* Edit grid */}
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
                              <div style={{ gridColumn: '1 / -1' }}>
                                <label style={labelStyle}>Photo ID</label>
                                <PhotoCell memberId={m.id} initialFilename={m.photo_id_filename} onUpdate={handlePhotoUpdate} />
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
                        {m.email || '—'}
                      </td>
                      <td style={{ ...tdStyle, fontSize: '14px', fontWeight: 600, color: 'var(--green-mid)', textAlign: 'center' }}>
                        {fmtHcp(m.handicap)}
                      </td>
                      <td style={tdStyle}>
                        <StatusBadge status={m.status} invited={invitedIds.has(m.id)} hasAuth={!!m.auth_user_id} />
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                        {fmtDate(m.joined_date)}
                      </td>
                      <td style={{ ...tdStyle, padding: '8px 10px', verticalAlign: 'top' }}>
                        <PhotoCell memberId={m.id} initialFilename={m.photo_id_filename} onUpdate={handlePhotoUpdate} />
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
