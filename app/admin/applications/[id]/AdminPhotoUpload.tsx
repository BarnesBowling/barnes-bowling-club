'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

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

export function AdminPhotoUpload({ applicationId, hasPhoto }: { applicationId: string; hasPhoto: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const resized = await resizeImage(file, 600);
      const fd = new FormData();
      fd.set('id', applicationId);
      fd.set('photo', new File([resized], 'photo.jpg', { type: 'image/jpeg' }));
      const res = await fetch('/api/admin/application-photo', { method: 'POST', body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? 'Upload failed');
      }
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
        disabled={busy}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        style={{
          width: '100%',
          padding: '.65rem 1rem',
          background: 'transparent',
          color: busy ? 'rgba(45,90,61,.45)' : 'var(--green-deep)',
          border: '1px solid rgba(45,90,61,.35)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          cursor: busy ? 'wait' : 'pointer',
          transition: 'color .15s, border-color .15s',
        }}
      >
        {busy ? 'Uploading…' : hasPhoto ? 'Replace Photo' : 'Upload Photo'}
      </button>
      {err && (
        <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#c03a2b', fontFamily: "'DM Sans', sans-serif" }}>
          {err}
        </p>
      )}
    </div>
  );
}
