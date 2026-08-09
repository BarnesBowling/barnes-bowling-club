'use client';

import { useState, useTransition } from 'react';

type EventRow = {
  id: string;
  title: string;
  event_date: string | null;
  description: string | null;
  category: string | null;
  is_tbc: boolean;
  bank_holiday: boolean;
  day_label: string | null;
  location: string | null;
  visibility: string | null;
};

type Props = {
  initialEvents: EventRow[];
  addEvent: (formData: FormData) => Promise<void>;
  updateEvent: (formData: FormData) => Promise<void>;
  deleteEvent: (formData: FormData) => Promise<void>;
};

const CATEGORIES = ['competition', 'match', 'social', 'external', 'admin', 'deadline'];
const CATEGORY_LABELS: Record<string, string> = {
  competition: 'Competition',
  match: 'Match',
  social: 'Social',
  external: 'External',
  admin: 'Admin',
  deadline: 'Deadline',
};
const CATEGORY_COLORS: Record<string, string> = {
  competition: '#1a6e3a',
  match: '#2d5a8e',
  social: '#8e5a2d',
  external: '#5a2d8e',
  admin: '#555',
  deadline: '#c00',
};

function fmtDate(iso: string | null): string {
  if (!iso) return 'TBC';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const inputS: React.CSSProperties = {
  padding: '.6rem .75rem',
  border: '1px solid rgba(45,90,61,.2)',
  fontFamily: 'inherit',
  fontSize: '14px',
  width: '100%',
  boxSizing: 'border-box',
};
const labelS: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: 'var(--gold)',
  display: 'block',
  marginBottom: '5px',
};
const btnEdit: React.CSSProperties = {
  background: 'none',
  border: '1px solid rgba(45,90,61,.25)',
  padding: '5px 12px',
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '.06em',
  color: 'var(--green-mid)',
  textTransform: 'uppercase',
};
const btnCancel: React.CSSProperties = {
  background: 'none',
  border: '1px solid rgba(45,90,61,.2)',
  padding: '7px 16px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: '13px',
  color: 'var(--text-mid)',
};
const btnDel: React.CSSProperties = {
  background: 'none',
  border: '1px solid rgba(180,0,0,.25)',
  padding: '5px 12px',
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '.06em',
  color: '#a00',
  textTransform: 'uppercase',
};

function EditForm({
  title, setTitle,
  date, setDate,
  desc, setDesc,
  cat, setCat,
  dayLabel, setDayLabel,
  loc, setLoc,
  tbc, setTbc,
  onSave, onCancel, pending,
}: {
  title: string; setTitle: (v: string) => void;
  date: string; setDate: (v: string) => void;
  desc: string; setDesc: (v: string) => void;
  cat: string; setCat: (v: string) => void;
  dayLabel: string; setDayLabel: (v: string) => void;
  loc: string; setLoc: (v: string) => void;
  tbc: boolean; setTbc: (v: boolean) => void;
  onSave: () => void; onCancel: () => void; pending: boolean;
}) {
  return (
    <div style={{ padding: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={labelS}>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} style={inputS} />
        </div>
        <div>
          <label style={labelS}>Category</label>
          <select value={cat} onChange={e => setCat(e.target.value)} style={{ ...inputS, cursor: 'pointer' }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={labelS}>Date &amp; time</label>
          <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} style={inputS} />
        </div>
        <div>
          <label style={labelS}>Day label</label>
          <input value={dayLabel} onChange={e => setDayLabel(e.target.value)} style={inputS} placeholder="Sat" />
        </div>
        <div>
          <label style={labelS}>Location</label>
          <input value={loc} onChange={e => setLoc(e.target.value)} style={inputS} placeholder="e.g. Sun Inn" />
        </div>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={labelS}>Description</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} style={{ ...inputS, minHeight: '72px', resize: 'vertical' }} />
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--green-deep)', marginBottom: '1.25rem', cursor: 'pointer' }}>
        <input type="checkbox" checked={tbc} onChange={e => setTbc(e.target.checked)} />
        Date TBC
      </label>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={onSave} disabled={pending || !title.trim()} className="btn" style={{ fontSize: '13px', opacity: pending ? .65 : 1 }}>
          Save
        </button>
        <button onClick={onCancel} style={btnCancel}>Cancel</button>
      </div>
    </div>
  );
}

export function EventsAdmin({ initialEvents, addEvent, updateEvent, deleteEvent }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [eTitle, setETitle] = useState('');
  const [eDate, setEDate] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [eCat, setECat] = useState('competition');
  const [eDayLabel, setEDayLabel] = useState('');
  const [eLoc, setELoc] = useState('');
  const [eTbc, setETbc] = useState(false);

  const [aTitle, setATitle] = useState('');
  const [aDate, setADate] = useState('');
  const [aDesc, setADesc] = useState('');
  const [aCat, setACat] = useState('competition');
  const [aDayLabel, setADayLabel] = useState('');
  const [aLoc, setALoc] = useState('');
  const [aTbc, setATbc] = useState(false);

  function startEditing(ev: EventRow) {
    setEditingId(ev.id);
    setETitle(ev.title);
    setEDate(toDatetimeLocal(ev.event_date));
    setEDesc(ev.description ?? '');
    setECat(ev.category ?? 'competition');
    setEDayLabel(ev.day_label ?? '');
    setELoc(ev.location ?? '');
    setETbc(ev.is_tbc);
    setMsg(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function handleSave(id: string) {
    const fd = new FormData();
    fd.set('id', id);
    fd.set('title', eTitle);
    fd.set('event_date', eDate);
    fd.set('description', eDesc);
    fd.set('category', eCat);
    fd.set('day_label', eDayLabel);
    fd.set('location', eLoc);
    if (eTbc) fd.set('is_tbc', '1');
    startTransition(async () => {
      try {
        await updateEvent(fd);
        setEditingId(null);
        setMsg({ ok: true, text: 'Event updated.' });
      } catch {
        setMsg({ ok: false, text: 'Save failed — please try again.' });
      }
    });
  }

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const fd = new FormData();
    fd.set('id', id);
    startTransition(async () => {
      try {
        await deleteEvent(fd);
        setMsg({ ok: true, text: `"${title}" deleted.` });
      } catch {
        setMsg({ ok: false, text: 'Delete failed — please try again.' });
      }
    });
  }

  function handleAdd() {
    const fd = new FormData();
    fd.set('title', aTitle);
    fd.set('event_date', aDate);
    fd.set('description', aDesc);
    fd.set('category', aCat);
    fd.set('day_label', aDayLabel);
    fd.set('location', aLoc);
    if (aTbc) fd.set('is_tbc', '1');
    startTransition(async () => {
      try {
        await addEvent(fd);
        setShowAdd(false);
        setATitle(''); setADate(''); setADesc(''); setACat('competition');
        setADayLabel(''); setALoc(''); setATbc(false);
        setMsg({ ok: true, text: 'Event added.' });
      } catch {
        setMsg({ ok: false, text: 'Add failed — please try again.' });
      }
    });
  }

  return (
    <div>
      {msg && (
        <div style={{
          padding: '10px 14px', marginBottom: '1rem',
          fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
          background: msg.ok ? 'rgba(45,90,61,.08)' : 'rgba(192,0,0,.06)',
          borderLeft: `3px solid ${msg.ok ? 'var(--green-mid)' : '#c00'}`,
          color: msg.ok ? 'var(--green-deep)' : '#900',
        }}>
          {msg.text}
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        {!showAdd ? (
          <button onClick={() => { setShowAdd(true); setMsg(null); }} className="btn" style={{ fontSize: '13px' }}>
            + Add event
          </button>
        ) : (
          <div style={{ background: 'white', border: '2px solid rgba(45,90,61,.2)', marginBottom: '0' }}>
            <div style={{ padding: '1rem 1.25rem 0', fontWeight: 600, color: 'var(--green-deep)', fontFamily: "'Playfair Display', serif", fontSize: '15px' }}>
              New event
            </div>
            <EditForm
              title={aTitle} setTitle={setATitle}
              date={aDate} setDate={setADate}
              desc={aDesc} setDesc={setADesc}
              cat={aCat} setCat={setACat}
              dayLabel={aDayLabel} setDayLabel={setADayLabel}
              loc={aLoc} setLoc={setALoc}
              tbc={aTbc} setTbc={setATbc}
              onSave={handleAdd}
              onCancel={() => setShowAdd(false)}
              pending={pending}
            />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
        {initialEvents.map(ev => (
          <div key={ev.id} style={{ background: 'white', border: '1px solid rgba(45,90,61,.1)' }}>
            {editingId === ev.id ? (
              <EditForm
                title={eTitle} setTitle={setETitle}
                date={eDate} setDate={setEDate}
                desc={eDesc} setDesc={setEDesc}
                cat={eCat} setCat={setECat}
                dayLabel={eDayLabel} setDayLabel={setEDayLabel}
                loc={eLoc} setLoc={setELoc}
                tbc={eTbc} setTbc={setETbc}
                onSave={() => handleSave(ev.id)}
                onCancel={cancelEdit}
                pending={pending}
              />
            ) : (
              <div style={{ padding: '0.9rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--green-deep)', fontFamily: "'Playfair Display', serif", fontSize: '15px' }}>
                      {ev.title}
                    </span>
                    {ev.is_tbc && (
                      <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '.1em', color: 'var(--text-muted)', border: '1px solid rgba(0,0,0,.18)', padding: '1px 5px' }}>TBC</span>
                    )}
                    {ev.category && (
                      <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: CATEGORY_COLORS[ev.category] ?? '#555' }}>
                        {CATEGORY_LABELS[ev.category] ?? ev.category}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
                    {fmtDate(ev.event_date)}
                    {ev.day_label ? ` · ${ev.day_label}` : ''}
                    {ev.location ? ` · ${ev.location}` : ''}
                  </div>
                  {ev.description && (
                    <div style={{ fontSize: '12px', color: 'var(--text-mid)', fontFamily: "'Libre Baskerville', serif", fontStyle: 'italic', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '520px' }}>
                      {ev.description}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, alignItems: 'center' }}>
                  <button onClick={() => startEditing(ev)} style={btnEdit}>Edit</button>
                  <button onClick={() => handleDelete(ev.id, ev.title)} disabled={pending} style={btnDel}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {initialEvents.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '14px' }}>No events found.</p>
        )}
      </div>
    </div>
  );
}
