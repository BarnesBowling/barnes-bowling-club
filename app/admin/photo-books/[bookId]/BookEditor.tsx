'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { uploadPhoto, addPage, deletePage, deletePhoto, reorderPage, updateCaption, updatePhotoStyle, updateBook } from './actions';

export interface DbPhotoBook {
  id: string;
  title: string;
  spine_colour: string;
  single_page: boolean;
  sort_order: number;
}

export interface DbPhotoBookPage {
  id: string;
  book_id: string;
  sort_order: number;
  layout: string;
  page_title: string | null;
  page_subtitle: string | null;
  shared_caption: string | null;
  photos: { src: string; caption?: string; captionFont?: string; captionSize?: string; objectPosition?: string }[];
}

interface Props {
  book: DbPhotoBook;
  pages: DbPhotoBookPage[];
}

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: 'var(--gold)',
  display: 'block',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  padding: '.65rem',
  border: '1px solid rgba(45,90,61,.2)',
  fontFamily: 'inherit',
  fontSize: '14px',
  width: '100%',
  boxSizing: 'border-box',
};

const btnStyle: React.CSSProperties = {
  padding: '7px 14px',
  border: 'none',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '.05em',
  cursor: 'pointer',
  background: 'var(--green-deep)',
  color: '#fff',
};


const deleteBtnStyle: React.CSSProperties = {
  padding: '4px 10px',
  border: '1px solid rgba(180,0,0,.25)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '11px',
  fontWeight: 600,
  cursor: 'pointer',
  background: 'white',
  color: '#a00',
};

export function BookEditor({ book, pages: initialPages }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(book.title);
  const [spineColour, setSpineColour] = useState(book.spine_colour);
  const [metaSaving, startMetaSave] = useTransition();
  const [metaError, setMetaError] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [savingCaption, setSavingCaption] = useState<Record<string, boolean>>({});
  const [reorderingPage, setReorderingPage] = useState<Record<string, boolean>>({});
  const [deletingPage, setDeletingPage] = useState<Record<string, boolean>>({});
  const [deletingPhoto, setDeletingPhoto] = useState<Record<string, boolean>>({});
  const [savingStyle, setSavingStyle] = useState<Record<string, boolean>>({});

  const pages = initialPages;

  function handleSaveMeta() {
    setMetaError(null);
    startMetaSave(async () => {
      const result = await updateBook(book.id, title, spineColour);
      if (result.error) {
        setMetaError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);

    const fd = new FormData();
    fd.append('file', file);
    fd.append('bookId', book.id);

    const { url, error: upErr } = await uploadPhoto(fd);
    if (upErr || !url) {
      setUploadError(upErr ?? 'Upload failed');
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    const { error: pageErr } = await addPage(book.id, url);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
    if (pageErr) {
      setUploadError(pageErr);
    } else {
      router.refresh();
    }
  }

  async function handleReorder(pageId: string, newPosition: number) {
    setReorderingPage(prev => ({ ...prev, [pageId]: true }));
    await reorderPage(pageId, newPosition);
    setReorderingPage(prev => ({ ...prev, [pageId]: false }));
    router.refresh();
  }

  async function handleDelete(pageId: string) {
    if (!window.confirm('Delete this page? This cannot be undone.')) return;
    setDeletingPage(prev => ({ ...prev, [pageId]: true }));
    await deletePage(pageId);
    setDeletingPage(prev => ({ ...prev, [pageId]: false }));
    router.refresh();
  }

  async function handleStyleChange(pageId: string, photoIndex: number, style: { captionFont?: string; captionSize?: string; objectPosition?: string }) {
    setSavingStyle(prev => ({ ...prev, [pageId]: true }));
    await updatePhotoStyle(pageId, photoIndex, style);
    setSavingStyle(prev => ({ ...prev, [pageId]: false }));
    router.refresh();
  }

  async function handleDeletePhoto(pageId: string, photoIndex: number) {
    const key = `${pageId}:${photoIndex}`;
    if (!window.confirm('Delete this photo? This cannot be undone.')) return;
    setDeletingPhoto(prev => ({ ...prev, [key]: true }));
    await deletePhoto(pageId, photoIndex);
    setDeletingPhoto(prev => ({ ...prev, [key]: false }));
    router.refresh();
  }

  async function handleCaptionBlur(pageId: string, caption: string) {
    setSavingCaption(prev => ({ ...prev, [pageId]: true }));
    await updateCaption(pageId, caption);
    setSavingCaption(prev => ({ ...prev, [pageId]: false }));
    router.refresh();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

      {/* ── Book metadata ── */}
      <section>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-deep)', marginBottom: '1.25rem' }}>
          Book details
        </h2>
        <div style={{
          background: 'white',
          border: '1px solid rgba(45,90,61,.12)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxWidth: '480px',
        }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Spine colour</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="color"
                value={spineColour}
                onChange={e => setSpineColour(e.target.value)}
                style={{ width: '48px', height: '36px', padding: '2px', border: '1px solid rgba(45,90,61,.2)', cursor: 'pointer' }}
              />
              <div style={{
                width: '36px',
                height: '36px',
                background: spineColour,
                border: '1px solid rgba(0,0,0,.15)',
                borderRadius: '2px',
              }} />
              <span style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-muted)' }}>{spineColour}</span>
            </div>
          </div>
          {metaError && <p style={{ color: '#a00', fontSize: '13px', margin: 0 }}>{metaError}</p>}
          <button
            onClick={handleSaveMeta}
            disabled={metaSaving}
            style={{ ...btnStyle, opacity: metaSaving ? 0.6 : 1, alignSelf: 'flex-start' }}
          >
            {metaSaving ? 'Saving…' : 'Save details'}
          </button>
        </div>
      </section>

      {/* ── Upload new photo ── */}
      <section>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-deep)', marginBottom: '1.25rem' }}>
          Upload new photo
        </h2>
        <div style={{
          background: 'white',
          border: '1px solid rgba(45,90,61,.12)',
          padding: '1.75rem',
          maxWidth: '480px',
        }}>
          <label style={labelStyle}>Choose image (added to end of book)</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleFileChange}
            style={{
              display: 'block',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: 'var(--text-muted)',
              cursor: uploading ? 'not-allowed' : 'pointer',
            }}
          />
          {uploading && (
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '16px', height: '16px',
                border: '2px solid rgba(45,90,61,.2)',
                borderTopColor: 'var(--green-deep)',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
                Uploading…
              </span>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}
          {uploadError && (
            <p style={{ color: '#a00', fontSize: '13px', margin: '0.5rem 0 0' }}>{uploadError}</p>
          )}
        </div>
      </section>

      {/* ── Pages list ── */}
      <section>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-deep)', marginBottom: '1.25rem' }}>
          Pages ({pages.length})
        </h2>

        {pages.length === 0 && (
          <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
            No pages yet — upload a photo above to add the first page.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pages.map((page, i) => {
            const src = page.photos[0]?.src ?? '';
            const caption = page.photos[0]?.caption ?? '';

            return (
              <div
                key={page.id}
                style={{
                  background: 'white',
                  border: '1px solid rgba(45,90,61,.12)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                {/* Thumbnail */}
                <div style={{ flexShrink: 0, width: '80px', height: '80px', overflow: 'hidden', background: '#f0ece4', borderRadius: '2px' }}>
                  {src && (
                    <img
                      src={src}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  )}
                </div>

                {/* Info + caption */}
                <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
                      #{i + 1}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '.08em',
                      textTransform: 'uppercase',
                      color: 'rgba(255,255,255,0.9)',
                      background: 'var(--green-deep)',
                      padding: '1px 7px',
                      borderRadius: '2px',
                    }}>
                      {page.layout}
                    </span>
                  </div>
                  <CaptionInput
                    pageId={page.id}
                    initialCaption={caption}
                    saving={savingCaption[page.id] ?? false}
                    onSave={handleCaptionBlur}
                  />
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '9px', marginBottom: '3px' }}>Font</label>
                      <select
                        value={page.photos[0]?.captionFont ?? "'Libre Baskerville', serif"}
                        onChange={e => handleStyleChange(page.id, 0, { captionFont: e.target.value })}
                        style={{ padding: '3px 5px', border: '1px solid rgba(45,90,61,.2)', fontFamily: 'inherit', fontSize: '11px' }}
                      >
                        <option value="'Libre Baskerville', serif">Libre Baskerville</option>
                        <option value="'Playfair Display', serif">Playfair Display</option>
                        <option value="'DM Sans', sans-serif">DM Sans</option>
                        <option value="'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif">Optima</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '9px', marginBottom: '3px' }}>Font Size</label>
                      <select
                        value={page.photos[0]?.captionSize ?? '11px'}
                        onChange={e => handleStyleChange(page.id, 0, { captionSize: e.target.value })}
                        style={{ padding: '3px 5px', border: '1px solid rgba(45,90,61,.2)', fontFamily: 'inherit', fontSize: '11px' }}
                      >
                        <option value="10px">10px</option>
                        <option value="11px">11px</option>
                        <option value="12px">12px</option>
                        <option value="14px">14px</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: '9px', marginBottom: '3px' }}>Position of Photos</label>
                      <select
                        value={page.photos[0]?.objectPosition ?? 'center top'}
                        onChange={e => handleStyleChange(page.id, 0, { objectPosition: e.target.value })}
                        style={{ padding: '3px 5px', border: '1px solid rgba(45,90,61,.2)', fontFamily: 'inherit', fontSize: '11px' }}
                      >
                        <option value="center top">Top</option>
                        <option value="center center">Center</option>
                        <option value="center bottom">Bottom</option>
                      </select>
                    </div>
                    {(savingStyle[page.id] ?? false) && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', paddingBottom: '3px' }}>saving…</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
                  <PositionInput
                    pageId={page.id}
                    currentPosition={i + 1}
                    total={pages.length}
                    reordering={reorderingPage[page.id] ?? false}
                    onReorder={handleReorder}
                  />
                  {src && (
                    <button
                      onClick={() => handleDeletePhoto(page.id, 0)}
                      disabled={deletingPhoto[`${page.id}:0`] ?? false}
                      style={{ ...deleteBtnStyle, opacity: (deletingPhoto[`${page.id}:0`] ?? false) ? 0.6 : 1 }}
                    >
                      Del Photo
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(page.id)}
                    disabled={deletingPage[page.id] ?? false}
                    style={{ ...deleteBtnStyle, opacity: (deletingPage[page.id] ?? false) ? 0.6 : 1 }}
                  >
                    Delete Page
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function PositionInput({
  pageId,
  currentPosition,
  total,
  reordering,
  onReorder,
}: {
  pageId: string;
  currentPosition: number;
  total: number;
  reordering: boolean;
  onReorder: (pageId: string, newPosition: number) => void;
}) {
  const [value, setValue] = useState(String(currentPosition));

  useEffect(() => {
    setValue(String(currentPosition));
  }, [currentPosition]);

  function commit() {
    const n = parseInt(value, 10);
    if (!isNaN(n) && n >= 1 && n <= total && n !== currentPosition) {
      onReorder(pageId, n);
    } else {
      setValue(String(currentPosition));
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif", letterSpacing: '.05em' }}>#</span>
      <input
        type="number"
        min={1}
        max={total}
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur(); }}
        disabled={reordering}
        title={`Page position (1–${total})`}
        style={{
          width: '44px',
          padding: '3px 5px',
          border: '1px solid rgba(45,90,61,.25)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '12px',
          textAlign: 'center',
          opacity: reordering ? 0.5 : 1,
        }}
      />
    </div>
  );
}

function CaptionInput({
  pageId,
  initialCaption,
  saving,
  onSave,
}: {
  pageId: string;
  initialCaption: string;
  saving: boolean;
  onSave: (pageId: string, caption: string) => void;
}) {
  const [value, setValue] = useState(initialCaption);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={() => onSave(pageId, value)}
        placeholder="Caption (optional)"
        style={{
          padding: '.4rem .6rem',
          border: '1px solid rgba(45,90,61,.2)',
          fontFamily: "'Libre Baskerville', serif",
          fontStyle: 'italic',
          fontSize: '13px',
          flex: 1,
          color: 'var(--text-mid)',
        }}
      />
      {saving && (
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>saving…</span>
      )}
    </div>
  );
}
