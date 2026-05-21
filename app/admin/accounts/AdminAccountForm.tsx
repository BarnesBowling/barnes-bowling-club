'use client';

import { useState, useEffect, useRef } from 'react';
import { addTransaction } from './actions';

const GUEST_FEE_RATE = 5.00;

const CATEGORY_LABELS: Record<string, string> = {
  membership_fee: 'Membership Fee',
  guest_fee:      'Guest Fee',
  event_fee:      'Event Fee',
  manser_fee:     'Manser Fee',
  wrong_bias_fee: 'Wrong Bias Fee',
  miscellaneous:  'Miscellaneous',
  payment:        'Payment',
};

interface ClubMemberOption {
  id: string;
  full_name: string;
  membership_number: string | null;
}

interface Props {
  members: ClubMemberOption[];
  today: string;
}

function MemberCombobox({ members, inputStyle }: { members: ClubMemberOption[]; inputStyle: React.CSSProperties }) {
  const [query,    setQuery]    = useState('');
  const [open,     setOpen]     = useState(false);
  const [selected, setSelected] = useState<ClubMemberOption | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim().length === 0
    ? members
    : members.filter(m =>
        m.full_name.toLowerCase().includes(query.toLowerCase()) ||
        (m.membership_number ?? '').toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  function choose(m: ClubMemberOption) {
    setSelected(m);
    setQuery(`${m.full_name}${m.membership_number ? ` — ${m.membership_number}` : ''}`);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        type="text"
        name="club_member_lookup"
        role="combobox"
        inputMode="search"
        autoComplete="new-password"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-expanded={open}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-controls="member-combobox-listbox"
        placeholder="Type to search member…"
        value={query}
        style={inputStyle}
        onChange={e => { setQuery(e.target.value); setSelected(null); setOpen(true); }}
        onFocus={() => setOpen(true)}
      />
      <input type="hidden" name="member_id" value={selected?.id ?? ''} />
      {open && filtered.length > 0 && (
        <div
          id="member-combobox-listbox"
          role="listbox"
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            background: '#fff', border: '1px solid rgba(45,90,61,.25)', borderTop: 'none',
            maxHeight: '240px', overflowY: 'auto', zIndex: 100,
            boxShadow: '0 4px 16px rgba(0,0,0,.1)',
          }}
        >
          {filtered.map(m => (
            <div
              key={m.id}
              role="option"
              aria-selected={selected?.id === m.id}
              onMouseDown={() => choose(m)}
              style={{
                padding: '8px 12px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
                color: 'var(--green-deep)', cursor: 'pointer',
                background: selected?.id === m.id ? 'rgba(45,90,61,.08)' : 'transparent',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(45,90,61,.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = selected?.id === m.id ? 'rgba(45,90,61,.08)' : 'transparent'; }}
            >
              <span style={{ fontWeight: 500 }}>{m.full_name}</span>
              {m.membership_number && (
                <span style={{ marginLeft: '8px', fontSize: '11px', color: 'rgba(45,90,61,.5)', fontFamily: 'monospace' }}>
                  {m.membership_number}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminAccountForm({ members, today }: Props) {
  const [category,     setCategory]     = useState('');
  const [type,         setType]         = useState('debit');
  const [numGuests,    setNumGuests]    = useState(1);
  const [costPerGuest, setCostPerGuest] = useState(GUEST_FEE_RATE);
  const [dateOfPlay,   setDateOfPlay]   = useState(today);
  const [guestNotes,   setGuestNotes]   = useState('');
  const [metadataJson, setMetadataJson] = useState('');

  const isGuestFee = category === 'guest_fee';
  const guestTotal = isGuestFee ? (numGuests * costPerGuest) : 0;

  useEffect(() => {
    if (!isGuestFee) { setMetadataJson(''); return; }
    setMetadataJson(JSON.stringify({
      type: 'guest_fee', num_guests: numGuests, cost_per_guest: costPerGuest,
      date_of_play: dateOfPlay, notes: guestNotes || null,
    }));
  }, [isGuestFee, numGuests, costPerGuest, dateOfPlay, guestNotes]);

  const inp: React.CSSProperties = {
    padding: '.65rem .75rem', border: '1px solid rgba(45,90,61,.2)',
    fontFamily: 'inherit', fontSize: '14px', width: '100%', background: '#fff', boxSizing: 'border-box',
  };
  const inpRO: React.CSSProperties = { ...inp, background: 'rgba(45,90,61,.05)', color: 'var(--green-deep)', fontWeight: 600 };
  const lbl: React.CSSProperties = {
    fontSize: '10px', fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase',
    color: 'var(--gold)', display: 'block', marginBottom: '6px',
  };

  return (
    <form
      action={addTransaction}
      autoComplete="off"
      style={{ background: '#fff', border: '1px solid rgba(45,90,61,.12)', padding: '2rem', maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      <div>
        <label style={lbl}>Member</label>
        <MemberCombobox members={members} inputStyle={inp} />
      </div>
      <div>
        <label style={lbl}>Date</label>
        <input name="date" type="date" required defaultValue={today} style={inp} />
      </div>
      <div>
        <label style={lbl}>Type</label>
        <select name="type" required style={inp} value={type} onChange={e => setType(e.target.value)}>
          <option value="debit">Debit (charge to member)</option>
          <option value="credit">Credit (payment received)</option>
        </select>
      </div>
      <div>
        <label style={lbl}>Category</label>
        <select name="category" required style={inp} value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Select category…</option>
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>
      {isGuestFee && (
        <div style={{ background: 'rgba(45,90,61,.04)', border: '1px solid rgba(45,90,61,.15)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green-deep)' }}>
            Guest Fee Details
          </div>
          <div>
            <label style={lbl}>Date of Play</label>
            <input type="date" required style={inp} value={dateOfPlay} onChange={e => setDateOfPlay(e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={lbl}>No. of Guests</label>
              <input type="number" required min={1} max={20} step={1} style={inp} value={numGuests} onChange={e => setNumGuests(Math.max(1, parseInt(e.target.value) || 1))} />
            </div>
            <div>
              <label style={lbl}>Cost Per Guest (£)</label>
              <input type="number" required min={0.01} step={0.01} style={inp} value={costPerGuest} onChange={e => setCostPerGuest(parseFloat(e.target.value) || GUEST_FEE_RATE)} />
            </div>
            <div>
              <label style={lbl}>Total Charge</label>
              <input type="text" readOnly style={inpRO} value={`£${guestTotal.toFixed(2)}`} />
            </div>
          </div>
          <div>
            <label style={lbl}>Notes (optional)</label>
            <input type="text" style={inp} placeholder="e.g. Guest names, occasion" value={guestNotes} onChange={e => setGuestNotes(e.target.value)} autoComplete="off" />
          </div>
          <input type="hidden" name="metadata_json" value={metadataJson} />
        </div>
      )}
      <div>
        <label style={lbl}>Description</label>
        <input name="description" type="text" required placeholder={isGuestFee ? `e.g. Guest fee — ${numGuests} guest${numGuests !== 1 ? 's' : ''}, ${dateOfPlay}` : 'e.g. Annual membership 2026'} style={inp} autoComplete="off" />
      </div>
      <div>
        <label style={lbl}>Amount (£)</label>
        {isGuestFee ? (
          <>
            <input type="text" readOnly style={inpRO} value={guestTotal.toFixed(2)} />
            <input type="hidden" name="amount" value={guestTotal.toFixed(2)} />
          </>
        ) : (
          <input name="amount" type="number" required min="0.01" step="0.01" placeholder="0.00" style={inp} />
        )}
      </div>
      <button className="btn" style={{ alignSelf: 'flex-start' }}>Post transaction</button>
    </form>
  );
}
