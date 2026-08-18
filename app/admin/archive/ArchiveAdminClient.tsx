'use client';

import { useState } from 'react';
import { updateArchiveRole, addArchiveRole } from './actions';

interface ArchiveRow {
  id: string;
  role_type: string;
  year: number;
  name: string;
  note: string | null;
}

const thStyle: React.CSSProperties = {
  padding: '8px 10px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  textAlign: 'left',
  borderBottom: '2px solid rgba(45,90,61,.12)',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderBottom: '1px solid rgba(45,90,61,.06)',
  verticalAlign: 'middle',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  border: '1px solid rgba(45,90,61,.2)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  color: 'var(--text-dark)',
  background: '#fff',
  boxSizing: 'border-box',
};

const btnSave: React.CSSProperties = {
  padding: '4px 12px',
  background: 'var(--green-mid)',
  color: '#fff',
  border: 'none',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

function RoleTable({
  rows,
  roleType,
  onSaved,
}: {
  rows: ArchiveRow[];
  roleType: 'president' | 'captain';
  onSaved: (id: string, name: string, note: string) => void;
}) {
  const [edits, setEdits] = useState<Record<string, { name: string; note: string }>>(() =>
    Object.fromEntries(rows.map(r => [r.id, { name: r.name, note: r.note ?? '' }]))
  );
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [msgs, setMsgs] = useState<Record<string, { ok: boolean; text: string }>>({});

  // Add-year form state
  const [addYear, setAddYear] = useState('');
  const [addName, setAddName] = useState('');
  const [addNote, setAddNote] = useState('');
  const [addPending, setAddPending] = useState(false);
  const [addMsg, setAddMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function setEdit(id: string, field: 'name' | 'note', value: string) {
    setEdits(e => ({ ...e, [id]: { ...e[id], [field]: value } }));
  }

  async function save(row: ArchiveRow) {
    const edit = edits[row.id];
    setSaving(s => ({ ...s, [row.id]: true }));
    const res = await updateArchiveRole(row.id, edit.name, edit.note);
    setSaving(s => ({ ...s, [row.id]: false }));
    if (res.error) {
      setMsgs(m => ({ ...m, [row.id]: { ok: false, text: res.error! } }));
    } else {
      setMsgs(m => ({ ...m, [row.id]: { ok: true, text: 'Saved' } }));
      onSaved(row.id, edit.name, edit.note);
      setTimeout(() => setMsgs(m => { const n = { ...m }; delete n[row.id]; return n; }), 2000);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const yr = parseInt(addYear, 10);
    if (!yr || yr < 1800 || yr > 2100) {
      setAddMsg({ ok: false, text: 'Enter a valid year' });
      return;
    }
    setAddPending(true);
    const res = await addArchiveRole(roleType, yr, addName, addNote);
    setAddPending(false);
    if (res.error) {
      setAddMsg({ ok: false, text: res.error });
    } else {
      setAddMsg({ ok: true, text: `${yr} added — reload to see it in the list` });
      setAddYear(''); setAddName(''); setAddNote('');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Add year */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', flexWrap: 'wrap', background: 'rgba(45,90,61,.04)', padding: '1rem', border: '1px solid rgba(45,90,61,.1)' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>Year</div>
          <input type="number" value={addYear} onChange={e => setAddYear(e.target.value)} placeholder="2027" min="1800" max="2100" required style={{ ...inputStyle, width: '90px' }} />
        </div>
        <div style={{ flex: '1 1 160px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>Name</div>
          <input type="text" value={addName} onChange={e => setAddName(e.target.value)} placeholder="Full name (or leave blank for TBD)" style={inputStyle} />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '4px' }}>Note (optional)</div>
          <input type="text" value={addNote} onChange={e => setAddNote(e.target.value)} placeholder="e.g. Stepped down mid-season" style={inputStyle} />
        </div>
        <button type="submit" disabled={addPending} style={{ ...btnSave, padding: '7px 18px', opacity: addPending ? .6 : 1 }}>
          {addPending ? 'Adding…' : 'Add year'}
        </button>
        {addMsg && (
          <span style={{ fontSize: '12px', color: addMsg.ok ? 'var(--green-mid)' : '#c00', alignSelf: 'center' }}>{addMsg.text}</span>
        )}
      </form>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: '480px' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: '60px' }}>Year</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Note</th>
              <th style={{ ...thStyle, width: '70px' }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const edit = edits[row.id] ?? { name: row.name, note: row.note ?? '' };
              const isDirty = edit.name !== row.name || edit.note !== (row.note ?? '');
              const isSaving = saving[row.id];
              const msg = msgs[row.id];
              return (
                <tr key={row.id} style={{ background: isDirty ? 'rgba(168,149,96,.05)' : undefined }}>
                  <td style={{ ...tdStyle, fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600, color: 'var(--gold)', width: '60px' }}>
                    {row.year}
                  </td>
                  <td style={{ ...tdStyle }}>
                    <input
                      value={edit.name}
                      onChange={e => setEdit(row.id, 'name', e.target.value)}
                      style={{ ...inputStyle, background: isDirty ? '#fffdf5' : '#fff' }}
                    />
                  </td>
                  <td style={{ ...tdStyle }}>
                    <input
                      value={edit.note}
                      onChange={e => setEdit(row.id, 'note', e.target.value)}
                      placeholder="Optional note"
                      style={{ ...inputStyle, background: isDirty ? '#fffdf5' : '#fff', color: 'var(--text-muted)' }}
                    />
                  </td>
                  <td style={{ ...tdStyle, width: '70px' }}>
                    {msg ? (
                      <span style={{ fontSize: '11px', color: msg.ok ? 'var(--green-mid)' : '#c00' }}>{msg.text}</span>
                    ) : (
                      <button
                        onClick={() => save(row)}
                        disabled={isSaving || !isDirty}
                        style={{ ...btnSave, opacity: isSaving || !isDirty ? .45 : 1 }}
                      >
                        {isSaving ? '…' : 'Save'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ArchiveAdminClient({
  presidents,
  captains,
}: {
  presidents: ArchiveRow[];
  captains: ArchiveRow[];
}) {
  const [tab, setTab] = useState<'president' | 'captain'>('president');
  const [presRows, setPresRows] = useState(presidents);
  const [capRows, setCapRows] = useState(captains);

  function handlePresSaved(id: string, name: string, note: string) {
    setPresRows(rows => rows.map(r => r.id === id ? { ...r, name, note: note || null } : r));
  }
  function handleCapSaved(id: string, name: string, note: string) {
    setCapRows(rows => rows.map(r => r.id === id ? { ...r, name, note: note || null } : r));
  }

  const tabBtn = (t: 'president' | 'captain'): React.CSSProperties => ({
    padding: '8px 24px',
    background: tab === t ? 'var(--green-deep)' : 'white',
    color: tab === t ? 'var(--cream)' : 'var(--green-deep)',
    border: '1px solid rgba(45,90,61,.2)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '.08em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        <button style={tabBtn('president')} onClick={() => setTab('president')}>
          Presidents ({presRows.length})
        </button>
        <button style={tabBtn('captain')} onClick={() => setTab('captain')}>
          Captains ({capRows.length})
        </button>
      </div>

      {tab === 'president' && (
        <RoleTable rows={presRows} roleType="president" onSaved={handlePresSaved} />
      )}
      {tab === 'captain' && (
        <RoleTable rows={capRows} roleType="captain" onSaved={handleCapSaved} />
      )}
    </div>
  );
}
