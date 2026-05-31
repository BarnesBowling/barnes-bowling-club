'use client';

import { useEffect, useRef, useState } from 'react';
import { getImagesByContext, deleteImage, updateImageMeta, reorderImages, type SiteImage } from '@/lib/images';

export default function AdminGalleryPage() {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setImages(await getImagesByContext('gallery'));
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setUploadError(null);

    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('context', 'gallery');
        const res = await fetch('/api/admin/gallery-upload', { method: 'POST', body: fd });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Upload failed (${res.status})`);
        }
      }
      await load();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleDelete(img: SiteImage) {
    if (!confirm('Delete this image?')) return;
    await deleteImage(img.id, img.storage_path);
    setImages(prev => prev.filter(i => i.id !== img.id));
  }

  async function handleCaption(img: SiteImage, caption: string) {
    await updateImageMeta(img.id, { caption });
    setImages(prev => prev.map(i => i.id === img.id ? { ...i, caption } : i));
  }

  function onDragStart(id: string) {
    setDragId(id);
  }

  function onDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;

    setImages(prev => {
      const arr = [...prev];
      const from = arr.findIndex(i => i.id === dragId);
      const to = arr.findIndex(i => i.id === targetId);

      if (from === -1 || to === -1) return prev;

      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  }

  async function onDrop() {
    if (dragId) {
      await reorderImages(images.map(i => i.id));
    }
    setDragId(null);
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <a
          href="/admin"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            color: 'var(--green-mid)',
            textDecoration: 'none',
          }}
        >
          ← Back to Admin
        </a>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '28px',
            color: 'var(--green-deep)',
            margin: '0.5rem 0 0.25rem',
          }}
        >
          Gallery Images
        </h1>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            color: 'var(--text-muted)',
            margin: 0,
          }}
        >
          Upload, reorder, and manage photos shown on the public Gallery page. Drag to reorder.
        </p>
      </div>

      {uploadError && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem 1rem',
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          color: '#b91c1c',
        }}>
          <strong>Upload failed:</strong> {uploadError}
        </div>
      )}

      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '0.6rem 1.25rem',
            background: 'var(--green-deep)',
            color: 'white',
            border: 'none',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            cursor: uploading ? 'wait' : 'pointer',
            opacity: uploading ? 0.7 : 1,
          }}
        >
          {uploading ? 'Uploading…' : '+ Upload Photos'}
        </button>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            color: 'var(--text-muted)',
          }}
        >
          {images.length} image{images.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'var(--text-muted)' }}>Loading…</p>
      ) : images.length === 0 ? (
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'var(--text-muted)' }}>
          No gallery images yet. Upload some above.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {images.map(img => (
            <div
              key={img.id}
              draggable
              onDragStart={() => onDragStart(img.id)}
              onDragOver={e => onDragOver(e, img.id)}
              onDrop={onDrop}
              style={{
                border: dragId === img.id ? '2px solid var(--green-deep)' : '1px solid #e5e7eb',
                borderRadius: '14px',
                overflow: 'hidden',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ position: 'relative', paddingTop: '66.66%', overflow: 'hidden', background: '#f8fafc' }}>
                <img
                  src={img.public_url}
                  alt={img.caption ?? 'Gallery image'}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '0.85rem 0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <textarea
                  value={img.caption ?? ''}
                  onChange={e => handleCaption(img, e.target.value)}
                  placeholder="Add a caption"
                  style={{
                    width: '100%',
                    minHeight: '70px',
                    resize: 'vertical',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    padding: '0.65rem',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '14px',
                    color: '#111827',
                  }}
                />
                <button
                  onClick={() => handleDelete(img)}
                  style={{
                    padding: '0.55rem 1rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
