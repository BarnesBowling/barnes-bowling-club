'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { StatementPDFButton } from './StatementPDFButton';
import type { StatementEntry, StatementMember } from './StatementPDFButton';
import { RecordPaymentButton } from './RecordPaymentButton';
import { updateLedgerEntry, deleteLedgerEntry } from './statementLedgerActions';
import { guestFeeDetail } from './statementUtils';

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

const inp: React.CSSProperties = {
  height: '36px',
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
  padding: '0 20px', height: '36px',
  background: 'var(--green-mid)', color: '#fff', border: 'none',
  fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 700,
  letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer',
};

const btnCancel: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '0 16px', height: '36px',
  background: '#fff', color: '#666',
  border: '1.5px solid rgba(0,0,0,.15)',
  fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600,
  letterSpacing: '.07em', textTransform: 'uppercase', cursor: 'pointer',
};

const btnEdit: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '0 10px', height: '26px',
  background: 'transparent', color: 'var(--green-mid)',
  border: '1.5px solid var(--green-mid)',
  fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 700,
  letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer',
};

const btnDel: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '0 10px', height: '26px',
  background: '#c00', color: '#fff', border: 'none',
  fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 700,
  letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer',
};

type EditForm = {
  date: string;
  description: string;
  category: string;
  type: 'debit' | 'credit';
  amount: string;
  num_guests: string;
  cost_per_guest: string;
  guest_names: string;
};

interface Props {
  entries: StatementEntry[];
  memberId: string;
  memberName: string;
  member: StatementMember;
  isAdmin: boolean;
}

export function StatementTransactionsClient({
  entries: serverEntries,
  memberId,
  memberName,
  member,
  isAdmin,
}: Props) {
  const router = useRouter();
  const [entries, setEntries] = useState<StatementEntry[]>(serverEntries);
  const [editId, setEditId]   = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [msg, setMsg]         = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  // Sync when server refreshes data
  useEffect(() => { setEntries(serverEntries); }, [serverEntries]);

  // Balance calculations — single source of truth, never uses category
  const { rows, totalCharged, totalPaid, finalBalance } = useMemo(() => {
    let running = 0;
    const withBalance = entries.map(e => {
      running += e.type === 'credit' ? -e.amount : e.amount;
      return { ...e, balance: running };
    });
    const charged = entries.reduce((s, e) => s + (e.type === 'debit'  ? e.amount : 0), 0);
    const paid    = entries.reduce((s, e) => s + (e.type === 'credit' ? e.amount : 0), 0);
    return { rows: withBalance, totalCharged: charged, totalPaid: paid, finalBalance: running };
  }, [entries]);

  function showMsg(ok: boolean, text: string) {
    setMsg({ ok, text });
    if (ok) setTimeout(() => setMsg(null), 4000);
  }

  function startEdit(e: StatementEntry) {
    const isGuestFee = e.category === 'guest_fee';
    setEditId(e.id);
    setEditForm({
      date:           e.date,
      description:    e.description,
      category:       e.category,
      type:           e.type,
      amount:         isGuestFee ? '' : String(e.amount),
      num_guests:     e.num_guests != null ? String(e.num_guests) : '',
      cost_per_guest: e.cost_per_guest != null ? String(e.cost_per_guest) : '',
      guest_names:    e.guest_names ?? '',
    });
    setMsg(null);
  }

  function cancelEdit() { setEditId(null); setEditForm(null); }

  function derivedGuestAmount(form: EditForm): number {
    const n = parseFloat(form.num_guests);
    const c = parseFloat(form.cost_per_guest);
    return !isNaN(n) && !isNaN(c) && n > 0 && c > 0 ? Math.round(n * c * 100) / 100 : 0;
  }

  function handleSave(entry: StatementEntry) {
    if (!editForm) return;
    const isGuestFee = editForm.category === 'guest_fee';

    let amount: number;
    if (isGuestFee) {
      amount = derivedGuestAmount(editForm);
      if (amount <= 0) { showMsg(false, 'Enter a valid number of guests and cost per guest.'); return; }
    } else {
      amount = parseFloat(editForm.amount);
      if (isNaN(amount) || amount <= 0) { showMsg(false, 'Amount must be a positive number.'); return; }
    }
    if (!editForm.date)                  { showMsg(false, 'Date is required.'); return; }
    if (!editForm.description.trim())    { showMsg(false, 'Description is required.'); return; }

    const update = {
      date:           editForm.date,
      description:    editForm.description.trim(),
      category:       editForm.category,
      amount,
      type:           editForm.type,
      num_guests:     isGuestFee ? (parseInt(editForm.num_guests) || null) : null,
      cost_per_guest: isGuestFee ? (parseFloat(editForm.cost_per_guest) || null) : null,
      guest_names:    isGuestFee && editForm.guest_names.trim() ? editForm.guest_names.trim() : null,
    };

    startTransition(async () => {
      const res = await updateLedgerEntry(entry.id, memberId, update);
      if (res.error) { showMsg(false, res.error); return; }

      setEntries(prev => prev.map(e => e.id !== entry.id ? e : { ...e, ...update }));
      setEditId(null);
      setEditForm(null);
      showMsg(true, 'Entry updated.');
      router.refresh();
    });
  }

  function handleDelete(id: string, description: string) {
    if (!window.confirm(`Delete this entry?\n\n"${description}"\n\nThis cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteLedgerEntry(id, memberId);
      if (res.error) { showMsg(false, res.error); return; }
      setEntries(prev => prev.filter(e => e.id !== id));
      if (editId === id) { setEditId(null); setEditForm(null); }
      showMsg(true, 'Entry deleted.');
      router.refresh();
    });
  }

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

  const totalCols = isAdmin ? 7 : 6;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Status banner */}
      {msg && (
        <div style={{
          padding: '10px 14px',
          background: msg.ok ? 'rgba(45,90,61,.08)' : 'rgba(192,0,0,.06)',
          borderLeft: `4px solid ${msg.ok ? 'var(--green-mid)' : '#c00'}`,
          color: msg.ok ? 'var(--green-deep)' : '#900',
          fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
        }}>
          {msg.text}
        </div>
      )}

      {/* Summary boxes */}
      {entries.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px',
          background: 'rgba(45,90,61,.12)',
          border: '1px solid rgba(45,90,61,.12)',
        }}>
          {[
            { label: 'Total Charged', value: totalCharged, color: '#c0392b' },
            { label: 'Total Paid',    value: totalPaid,    color: '#2e7d32' },
            {
              label: finalBalance > 0.005 ? 'Owes the club' : finalBalance < -0.005 ? 'Club owes' : 'Balance',
              value: finalBalance,
              color: finalBalance > 0.005 ? '#c0392b' : finalBalance < -0.005 ? '#c9a84c' : 'var(--text-dark)',
            },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#fff', padding: '1rem 1.25rem' }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>
                {label}
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '20px', fontWeight: 700, color }}>
                £{Math.abs(value).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <StatementPDFButton member={member} entries={entries} />
        {isAdmin && (
          <RecordPaymentButton
            memberId={memberId}
            memberName={memberName}
            outstandingBalance={finalBalance}
          />
        )}
      </div>

      {/* Transaction History */}
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
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: isAdmin ? '800px' : '680px' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Description</th>
                  <th style={thStyle}>Category</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Debit</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Credit</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Balance</th>
                  {isAdmin && <th style={{ ...thStyle, width: '96px' }}></th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((e, i) => {
                  const isCredit  = e.type === 'credit';
                  const rowBg     = i % 2 === 0 ? '#fff' : 'rgba(45,90,61,.02)';
                  const balOwing  = e.balance > 0.005;
                  const balCredit = e.balance < -0.005;
                  const detail    = guestFeeDetail(e);
                  const isEditing = isAdmin && editId === e.id;

                  if (isEditing && editForm) {
                    const isGuestFee = editForm.category === 'guest_fee';
                    const derived    = isGuestFee ? derivedGuestAmount(editForm) : null;

                    return (
                      <tr key={e.id}>
                        <td colSpan={totalCols} style={{ padding: 0, background: 'rgba(45,90,61,.03)', borderBottom: '2px solid rgba(45,90,61,.18)', borderTop: '1px solid rgba(45,90,61,.12)' }}>
                          <div style={{ padding: '1.25rem 1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>

                              <div>
                                <label style={lbl}>Date</label>
                                <input type="date" value={editForm.date}
                                  onChange={ev => setEditForm(f => f && { ...f, date: ev.target.value })}
                                  style={inp} />
                              </div>

                              <div style={{ gridColumn: 'span 2' }}>
                                <label style={lbl}>Description</label>
                                <input type="text" value={editForm.description}
                                  onChange={ev => setEditForm(f => f && { ...f, description: ev.target.value })}
                                  style={inp} />
                              </div>

                              <div>
                                <label style={lbl}>Category</label>
                                <select value={editForm.category}
                                  onChange={ev => setEditForm(f => f && { ...f, category: ev.target.value })}
                                  style={{ ...inp, cursor: 'pointer' }}>
                                  {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label style={lbl}>Charge / Payment</label>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  {(['debit', 'credit'] as const).map(tp => (
                                    <button key={tp} type="button"
                                      onClick={() => setEditForm(f => f && { ...f, type: tp })}
                                      style={{
                                        flex: 1, height: '36px', border: '1.5px solid',
                                        fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 700,
                                        letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer',
                                        borderColor: editForm.type === tp ? 'var(--green-mid)' : 'rgba(45,90,61,.2)',
                                        background:  editForm.type === tp ? 'var(--green-mid)' : '#fff',
                                        color:       editForm.type === tp ? '#fff' : 'var(--text-muted)',
                                      }}>
                                      {tp === 'debit' ? 'Charge' : 'Payment'}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {isGuestFee ? (
                                <>
                                  <div>
                                    <label style={lbl}>No. of guests</label>
                                    <input type="number" min="1" step="1" placeholder="0"
                                      value={editForm.num_guests}
                                      onChange={ev => setEditForm(f => f && { ...f, num_guests: ev.target.value })}
                                      style={inp} />
                                  </div>
                                  <div>
                                    <label style={lbl}>Cost per guest (£)</label>
                                    <input type="number" min="0.01" step="0.01" placeholder="0.00"
                                      value={editForm.cost_per_guest}
                                      onChange={ev => setEditForm(f => f && { ...f, cost_per_guest: ev.target.value })}
                                      style={inp} />
                                  </div>
                                  <div style={{ gridColumn: 'span 2' }}>
                                    <label style={lbl}>Guest names</label>
                                    <input type="text" placeholder="e.g. A Smith / B Jones"
                                      value={editForm.guest_names}
                                      onChange={ev => setEditForm(f => f && { ...f, guest_names: ev.target.value })}
                                      style={inp} />
                                  </div>
                                  {derived !== null && derived > 0 && (
                                    <div>
                                      <label style={lbl}>Amount (calculated)</label>
                                      <div style={{ ...inp, display: 'flex', alignItems: 'center', background: 'rgba(45,90,61,.04)', color: 'var(--green-deep)', fontWeight: 700 }}>
                                        £{derived.toFixed(2)}
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div>
                                  <label style={lbl}>Amount (£)</label>
                                  <input type="number" min="0.01" step="0.01" placeholder="0.00"
                                    value={editForm.amount}
                                    onChange={ev => setEditForm(f => f && { ...f, amount: ev.target.value })}
                                    style={inp} />
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => handleSave(e)} disabled={pending}
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
                    <tr key={e.id} style={{ background: rowBg }}>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                        {fmtDate(e.date)}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 500 }}>
                          {e.description}{detail ? ` – ${detail}` : ''}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 7px',
                          background: e.category === 'payment' ? 'rgba(46,125,50,.12)' : 'rgba(45,90,61,.07)',
                          fontSize: '10px',
                          fontWeight: 600,
                          letterSpacing: '.06em',
                          textTransform: 'uppercase',
                          color: e.category === 'payment' ? '#2e7d32' : 'var(--green-deep)',
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
                        {e.balance >= 0 ? fmtGBP(e.balance) : `−${fmtGBP(e.balance)}`}
                      </td>
                      {isAdmin && (
                        <td style={{ ...tdStyle, whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            <button onClick={() => startEdit(e)} style={btnEdit}>Edit</button>
                            <button
                              onClick={() => handleDelete(e.id, e.description)}
                              disabled={pending}
                              style={{ ...btnDel, opacity: pending ? .65 : 1 }}
                            >
                              Del
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan={totalCols - 1}
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
                    color: finalBalance > 0.005 ? '#c0392b' : finalBalance < -0.005 ? '#c9a84c' : 'var(--text-dark)',
                  }}>
                    {finalBalance >= 0 ? fmtGBP(finalBalance) : `−${fmtGBP(finalBalance)}`}
                  </td>
                </tr>
                <tr>
                  <td colSpan={totalCols} style={{
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
                      ? `Owes the club £${finalBalance.toFixed(2)}`
                      : finalBalance < -0.005
                      ? `The club owes this member £${Math.abs(finalBalance).toFixed(2)}`
                      : 'Settled'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
