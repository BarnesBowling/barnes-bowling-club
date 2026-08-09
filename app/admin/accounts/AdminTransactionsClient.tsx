'use client';

import { useState, useTransition, useMemo, useEffect } from 'react';
import { updateTransaction, deleteTransactionById, updateMemberBasics } from './actions';

const CATEGORY_LABELS: Record<string, string> = {
  membership_fee: 'Membership Fee',
  joining_fee:    'Joining Fee £100',
  guest_fee:      'Guest Fee',
  event_fee:      'Event Fee',
  manser_fee:     'Manser Fee',
  wrong_bias_fee: 'Wrong Bias Fee',
  miscellaneous:  'Miscellaneous',
  payment:        'Payment',
};

type Transaction = {
  id: string;
  member_id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'debit' | 'credit';
  metadata: Record<string, unknown> | null;
  club_members: { full_name: string; membership_number: string | null } | null;
};

type MemberBasics = {
  id: string;
  full_name: string;
  membership_number: string | null;
  email: string | null;
  status: string;
};

interface Props {
  initialTransactions: Transaction[];
  members: MemberBasics[];
}

function fmtDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtGBP(n: number): string {
  return `£${Math.abs(n).toFixed(2)}`;
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inp: React.CSSProperties = {
  height: '38px',
  padding: '0 10px',
  border: '1.5px solid rgba(45,90,61,.2)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  color: 'var(--green-deep)',
  background: '#fff',
  width: '100%',
  boxSizing: 'border-box',
};

const lbl: React.CSSProperties = {
  display: 'block',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--green-mid)',
  marginBottom: '5px',
};

const btnSave: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '0 20px', height: '38px',
  background: 'var(--green-mid)', color: '#fff', border: 'none',
  fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 700,
  letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer',
};

const btnCancel: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '0 16px', height: '38px',
  background: '#fff', color: '#666',
  border: '1.5px solid rgba(0,0,0,.15)',
  fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600,
  letterSpacing: '.07em', textTransform: 'uppercase', cursor: 'pointer',
};

const btnEdit: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '0 10px', height: '28px',
  background: 'transparent', color: 'var(--green-mid)',
  border: '1.5px solid var(--green-mid)',
  fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 700,
  letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer',
};

const btnDel: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '0 10px', height: '28px',
  background: '#c00', color: '#fff', border: 'none',
  fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 700,
  letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer',
};

const thStyle: React.CSSProperties = {
  padding: '9px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600,
  letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)',
  textAlign: 'left', borderBottom: '2px solid rgba(45,90,61,.12)', whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  padding: '10px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
  color: 'var(--text-dark)', borderBottom: '1px solid rgba(45,90,61,.06)', verticalAlign: 'middle',
};

// ── Component ─────────────────────────────────────────────────────────────────

export function AdminTransactionsClient({ initialTransactions, members }: Props) {
  const [rows, setRows] = useState<Transaction[]>(initialTransactions);

  // Sync when server re-fetches (e.g. after an add via the form above)
  useEffect(() => { setRows(initialTransactions); }, [initialTransactions]);

  // ── Transaction edit state ────────────────────────────────────────────────
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    date: string; description: string; category: string; amount: string; type: string;
  } | null>(null);

  // ── Member edit state ─────────────────────────────────────────────────────
  const [editMemberId, setEditMemberId]   = useState<string | null>(null);
  const [editMemberForm, setEditMemberForm] = useState<{
    email: string; membership_number: string; status: string;
  } | null>(null);
  // Local overrides so member cards update immediately after save
  const [memberOverrides, setMemberOverrides] = useState<Record<string, Partial<MemberBasics>>>({});

  // ── Status message ────────────────────────────────────────────────────────
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function showMsg(ok: boolean, text: string) {
    setMsg({ ok, text });
    if (ok) setTimeout(() => setMsg(null), 3500);
  }

  // ── Running balance (live, from rows state) ───────────────────────────────
  const balanceById = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of rows) {
      const signed = t.type === 'credit' ? -Number(t.amount) : Number(t.amount);
      m[t.member_id] = (m[t.member_id] ?? 0) + signed;
    }
    return m;
  }, [rows]);

  const memberMap = useMemo(() => new Map(members.map(m => [m.id, m])), [members]);

  const membersWithBalance = useMemo(() => {
    const seen = new Set<string>();
    const result: Array<MemberBasics & { balance: number }> = [];
    for (const t of rows) {
      if (seen.has(t.member_id)) continue;
      seen.add(t.member_id);
      const base = memberMap.get(t.member_id);
      if (!base) continue;
      const bal = balanceById[t.member_id] ?? 0;
      if (Math.abs(bal) < 0.001) continue;
      const merged = { ...base, ...(memberOverrides[t.member_id] ?? {}) };
      result.push({ ...merged, balance: bal });
    }
    return result;
  }, [rows, memberMap, balanceById, memberOverrides]);

  // ── Transaction handlers ──────────────────────────────────────────────────

  function startEdit(t: Transaction) {
    setEditId(t.id);
    setEditForm({ date: t.date, description: t.description, category: t.category, amount: String(t.amount), type: t.type });
    setMsg(null);
  }

  function cancelEdit() { setEditId(null); setEditForm(null); }

  function handleSave(id: string) {
    if (!editForm) return;
    const amount = parseFloat(editForm.amount);
    if (isNaN(amount) || amount <= 0) { showMsg(false, 'Amount must be a positive number.'); return; }
    startTransition(async () => {
      const res = await updateTransaction(id, { date: editForm.date, description: editForm.description, category: editForm.category, amount, type: editForm.type });
      if (res.error) { showMsg(false, res.error); return; }
      setRows(prev => prev.map(r => r.id !== id ? r : {
        ...r, date: editForm.date, description: editForm.description,
        category: editForm.category, amount, type: editForm.type as 'debit' | 'credit',
      }));
      setEditId(null);
      setEditForm(null);
      showMsg(true, 'Transaction updated.');
    });
  }

  function handleDelete(id: string, description: string) {
    if (!confirm(`Delete "${description}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteTransactionById(id);
      if (res.error) { showMsg(false, res.error); return; }
      setRows(prev => prev.filter(r => r.id !== id));
      if (editId === id) { setEditId(null); setEditForm(null); }
      showMsg(true, 'Transaction deleted.');
    });
  }

  // ── Member edit handlers ──────────────────────────────────────────────────

  function startEditMember(m: MemberBasics) {
    setEditMemberId(m.id);
    setEditMemberForm({ email: m.email ?? '', membership_number: m.membership_number ?? '', status: m.status });
  }

  function cancelEditMember() { setEditMemberId(null); setEditMemberForm(null); }

  function handleSaveMember(id: string) {
    if (!editMemberForm) return;
    startTransition(async () => {
      const res = await updateMemberBasics(id, editMemberForm);
      if (res.error) { showMsg(false, res.error); return; }
      setMemberOverrides(prev => ({
        ...prev,
        [id]: { email: editMemberForm.email || null, membership_number: editMemberForm.membership_number || null, status: editMemberForm.status },
      }));
      setEditMemberId(null);
      setEditMemberForm(null);
      showMsg(true, 'Member details updated.');
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

      {/* Status banner */}
      {msg && (
        <div style={{
          padding: '10px 14px', marginBottom: '-1.5rem',
          background: msg.ok ? 'rgba(45,90,61,.08)' : 'rgba(192,0,0,.06)',
          borderLeft: `4px solid ${msg.ok ? 'var(--green-mid)' : '#c00'}`,
          color: msg.ok ? 'var(--green-deep)' : '#900',
          fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
        }}>
          {msg.text}
        </div>
      )}

      {/* ── Outstanding balances ──────────────────────────────────────────── */}
      {membersWithBalance.length > 0 && (
        <section>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-deep)', marginBottom: '1.25rem' }}>
            Outstanding balances
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {membersWithBalance.map(m => {
              const isEditing = editMemberId === m.id;
              return (
                <div key={m.id} style={{
                  background: '#fff',
                  border: `1px solid ${m.balance > 0 ? 'rgba(192,57,43,.2)' : 'rgba(46,125,50,.2)'}`,
                  padding: '.75rem 1rem', minWidth: '210px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--green-deep)' }}>
                        {m.full_name}
                      </div>
                      {m.membership_number && (
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'rgba(45,90,61,.45)' }}>
                          {m.membership_number}
                        </div>
                      )}
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '16px', fontWeight: 700, marginTop: '4px', color: m.balance > 0 ? '#c0392b' : '#2e7d32' }}>
                        {m.balance > 0 ? fmtGBP(m.balance) : `−${fmtGBP(m.balance)}`}
                      </div>
                    </div>
                    <button
                      onClick={() => isEditing ? cancelEditMember() : startEditMember(m)}
                      style={{ ...btnEdit, flexShrink: 0, height: '26px', padding: '0 8px', fontSize: '10px' }}
                    >
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  {isEditing && editMemberForm && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(45,90,61,.1)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div>
                          <label style={lbl}>Email</label>
                          <input type="email" value={editMemberForm.email}
                            onChange={e => setEditMemberForm(f => f && { ...f, email: e.target.value })}
                            style={{ ...inp, height: '32px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={lbl}>Membership No.</label>
                          <input type="text" value={editMemberForm.membership_number}
                            onChange={e => setEditMemberForm(f => f && { ...f, membership_number: e.target.value })}
                            style={{ ...inp, height: '32px', fontSize: '12px' }} />
                        </div>
                        <div>
                          <label style={lbl}>Status</label>
                          <select value={editMemberForm.status}
                            onChange={e => setEditMemberForm(f => f && { ...f, status: e.target.value })}
                            style={{ ...inp, height: '32px', fontSize: '12px', cursor: 'pointer' }}>
                            <option value="active">Active</option>
                            <option value="probationary">Probationary</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                          <button onClick={() => handleSaveMember(m.id)} disabled={pending}
                            style={{ ...btnSave, height: '32px', fontSize: '11px', padding: '0 14px', opacity: pending ? .65 : 1 }}>
                            Save
                          </button>
                          <button onClick={cancelEditMember}
                            style={{ ...btnCancel, height: '32px', fontSize: '11px', padding: '0 10px' }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Recent transactions ───────────────────────────────────────────── */}
      <section>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-deep)', marginBottom: '1.25rem' }}>
          Recent transactions
        </h2>

        {rows.length === 0 ? (
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            No transactions recorded yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: '680px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Member</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Category</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
                  <th style={{ ...thStyle, width: '110px' }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t, i) => {
                  const isCredit  = t.type === 'credit';
                  const cm        = t.club_members;
                  const isEditing = editId === t.id;

                  if (isEditing && editForm) {
                    return (
                      <tr key={t.id}>
                        <td colSpan={6} style={{ padding: 0, background: 'rgba(45,90,61,.03)', borderBottom: '2px solid rgba(45,90,61,.18)', borderTop: '1px solid rgba(45,90,61,.12)' }}>
                          <div style={{ padding: '1.25rem 1.5rem' }}>

                            {/* Member label (readonly) */}
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600, color: 'var(--green-deep)', marginBottom: '1rem' }}>
                              {cm?.full_name ?? t.member_id}
                              {cm?.membership_number && (
                                <span style={{ fontWeight: 400, color: 'rgba(45,90,61,.45)', marginLeft: '6px' }}>
                                  {cm.membership_number}
                                </span>
                              )}
                            </div>

                            {/* Edit grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                              <div>
                                <label style={lbl}>Date</label>
                                <input type="date" value={editForm.date}
                                  onChange={e => setEditForm(f => f && { ...f, date: e.target.value })}
                                  style={inp} />
                              </div>
                              <div style={{ gridColumn: 'span 2' }}>
                                <label style={lbl}>Description</label>
                                <input type="text" value={editForm.description}
                                  onChange={e => setEditForm(f => f && { ...f, description: e.target.value })}
                                  style={inp} />
                              </div>
                              <div>
                                <label style={lbl}>Category</label>
                                <select value={editForm.category}
                                  onChange={e => setEditForm(f => f && { ...f, category: e.target.value })}
                                  style={{ ...inp, cursor: 'pointer' }}>
                                  {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label style={lbl}>Amount (£)</label>
                                <input type="number" min="0.01" step="0.01" value={editForm.amount}
                                  onChange={e => setEditForm(f => f && { ...f, amount: e.target.value })}
                                  style={inp} />
                              </div>
                              <div>
                                <label style={lbl}>Type</label>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  {(['debit', 'credit'] as const).map(tp => (
                                    <button key={tp} type="button"
                                      onClick={() => setEditForm(f => f && { ...f, type: tp })}
                                      style={{
                                        flex: 1, height: '38px', border: '1.5px solid',
                                        fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 700,
                                        letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer',
                                        borderColor: editForm.type === tp ? 'var(--green-mid)' : 'rgba(45,90,61,.2)',
                                        background:  editForm.type === tp ? 'var(--green-mid)' : '#fff',
                                        color:       editForm.type === tp ? '#fff' : 'var(--text-muted)',
                                      }}
                                    >
                                      {tp}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => handleSave(t.id)} disabled={pending}
                                style={{ ...btnSave, opacity: pending ? .65 : 1 }}>
                                {pending ? 'Saving…' : 'Save'}
                              </button>
                              <button onClick={cancelEdit} style={btnCancel}>Cancel</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={t.id} style={{ background: i % 2 === 0 ? '#fff' : 'rgba(45,90,61,.018)' }}>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                        {fmtDate(t.date)}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 500 }}>{cm?.full_name ?? t.member_id}</div>
                        {cm?.membership_number && (
                          <div style={{ fontSize: '11px', color: 'rgba(45,90,61,.4)' }}>{cm.membership_number}</div>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <div>{t.description}</div>
                        {t.category === 'guest_fee' && t.metadata && (
                          <div style={{ fontSize: '11px', color: 'var(--green-deep)', marginTop: '3px' }}>
                            {(t.metadata as Record<string,unknown>).num_guests as number} guest{((t.metadata as Record<string,unknown>).num_guests as number) !== 1 ? 's' : ''}{' '}
                            · £{((t.metadata as Record<string,unknown>).cost_per_guest as number).toFixed(2)}/guest
                            {(t.metadata as Record<string,unknown>).date_of_play ? ` · played ${fmtDate(String((t.metadata as Record<string,unknown>).date_of_play))}` : ''}
                            {(t.metadata as Record<string,unknown>).notes ? ` · ${(t.metadata as Record<string,unknown>).notes}` : ''}
                          </div>
                        )}
                      </td>
                      <td style={tdStyle}>
                        <span style={{ display: 'inline-block', padding: '2px 7px', background: 'rgba(45,90,61,.07)', fontSize: '10px', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--green-deep)', whiteSpace: 'nowrap' }}>
                          {CATEGORY_LABELS[t.category] ?? t.category}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap', color: isCredit ? '#2e7d32' : '#c0392b' }}>
                        {isCredit ? `−${fmtGBP(t.amount)}` : fmtGBP(t.amount)}
                      </td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button onClick={() => startEdit(t)} style={btnEdit}>Edit</button>
                          <button onClick={() => handleDelete(t.id, t.description)} disabled={pending}
                            style={{ ...btnDel, opacity: pending ? .65 : 1 }}>
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
