'use client';

import { useState, useRef } from 'react';
import type { ClubMember } from '@/app/admin/club-members/AdminClubMembersClient';
import { updateClubMember } from '@/app/admin/club-members/actions';
import type { MemberPayload } from '@/app/admin/club-members/actions';
import { emailStatement } from './statement/emailActions';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  memberId: string;
  initialMember: ClubMember;
  initialPhotoUrl: string | null;
  onClose?: () => void;
  onMemberUpdated?: (m: ClubMember) => void;
  onPhotoUploaded?: (id: string, url: string, path: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
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

function memberToForm(m: ClubMember): MemberPayload {
  return {
    full_name:               m.full_name ?? '',
    email:                   m.email ?? '',
    membership_number:       m.membership_number ?? '',
    handicap:                m.handicap ?? 0,
    status:                  m.status ?? 'active',
    joined_date:             m.joined_date ?? '',
    notes:                   m.notes ?? '',
    phone:                   m.phone ?? '',
    address_line1:           m.address_line1 ?? '',
    address_line2:           m.address_line2 ?? '',
    city:                    m.city ?? '',
    postcode:                m.postcode ?? '',
    emergency_contact_name:  m.emergency_contact_name ?? '',
    emergency_contact_phone: m.emergency_contact_phone ?? '',
    has_key:                 m.has_key ?? false,
    card_issued:             m.card_issued ?? false,
    card_issued_date:        m.card_issued_date ?? '',
  };
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  active:       { background: 'rgba(45,90,61,.12)',   color: '#2d5a3d' },
  inactive:     { background: 'rgba(0,0,0,.07)',      color: '#666' },
  probationary: { background: 'rgba(201,168,76,.18)', color: '#7a6040' },
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 9px',
      fontSize: '10px',
      fontWeight: 700,
      letterSpacing: '.08em',
      textTransform: 'uppercase' as const,
      fontFamily: "'DM Sans', sans-serif",
      ...(STATUS_STYLES[status] ?? STATUS_STYLES.active),
    }}>
      {status}
    </span>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const INPUT: React.CSSProperties = {
  height: '36px',
  padding: '0 8px',
  border: '1.5px solid rgba(45,90,61,.2)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  color: '#1b3b26',
  background: '#fff',
  width: '100%',
  boxSizing: 'border-box',
};

const DT: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '9px',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '.1em',
  color: '#c9a84c',
  marginBottom: '2px',
  display: 'block',
};

const DD: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '13px',
  color: '#1b3b26',
  margin: 0,
  marginBottom: '0.7rem',
  lineHeight: 1.45,
};

const BTN_PRIMARY: React.CSSProperties = {
  background: '#1b3b26',
  color: '#fff',
  border: 'none',
  padding: '0 16px',
  height: '34px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '.08em',
  textTransform: 'uppercase' as const,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
};

const BTN_SECONDARY: React.CSSProperties = {
  background: '#fff',
  color: '#1b3b26',
  border: '1.5px solid rgba(45,90,61,.3)',
  padding: '0 16px',
  height: '34px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '.08em',
  textTransform: 'uppercase' as const,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
};

// ── Component ─────────────────────────────────────────────────────────────────

export function MemberIndexCard({
  memberId,
  initialMember,
  initialPhotoUrl,
  onClose,
  onMemberUpdated,
  onPhotoUploaded,
}: Props) {
  const [member, setMember]                   = useState<ClubMember>(initialMember);
  const [photoUrl, setPhotoUrl]               = useState<string | null>(initialPhotoUrl);
  const [editing, setEditing]                 = useState(false);
  const [form, setForm]                       = useState<MemberPayload>(memberToForm(initialMember));
  const [saving, setSaving]                   = useState(false);
  const [saveErr, setSaveErr]                 = useState<string | null>(null);
  const [photoUploading, setPhotoUploading]   = useState(false);
  const [photoErr, setPhotoErr]               = useState<string | null>(null);
  const [emailBusy, setEmailBusy]             = useState(false);
  const [emailResult, setEmailResult]         = useState<{ ok: boolean; msg: string } | null>(null);
  const fileInputRef                          = useRef<HTMLInputElement>(null);

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true);
    setSaveErr(null);
    try {
      await updateClubMember(memberId, form);
      const updated: ClubMember = {
        ...member,
        full_name:               (form.full_name ?? '').trim(),
        email:                   (form.email ?? '').trim() || null,
        membership_number:       (form.membership_number ?? '').trim() || null,
        handicap:                form.handicap ?? member.handicap,
        status:                  (form.status ?? member.status) as ClubMember['status'],
        joined_date:             form.joined_date || null,
        notes:                   (form.notes ?? '').trim() || null,
        phone:                   (form.phone ?? '').trim() || null,
        address_line1:           (form.address_line1 ?? '').trim() || null,
        address_line2:           (form.address_line2 ?? '').trim() || null,
        city:                    (form.city ?? '').trim() || null,
        postcode:                (form.postcode ?? '').trim() || null,
        emergency_contact_name:  (form.emergency_contact_name ?? '').trim() || null,
        emergency_contact_phone: (form.emergency_contact_phone ?? '').trim() || null,
      };
      setMember(updated);
      onMemberUpdated?.(updated);
      setEditing(false);
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : 'Save failed — please try again.');
    } finally {
      setSaving(false);
    }
  }

  function startEdit() {
    setForm(memberToForm(member));
    setSaveErr(null);
    setEditing(true);
  }

  function handleCancel() {
    setForm(memberToForm(member));
    setSaveErr(null);
    setEditing(false);
  }

  // ── Photo upload ──────────────────────────────────────────────────────────

  async function handlePhotoFile(file: File) {
    setPhotoUploading(true);
    setPhotoErr(null);
    try {
      const blob = await resizeImage(file, 600);
      const fd = new FormData();
      fd.append('id', memberId);
      fd.append('photo', new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
      const res = await fetch('/api/admin/member-photo', { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      const json = await res.json() as { signedUrl?: string; path?: string };
      const url = json.signedUrl ?? '';
      const path = json.path ?? '';
      setPhotoUrl(url || null);
      const updated = { ...member, photo_id_filename: path };
      setMember(updated);
      onMemberUpdated?.(updated);
      onPhotoUploaded?.(memberId, url, path);
    } catch (e) {
      setPhotoErr(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setPhotoUploading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const addrParts = [
    member.address_line1,
    member.address_line2,
    [member.city, member.postcode].filter(Boolean).join('  '),
  ].filter(Boolean);

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .bbc-member-card, .bbc-member-card * { visibility: visible; }
          .bbc-member-card {
            position: fixed; top: 0; left: 0;
            width: 100%; max-width: none !important;
            box-shadow: none !important;
            background-color: #faf7f0 !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div
        className="bbc-member-card"
        style={{
          backgroundColor: '#faf7f0',
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(27,59,38,.065) 27px, rgba(27,59,38,.065) 28px)',
          boxShadow: '0 2px 16px rgba(0,0,0,.12), 0 1px 3px rgba(0,0,0,.07)',
          maxWidth: '720px',
          width: '100%',
        }}
      >

        {/* ── Header strip ── */}
        <div style={{
          background: '#1b3b26',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '22px',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {member.full_name}
            </div>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px',
              color: '#c9a84c',
              textTransform: 'uppercase',
              letterSpacing: '.12em',
              marginTop: '4px',
            }}>
              {member.membership_number ?? 'No membership number'}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <StatusBadge status={member.status} />
            {onClose && (
              <button
                onClick={onClose}
                className="no-print"
                aria-label="Close"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,.75)',
                  fontSize: '20px',
                  lineHeight: 1,
                  cursor: 'pointer',
                  padding: '2px 4px',
                  marginLeft: '4px',
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

          {/* Info column */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <dl style={{ margin: 0 }}>

              {/* Status + handicap */}
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '0.7rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div>
                  <dt style={DT}>Status</dt>
                  <dd style={{ ...DD, marginBottom: 0 }}>
                    {editing ? (
                      <select
                        value={form.status}
                        onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                        style={{ ...INPUT, width: '150px', cursor: 'pointer' }}
                      >
                        <option value="active">Active</option>
                        <option value="probationary">Probationary</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    ) : (
                      <StatusBadge status={member.status} />
                    )}
                  </dd>
                </div>
                <div>
                  <dt style={DT}>Handicap</dt>
                  <dd style={{ ...DD, marginBottom: 0 }}>
                    {editing ? (
                      <input
                        type="number"
                        min={-20}
                        max={20}
                        value={form.handicap}
                        onChange={e => setForm(f => ({ ...f, handicap: parseInt(e.target.value, 10) || 0 }))}
                        style={{ ...INPUT, width: '80px' }}
                      />
                    ) : (
                      member.handicap > 0 ? `+${member.handicap}` : String(member.handicap)
                    )}
                  </dd>
                </div>
                {editing && (
                  <div>
                    <dt style={DT}>Membership No.</dt>
                    <dd style={{ ...DD, marginBottom: 0 }}>
                      <input
                        value={form.membership_number}
                        onChange={e => setForm(f => ({ ...f, membership_number: e.target.value }))}
                        style={{ ...INPUT, width: '140px' }}
                        placeholder="BBCXXX"
                      />
                    </dd>
                  </div>
                )}
              </div>

              {/* Joined */}
              <div>
                <dt style={DT}>Joined</dt>
                <dd style={DD}>
                  {editing ? (
                    <input
                      type="date"
                      value={form.joined_date}
                      onChange={e => setForm(f => ({ ...f, joined_date: e.target.value }))}
                      style={{ ...INPUT, width: '180px' }}
                    />
                  ) : (
                    fmtDate(member.joined_date)
                  )}
                </dd>
              </div>

              {/* Email */}
              <div>
                <dt style={DT}>Email</dt>
                <dd style={DD}>
                  {editing ? (
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      style={INPUT}
                      placeholder="email@example.com"
                    />
                  ) : member.email ? (
                    <a
                      href={`mailto:${member.email}`}
                      style={{ color: '#1b3b26', textDecoration: 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                      onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                    >
                      {member.email}
                    </a>
                  ) : (
                    <span style={{ color: 'rgba(27,59,38,.35)' }}>—</span>
                  )}
                </dd>
              </div>

              {/* Mobile */}
              <div>
                <dt style={DT}>Mobile</dt>
                <dd style={DD}>
                  {editing ? (
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      style={INPUT}
                      placeholder="07xxx xxxxxx"
                    />
                  ) : member.phone ? (
                    <a href={`tel:${member.phone}`} style={{ color: '#1b3b26', textDecoration: 'none' }}>
                      {member.phone}
                    </a>
                  ) : (
                    <span style={{ color: 'rgba(27,59,38,.35)' }}>—</span>
                  )}
                </dd>
              </div>

              {/* Address */}
              <div>
                <dt style={DT}>Address</dt>
                <dd style={DD}>
                  {editing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <input
                        value={form.address_line1}
                        onChange={e => setForm(f => ({ ...f, address_line1: e.target.value }))}
                        style={INPUT}
                        placeholder="Address line 1"
                      />
                      <input
                        value={form.address_line2}
                        onChange={e => setForm(f => ({ ...f, address_line2: e.target.value }))}
                        style={INPUT}
                        placeholder="Address line 2 (optional)"
                      />
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input
                          value={form.city}
                          onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                          style={{ ...INPUT, flex: 1 }}
                          placeholder="City"
                        />
                        <input
                          value={form.postcode}
                          onChange={e => setForm(f => ({ ...f, postcode: e.target.value }))}
                          style={{ ...INPUT, width: '100px', flex: 'none' }}
                          placeholder="Postcode"
                        />
                      </div>
                    </div>
                  ) : addrParts.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                      {addrParts.map((line, i) => <span key={i}>{line}</span>)}
                    </div>
                  ) : (
                    <span style={{ color: 'rgba(27,59,38,.35)' }}>—</span>
                  )}
                </dd>
              </div>

              {/* Emergency contact */}
              <div>
                <dt style={DT}>Emergency Contact</dt>
                <dd style={DD}>
                  {editing ? (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <input
                        value={form.emergency_contact_name}
                        onChange={e => setForm(f => ({ ...f, emergency_contact_name: e.target.value }))}
                        style={{ ...INPUT, flex: '1 1 160px' }}
                        placeholder="Name"
                      />
                      <input
                        type="tel"
                        value={form.emergency_contact_phone}
                        onChange={e => setForm(f => ({ ...f, emergency_contact_phone: e.target.value }))}
                        style={{ ...INPUT, flex: '1 1 140px' }}
                        placeholder="Phone"
                      />
                    </div>
                  ) : member.emergency_contact_name ? (
                    <>
                      {member.emergency_contact_name}
                      {member.emergency_contact_phone && (
                        <>
                          {' · '}
                          <a href={`tel:${member.emergency_contact_phone}`} style={{ color: '#1b3b26', textDecoration: 'none' }}>
                            {member.emergency_contact_phone}
                          </a>
                        </>
                      )}
                    </>
                  ) : (
                    <span style={{ color: 'rgba(27,59,38,.35)' }}>—</span>
                  )}
                </dd>
              </div>

              {/* Key & card — always read-only */}
              <div>
                <dt style={DT}>Key &amp; Card</dt>
                <dd style={{ ...DD, marginBottom: '0.25rem' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#c9a84c' }}>🗝 Key</span>
                      <span style={{ fontWeight: 700, color: member.has_key ? '#2d5a3d' : '#c0392b', fontSize: '14px' }}>
                        {member.has_key ? '✓' : '✗'}
                      </span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#c9a84c' }}>Card</span>
                      <span style={{ fontWeight: 700, color: member.card_issued ? '#2d5a3d' : '#c0392b', fontSize: '14px' }}>
                        {member.card_issued ? '✓' : '✗'}
                      </span>
                      {member.card_issued && member.card_issued_date && (
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#888' }}>
                          ({fmtDate(member.card_issued_date)})
                        </span>
                      )}
                    </span>
                  </div>
                  {editing && (
                    <div style={{ marginTop: '4px', fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#999', fontStyle: 'italic' }}>
                      Key &amp; card managed via the roster toggles.
                    </div>
                  )}
                </dd>
              </div>

            </dl>

            {/* Notes */}
            <div style={{ marginTop: '0.5rem' }}>
              <div style={DT}>Notes</div>
              <textarea
                readOnly={!editing}
                value={editing ? form.notes : (member.notes ?? '')}
                onChange={editing ? e => setForm(f => ({ ...f, notes: e.target.value })) : undefined}
                rows={3}
                placeholder={editing ? 'Add notes…' : undefined}
                style={{
                  width: '100%',
                  boxSizing: 'border-box' as const,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  color: '#1b3b26',
                  lineHeight: 1.55,
                  resize: editing ? ('vertical' as const) : ('none' as const),
                  minHeight: '52px',
                  padding: editing ? '6px 8px' : '2px 0',
                  border: editing ? '1.5px solid rgba(45,90,61,.2)' : 'none',
                  background: editing ? '#fff' : 'transparent',
                  outline: 'none',
                }}
              />
            </div>

            {/* Error */}
            {saveErr && (
              <div style={{
                marginTop: '0.75rem',
                padding: '8px 12px',
                background: 'rgba(192,57,43,.06)',
                borderLeft: '3px solid #c0392b',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                color: '#c0392b',
              }}>
                {saveErr}
              </div>
            )}

            {/* Action buttons */}
            <div className="no-print" style={{ marginTop: '1.25rem', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {editing ? (
                <>
                  <button onClick={handleSave} disabled={saving} style={{ ...BTN_PRIMARY, opacity: saving ? .65 : 1 }}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={handleCancel} disabled={saving} style={BTN_SECONDARY}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button onClick={startEdit} style={BTN_PRIMARY}>Edit</button>
                  <button onClick={() => window.print()} style={BTN_SECONDARY}>Print card</button>
                  <a
                    href={`/admin/members/${memberId}/statement`}
                    style={{
                      ...BTN_SECONDARY,
                      borderColor: '#c9a84c',
                      color: '#c9a84c',
                      textDecoration: 'none',
                    }}
                  >
                    View statement →
                  </a>
                  <button
                    onClick={async () => {
                      setEmailBusy(true);
                      setEmailResult(null);
                      try {
                        const res = await emailStatement(memberId);
                        setEmailResult(res.ok
                          ? { ok: true, msg: 'Statement sent ✓' }
                          : { ok: false, msg: res.error ?? 'Failed to send.' }
                        );
                        if (res.ok) setTimeout(() => setEmailResult(null), 4000);
                      } catch (e) {
                        setEmailResult({ ok: false, msg: e instanceof Error ? e.message : 'Unexpected error.' });
                      } finally {
                        setEmailBusy(false);
                      }
                    }}
                    disabled={emailBusy || !member.email}
                    title={!member.email ? 'No email address on file' : 'Email statement to member'}
                    style={{
                      ...BTN_SECONDARY,
                      borderColor: '#c9a84c',
                      color: '#c9a84c',
                      opacity: (emailBusy || !member.email) ? 0.55 : 1,
                      cursor: !member.email ? 'not-allowed' : emailBusy ? 'wait' : 'pointer',
                    }}
                  >
                    {emailBusy ? 'Sending…' : 'Email statement'}
                  </button>
                  {emailResult && (
                    <span style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '12px',
                      color: emailResult.ok ? '#2d6e42' : '#b03232',
                      fontWeight: 500,
                      alignSelf: 'center',
                    }}>
                      {emailResult.msg}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Photo column */}
          <div style={{ width: '96px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '96px',
              height: '128px',
              borderRadius: '3px',
              border: '2px solid rgba(45,90,61,.15)',
              overflow: 'hidden',
              background: '#e8e5e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt={member.full_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                />
              ) : (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ opacity: .3 }}>
                  <circle cx="12" cy="8" r="4" fill="#1b3b26" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="#1b3b26" />
                </svg>
              )}
            </div>

            <button
              className="no-print"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoUploading}
              style={{
                background: 'none',
                border: '1px solid rgba(45,90,61,.22)',
                color: '#1b3b26',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '10px',
                letterSpacing: '.03em',
                padding: '3px 7px',
                cursor: photoUploading ? 'default' : 'pointer',
                opacity: photoUploading ? .6 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {photoUploading ? '…' : photoUrl ? 'Replace' : 'Upload photo'}
            </button>

            {photoErr && (
              <div style={{ fontSize: '10px', color: '#c0392b', fontFamily: "'DM Sans', sans-serif", textAlign: 'center', lineHeight: 1.3 }}>
                {photoErr}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={async e => {
                const file = e.target.files?.[0];
                if (file) await handlePhotoFile(file);
                e.target.value = '';
              }}
            />
          </div>

        </div>
      </div>
    </>
  );
}
