'use client';

import { useState, useTransition, useEffect } from 'react';
import { addClubMember, updateClubMember, deleteClubMember } from './actions';

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

// ── StatusBadge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, React.CSSProperties> = {
    active:       { background: 'rgba(45,90,61,.1)',   color: '#2d5a3d' },
    inactive:     { background: 'rgba(0,0,0,.06)',     color: '#666' },
    probationary: { background: 'rgba(201,168,76,.15)', color: '#7a6040' },
  };
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      fontFamily: "'DM Sans', sans-serif",
      ...(s[status] ?? s.active),
    }}>
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

// ── Inline text input for edit rows ──────────────────────────────────────────

function CellInput({ value, onChange, type = 'text', style }: {
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  style?: React.CSSProperties;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, height: '34px', fontSize: '13px', ...style }}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function AdminClubMembersClient({ initialMembers }: Props) {
  const [members, setMembers] = useState<ClubMember[]>(sortByName(initialMembers));
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<MemberPayload>(EMPTY);
  const [addForm, setAddForm] = useState<MemberPayload>(EMPTY);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [addPending, startAddTransition] = useTransition();
  const [editPending, startEditTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();

  useEffect(() => {
    if (msg?.ok) {
      const t = setTimeout(() => setMsg(null), 3000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  const activeCount = members.filter(m => m.status === 'active').length;

  const filtered = search.trim()
    ? members.filter(m =>
        m.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (m.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (m.membership_number ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : members;

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
        };
        setMembers(prev => sortByName([...prev, newMember]));
        setAddForm(EMPTY);
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

  function handleDelete(id: string, name: string) {
    if (!confirm(`Remove ${name} from the club roster? This cannot be undone.`)) return;
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

  // ── Render ────────────────────────────────────────────────────────────────
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
        <form onSubmit={handleAdd}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Full Name *</label>
              <input
                required
                type="text"
                value={addForm.full_name}
                onChange={e => setAddForm(f => ({ ...f, full_name: e.target.value }))}
                style={inputStyle}
                placeholder="e.g. Jane Smith"
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
              />
            </div>
            <div>
              <label style={labelStyle}>Membership Number</label>
              <input
                type="text"
                value={addForm.membership_number}
                onChange={e => setAddForm(f => ({ ...f, membership_number: e.target.value }))}
                style={inputStyle}
                placeholder="e.g. 247"
              />
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
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Notes (optional)</label>
              <textarea
                value={addForm.notes}
                onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))}
                style={{ ...inputStyle, height: '72px', padding: '8px 10px' }}
                placeholder="Any relevant notes about this member"
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
            type="search"
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
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
              <thead>
                <tr>
                  {['Full Name', 'Memb. No.', 'Handicap', 'Status', 'Email', 'Joined', ''].map(h => (
                    <th key={h} style={{
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
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => {
                  const isEditing = editId === m.id;
                  const rowBg = i % 2 === 0 ? '#fff' : 'rgba(45,90,61,.025)';

                  if (isEditing) {
                    return (
                      <tr key={m.id} style={{ background: 'rgba(45,90,61,.04)', outline: '2px solid rgba(45,90,61,.2)' }}>
                        <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(45,90,61,.07)' }}>
                          <CellInput value={editForm.full_name} onChange={v => setEditForm(f => ({ ...f, full_name: v }))} />
                        </td>
                        <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(45,90,61,.07)' }}>
                          <CellInput value={editForm.membership_number} onChange={v => setEditForm(f => ({ ...f, membership_number: v }))} style={{ width: '90px' }} />
                        </td>
                        <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(45,90,61,.07)' }}>
                          <CellInput type="number" value={editForm.handicap} onChange={v => setEditForm(f => ({ ...f, handicap: Number(v) }))} style={{ width: '72px' }} />
                        </td>
                        <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(45,90,61,.07)' }}>
                          <select
                            value={editForm.status}
                            onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                            style={{ ...inputStyle, height: '34px', fontSize: '13px', width: '130px', cursor: 'pointer' }}
                          >
                            <option value="active">Active</option>
                            <option value="probationary">Probationary</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </td>
                        <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(45,90,61,.07)' }}>
                          <CellInput type="email" value={editForm.email} onChange={v => setEditForm(f => ({ ...f, email: v }))} />
                        </td>
                        <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(45,90,61,.07)' }}>
                          <CellInput type="date" value={editForm.joined_date} onChange={v => setEditForm(f => ({ ...f, joined_date: v }))} style={{ width: '140px' }} />
                        </td>
                        <td style={{ padding: '8px 10px', borderBottom: '1px solid rgba(45,90,61,.07)', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => handleSaveEdit(m.id)}
                              style={{ ...btnPrimary, height: '32px', padding: '0 14px', fontSize: '11px', opacity: editPending ? .65 : 1 }}
                              disabled={editPending}
                            >
                              {editPending ? 'Saving…' : 'Save'}
                            </button>
                            <button onClick={cancelEdit} style={btnSecondary}>
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={m.id} style={{ background: rowBg }}>
                      <td style={{ padding: '11px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 500, color: 'var(--text-dark)', borderBottom: '1px solid rgba(45,90,61,.07)', whiteSpace: 'nowrap' }}>
                        {m.full_name}
                      </td>
                      <td style={{ padding: '11px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-muted)', borderBottom: '1px solid rgba(45,90,61,.07)' }}>
                        {m.membership_number || '—'}
                      </td>
                      <td style={{ padding: '11px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 600, color: 'var(--green-mid)', borderBottom: '1px solid rgba(45,90,61,.07)', textAlign: 'center' }}>
                        {fmtHcp(m.handicap)}
                      </td>
                      <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(45,90,61,.07)' }}>
                        <StatusBadge status={m.status} />
                      </td>
                      <td style={{ padding: '11px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-muted)', borderBottom: '1px solid rgba(45,90,61,.07)' }}>
                        {m.email || '—'}
                      </td>
                      <td style={{ padding: '11px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-muted)', borderBottom: '1px solid rgba(45,90,61,.07)', whiteSpace: 'nowrap' }}>
                        {fmtDate(m.joined_date)}
                      </td>
                      <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(45,90,61,.07)', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
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
