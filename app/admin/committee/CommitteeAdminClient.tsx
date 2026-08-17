'use client';

import { useState, useRef, useEffect } from 'react';
import { getPhotoUploadUrl, saveOfficerPhoto, deleteOfficerPhoto } from './actions';

interface Officer {
  id: string;
  name: string;
  role: string;
  group_name: string;
  sort_order: number;
  photo_filename: string | null;
  photo_storage_path: string | null;
  photo_public_url: string | null;
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
const btnUpload: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '0 12px', height: '28px',
  background: 'var(--green-mid)', color: '#fff', border: 'none',
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

function photoSrc(o: Officer): string | undefined {
  if (o.photo_public_url) return o.photo_public_url;
  if (o.photo_filename) return `/committee/${o.photo_filename}`;
  return undefined;
}

function photoSourceLabel(o: Officer): string {
  if (o.photo_public_url) return 'Storage';
  if (o.photo_filename) return 'Legacy file';
  return 'None';
}

function Silhouette() {
  return (
    <div style={{ width: '44px', height: '44px', borderRadius: '4px', background: 'var(--green-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,.35)" strokeWidth="1.5" style={{ width: 22, height: 22 }}>
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    </div>
  );
}

export function CommitteeAdminClient({ initialOfficers }: { initialOfficers: Officer[] }) {
  const [officers, setOfficers] = useState(initialOfficers);
  useEffect(() => setOfficers(initialOfficers), [initialOfficers]);
  const [pendingIds, setPendingIds] = useState<Record<string, 'uploading' | 'deleting'>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const activeIdRef = useRef<string | null>(null);

  function showMsg(ok: boolean, text: string) {
    setMsg({ ok, text });
    if (ok) setTimeout(() => setMsg(null), 4000);
  }

  function markPending(id: string, state: 'uploading' | 'deleting') {
    setPendingIds(p => ({ ...p, [id]: state }));
  }
  function clearPending(id: string) {
    setPendingIds(p => { const n = { ...p }; delete n[id]; return n; });
  }

  function triggerUpload(officerId: string) {
    activeIdRef.current = officerId;
    if (fileRef.current) { fileRef.current.value = ''; fileRef.current.click(); }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const officerId = activeIdRef.current;
    if (!file || !officerId) return;

    markPending(officerId, 'uploading');
    try {
      const urls = await getPhotoUploadUrl(officerId, file.name);
      if (urls.error) { showMsg(false, urls.error); return; }

      const res = await fetch(urls.signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'image/jpeg' },
        duplex: 'half',
      } as RequestInit);
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

      const saved = await saveOfficerPhoto(officerId, urls.storagePath);
      if (saved.error) { showMsg(false, saved.error); return; }

      setOfficers(prev => prev.map(o =>
        o.id === officerId
          ? { ...o, photo_storage_path: saved.storagePath, photo_public_url: saved.publicUrl }
          : o
      ));
      showMsg(true, 'Photo updated.');
    } catch (err) {
      showMsg(false, err instanceof Error ? err.message : 'Upload failed');
    } finally {
      clearPending(officerId);
    }
  }

  async function handleDelete(o: Officer) {
    if (!o.photo_storage_path) return;
    if (!confirm(`Remove ${o.name}'s photo from storage?`)) return;
    markPending(o.id, 'deleting');
    try {
      const res = await deleteOfficerPhoto(o.id, o.photo_storage_path);
      if (res.error) { showMsg(false, res.error); return; }
      setOfficers(prev => prev.map(x =>
        x.id === o.id ? { ...x, photo_storage_path: null, photo_public_url: null } : x
      ));
      showMsg(true, `Photo removed for ${o.name}.`);
    } catch (err) {
      showMsg(false, err instanceof Error ? err.message : 'Delete failed');
    } finally {
      clearPending(o.id);
    }
  }

  // Group by group_name, preserving insertion order
  const groups = officers.reduce<Record<string, Officer[]>>((acc, o) => {
    (acc[o.group_name] ??= []).push(o);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

      {msg && (
        <div style={{
          padding: '10px 14px',
          background: msg.ok ? 'rgba(45,90,61,.08)' : 'rgba(192,0,0,.06)',
          borderLeft: `4px solid ${msg.ok ? 'var(--green-mid)' : '#c00'}`,
          color: msg.ok ? 'var(--green-deep)' : '#900',
          fontFamily: "'DM Sans',sans-serif", fontSize: '13px',
        }}>
          {msg.text}
        </div>
      )}

      {Object.entries(groups).map(([groupName, members]) => (
        <div key={groupName}>
          <div style={{
            fontFamily: "'DM Sans',sans-serif", fontSize: '11px', fontWeight: 700,
            letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--green-mid)',
            marginBottom: '0.75rem',
          }}>
            {groupName}
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', minWidth: '500px' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: '56px' }}>Photo</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Source</th>
                  <th style={{ ...thStyle, width: '140px' }}></th>
                </tr>
              </thead>
              <tbody>
                {members.map(o => {
                  const src = photoSrc(o);
                  const isPending = !!pendingIds[o.id];
                  return (
                    <tr key={o.id}>
                      <td style={tdStyle}>
                        {src ? (
                          <img src={src} alt={o.name}
                            style={{ width: '44px', height: '44px', objectFit: 'cover', objectPosition: 'center top', display: 'block', borderRadius: '4px', border: '1px solid rgba(45,90,61,.1)' }}
                          />
                        ) : <Silhouette />}
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 500 }}>{o.name}</td>
                      <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>{o.role}</td>
                      <td style={{ ...tdStyle, fontSize: '11px', color: 'var(--text-muted)' }}>
                        {pendingIds[o.id] === 'uploading' ? 'Uploading…'
                          : pendingIds[o.id] === 'deleting' ? 'Removing…'
                          : photoSourceLabel(o)}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => triggerUpload(o.id)}
                            disabled={isPending}
                            style={{ ...btnUpload, opacity: isPending ? .55 : 1 }}
                          >
                            {o.photo_public_url ? 'Replace' : 'Upload'}
                          </button>
                          {o.photo_storage_path && (
                            <button
                              onClick={() => handleDelete(o)}
                              disabled={isPending}
                              style={{ ...btnDel, opacity: isPending ? .55 : 1 }}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
