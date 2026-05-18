'use client';

import { useState, useEffect } from 'react';
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

interface Member {
  member_email: string;
  first_name: string | null;
  last_name: string | null;
}

interface Props {
  members: Member[];
  today: string;
}

export function AdminAccountForm({ members, today }: Props) {
  const [category,      setCategory]     = useState('');
  const [type,          setType]         = useState('debit');
  const [numGuests,     setNumGuests]    = useState(1);
  const [costPerGuest,  setCostPerGuest] = useState(GUEST_FEE_RATE);
  const [dateOfPlay,    setDateOfPlay]   = useState(today);
  const [guestNotes,    setGuestNotes]   = useState('');
  const [metadataJson,  setMetadataJson] = useState('');

  const isGuestFee = category === 'guest_fee';
  const guestTotal = isGuestFee ? (numGuests * costPerGuest) : 0;

  // Keep metadata_json in sync whenever guest fee fields change
  useEffect(() => {
    if (!isGuestFee) { setMetadataJson(''); return; }
    setMetadataJson(JSON.stringify({
      type:           'guest_fee',
      num_guests:     numGuests,
      cost_per_guest: costPerGuest,
      date_of_play:   dateOfPlay,
      notes:          guestNotes || null,
    }));
  }, [isGuestFee, numGuests, costPerGuest, dateOfPlay, guestNotes]);

  const inp: React.CSSProperties = {
    padding: '.65rem .75rem',
    border: '1px solid rgba(45,90,61,.2)',
    fontFamily: 'inherit',
    fontSize: '14px',
    width: '100%',
    background: '#fff',
  };
  const inpRO: React.CSSProperties = { ...inp, background: 'rgba(45,90,61,.05)', color: 'var(--green-deep)', fontWeight: 600 };
  const lbl: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '.12em',
    textTransform: 'uppercase',
    color: 'var(--gold)',
    display: 'block',
    marginBottom: '6px',
  };

  return (
    <form
      action={addTransaction}
      style={{ background: '#fff', border: '1px solid rgba(45,90,61,.12)', padding: '2rem', maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      {/* Member */}
      <div>
        <label style={lbl}>Member</label>
        <select name="member_email" required style={inp}>
          <option value="">Select member…</option>
          {members.map(m => (
            <option key={m.member_email} value={m.member_email}>
              {m.first_name} {m.last_name} — {m.member_email}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label style={lbl}>Date</label>
        <input name="date" type="date" required defaultValue={today} style={inp} />
      </div>

      {/* Type */}
      <div>
        <label style={lbl}>Type</label>
        <select name="type" required style={inp} value={type} onChange={e => setType(e.target.value)}>
          <option value="debit">Debit (charge to member)</option>
          <option value="credit">Credit (payment received)</option>
        </select>
      </div>

      {/* Category */}
      <div>
        <label style={lbl}>Category</label>
        <select
          name="category"
          required
          style={inp}
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">Select category…</option>
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* ── Guest fee extra fields ── */}
      {isGuestFee && (
        <div style={{ background: 'rgba(45,90,61,.04)', border: '1px solid rgba(45,90,61,.15)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green-deep)', marginBottom: '2px' }}>
            Guest Fee Details
          </div>

          {/* Date of play */}
          <div>
            <label style={lbl}>Date of Play</label>
            <input
              type="date"
              required
              style={inp}
              value={dateOfPlay}
              onChange={e => setDateOfPlay(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            {/* Number of guests */}
            <div>
              <label style={lbl}>No. of Guests</label>
              <input
                type="number"
                required
                min={1}
                max={20}
                step={1}
                style={inp}
                value={numGuests}
                onChange={e => setNumGuests(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            {/* Cost per guest */}
            <div>
              <label style={lbl}>Cost Per Guest (£)</label>
              <input
                type="number"
                required
                min={0.01}
                step={0.01}
                style={inp}
                value={costPerGuest}
                onChange={e => setCostPerGuest(parseFloat(e.target.value) || GUEST_FEE_RATE)}
              />
            </div>

            {/* Total (read-only) */}
            <div>
              <label style={lbl}>Total Charge</label>
              <input
                type="text"
                readOnly
                style={inpRO}
                value={`£${guestTotal.toFixed(2)}`}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={lbl}>Notes (optional)</label>
            <input
              type="text"
              style={inp}
              placeholder="e.g. Guest names, occasion"
              value={guestNotes}
              onChange={e => setGuestNotes(e.target.value)}
            />
          </div>

          {/* Hidden metadata */}
          <input type="hidden" name="metadata_json" value={metadataJson} />
        </div>
      )}

      {/* Description */}
      <div>
        <label style={lbl}>Description</label>
        <input
          name="description"
          type="text"
          required
          placeholder={isGuestFee ? `e.g. Guest fee — ${numGuests} guest${numGuests !== 1 ? 's' : ''}, ${dateOfPlay}` : 'e.g. Annual membership 2026'}
          style={inp}
        />
      </div>

      {/* Amount — auto-filled and read-only for guest fee */}
      <div>
        <label style={lbl}>Amount (£)</label>
        {isGuestFee ? (
          <>
            <input
              type="text"
              readOnly
              style={inpRO}
              value={guestTotal.toFixed(2)}
            />
            <input type="hidden" name="amount" value={guestTotal.toFixed(2)} />
          </>
        ) : (
          <input name="amount" type="number" required min="0.01" step="0.01" placeholder="0.00" style={inp} />
        )}
      </div>

      <button className="btn" style={{ alignSelf: 'flex-start' }}>
        Post transaction
      </button>
    </form>
  );
}
