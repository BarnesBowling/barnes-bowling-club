'use client';

import { useState, useTransition } from 'react';
import { createEvent, updateEvent, deleteEvent } from './actions';

interface PaymentEvent {
  id: string;
  name: string;
  amount: number | null;
  is_tbc: boolean;
  sort_order: number;
  active: boolean;
}

const inp: React.CSSProperties = {
  height: '38px', padding: '0 10px',
  border: '1.5px solid rgba(45,90,61,.2)',
  fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
  color: 'var(--green-deep)', background: '#fff',
  width: '100%', boxSizing: 'border-box',
};
const lbl: React.CSSProperties = {
  display: 'block', fontFamily: "'DM Sans', sans-serif",
  fontSize: '10px', fontWeight: 600, letterSpacing: '.1em',
  textTransform: 'uppercase', color: 'var(--green-mid)', marginBottom: '5px',
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
  padding: '0 14px', height: '36px',
  background: '#fff', color: '#666', border: '1.5px solid rgba(0,0,0,.15)',
  fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 600,
  letterSpacing: '.07em', textTransform: 'uppercase', cursor: 'pointer',
};
const btnSmall: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '0 10px', height: '28px',
  background: 'transparent', color: 'var(--green-mid)',
  border: '1.5px solid var(--green-mid)',
  fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 700,
  letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer',
};
const btnDel: React.CSSProperties = {
  ...btnSmall, background: '#c00', color: '#fff', border: 'none',
};

const emptyForm = { name: '', amount: '5', is_tbc: false, sort_order: 0, active: true };

export function PaymentEventsClient({ initialEvents }: { initialEvents: PaymentEvent[] }) {
  const [events, setEvents] = useState<PaymentEvent[]>(initialEvents);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<typeof emptyForm | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function showMsg(ok: boolean, text: string) {
    setMsg({ ok, text });
    if (ok) setTimeout(() => setMsg(null), 3000);
  }

  function startEdit(ev: PaymentEvent) {
    setEditId(ev.id);
    setEditForm({ name: ev.name, amount: ev.amount != null ? String(ev.amount) : '', is_tbc: ev.is_tbc, sort_order: ev.sort_order, active: ev.active });
    setShowAdd(false);
  }

  function cancelEdit() { setEditId(null); setEditForm(null); }

  function handleSaveEdit(id: string) {
    if (!editForm) return;
    const amount = editForm.is_tbc ? null : (parseFloat(editForm.amount) || null);
    startTransition(async () => {
      const res = await updateEvent(id, { ...editForm, amount, sort_order: Number(editForm.sort_order) });
      if (res.error) { showMsg(false, res.error); return; }
      setEvents(prev => prev.map(e => e.id !== id ? e : {
        ...e, name: editForm.name, amount, is_tbc: editForm.is_tbc,
        sort_order: Number(editForm.sort_order), active: editForm.active,
      }));
      setEditId(null); setEditForm(null);
      showMsg(true, 'Event updated.');
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteEvent(id);
      if (res.error) { showMsg(false, res.error); return; }
      setEvents(prev => prev.filter(e => e.id !== id));
      showMsg(true, 'Event deleted.');
    });
  }

  function handleAdd() {
    const amount = addForm.is_tbc ? null : (parseFloat(addForm.amount) || null);
    startTransition(async () => {
      const res = await createEvent({ name: addForm.name, amount, is_tbc: addForm.is_tbc, sort_order: Number(addForm.sort_order) });
      if (res.error) { showMsg(false, res.error); return; }
      setShowAdd(false);
      setAddForm(emptyForm);
      showMsg(true, 'Event added — refresh to see it.');
    });
  }

  const thStyle: React.CSSProperties = {
    padding: '9px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600,
    letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--text-muted)',
    textAlign: 'left', borderBottom: '2px solid rgba(45,90,61,.12)',
  };
  const tdStyle: React.CSSProperties = {
    padding: '10px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
    color: 'var(--text-dark)', borderBottom: '1px solid rgba(45,90,61,.06)', verticalAlign: 'middle',
  };

  function EventForm({ form, onChange }: {
    form: typeof emptyForm;
    onChange: (f: typeof emptyForm) => void;
  }) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={lbl}>Event Name</label>
          <input type="text" value={form.name} onChange={e => onChange({ ...form, name: e.target.value })} style={inp} />
        </div>
        <div>
          <label style={lbl}>Amount (£)</label>
          <input type="number" min="0" step="0.01" value={form.amount} disabled={form.is_tbc}
            onChange={e => onChange({ ...form, amount: e.target.value })}
            style={{ ...inp, opacity: form.is_tbc ? 0.4 : 1 }} />
        </div>
        <div>
          <label style={lbl}>Sort Order</label>
          <input type="number" min="0" value={form.sort_order} onChange={e => onChange({ ...form, sort_order: Number(e.target.value) })} style={inp} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'flex-end' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: 'var(--green-deep)' }}>
            <input type="checkbox" checked={form.is_tbc} onChange={e => onChange({ ...form, is_tbc: e.target.checked })} />
            Price TBC
          </label>
          {'active' in form && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: '13px', color: 'var(--green-deep)' }}>
              <input type="checkbox" checked={(form as typeof emptyForm).active} onChange={e => onChange({ ...form, active: e.target.checked })} />
              Active
            </label>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {msg && (
        <div style={{
          padding: '10px 14px', background: msg.ok ? 'rgba(45,90,61,.08)' : 'rgba(192,0,0,.06)',
          borderLeft: `4px solid ${msg.ok ? 'var(--green-mid)' : '#c00'}`,
          color: msg.ok ? 'var(--green-deep)' : '#900',
          fontFamily: "'DM Sans',sans-serif", fontSize: '13px',
        }}>
          {msg.text}
        </div>
      )}

      {/* Events table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: '500px' }}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Order</th>
              <th style={thStyle}>Active</th>
              <th style={{ ...thStyle, width: '100px' }}></th>
            </tr>
          </thead>
          <tbody>
            {events.map(ev => {
              if (editId === ev.id && editForm) {
                return (
                  <tr key={ev.id}>
                    <td colSpan={5} style={{ padding: 0, background: 'rgba(45,90,61,.03)', borderBottom: '2px solid rgba(45,90,61,.18)' }}>
                      <div style={{ padding: '1.25rem 1.5rem' }}>
                        <EventForm form={editForm} onChange={setEditForm} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleSaveEdit(ev.id)} disabled={pending} style={{ ...btnSave, opacity: pending ? .65 : 1 }}>
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
                <tr key={ev.id}>
                  <td style={tdStyle}>{ev.name}</td>
                  <td style={tdStyle}>{ev.is_tbc ? 'TBC' : ev.amount != null ? `£${Number(ev.amount).toFixed(2)}` : '—'}</td>
                  <td style={tdStyle}>{ev.sort_order}</td>
                  <td style={tdStyle}>
                    <span style={{ color: ev.active ? '#2e7d32' : '#999', fontWeight: 600, fontSize: '11px' }}>
                      {ev.active ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button onClick={() => startEdit(ev)} style={btnSmall}>Edit</button>
                      <button onClick={() => handleDelete(ev.id, ev.name)} disabled={pending} style={{ ...btnDel, opacity: pending ? .65 : 1 }}>Del</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {events.length === 0 && (
              <tr><td colSpan={5} style={{ ...tdStyle, fontStyle: 'italic', color: 'var(--text-muted)' }}>No events yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add new */}
      {showAdd ? (
        <div style={{ background: 'rgba(45,90,61,.03)', border: '1px solid rgba(45,90,61,.15)', padding: '1.25rem 1.5rem' }}>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '12px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--green-mid)', marginBottom: '1rem' }}>
            New Event
          </div>
          <EventForm form={addForm} onChange={setAddForm} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleAdd} disabled={pending || !addForm.name.trim()} style={{ ...btnSave, opacity: pending || !addForm.name.trim() ? .65 : 1 }}>
              {pending ? 'Saving…' : 'Add Event'}
            </button>
            <button onClick={() => { setShowAdd(false); setAddForm(emptyForm); }} style={btnCancel}>Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <button onClick={() => setShowAdd(true)} style={btnSave}>+ Add Event</button>
        </div>
      )}
    </div>
  );
}
