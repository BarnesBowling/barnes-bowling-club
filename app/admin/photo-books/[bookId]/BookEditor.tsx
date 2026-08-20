'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { uploadPhoto, addPage, deletePage, reorderPages, updateCaption, updateBook } from './actions';

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
  photos: { src: string; caption?: string }[];
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

  const [addUrl, setAddUrl] = useState('');
  const [addCaption, setAddCaption] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [savingCaption, setSavingCaption] = useState<Record<string, boolean>>({});
  const [deletingPage, setDeletingPage] = useState<Record<string, boolean>>({});
  const [pages, setPages] = useState(initialPages);
  const [reordering, setReordering] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);

  useEffect(() => {
    setPages(initialPages);
  }, [initialPages]);

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

  async function handleAddByUrl() {
    const url = addUrl.trim();
    if (!url) return;
    setAdding(true);
    setAddError(null);
    const { error } = await addPage(book.id, url, addCaption.trim() || undefined);
    setAdding(false);
    if (error) {
      setAddError(error);
    } else {
      setAddUrl('');
      setAddCaption('');
      router.refresh();
    }
  }

  async function savePageOrder(nextPages: DbPhotoBookPage[]) {
    setPages(nextPages);
    setReordering(true);
    setReorderError(null);

    const result = await reorderPages(book.id, nextPages.map(page => page.id));
    setReordering(false);

    if (result.error) {
      setReorderError(result.error);
    }
    router.refresh();
  }

  async function handlePositionChange(pageId: string, requestedPosition: number) {
    if (reordering || pages.length < 2) return;

    const fromIndex = pages.findIndex(page => page.id === pageId);
    if (fromIndex === -1) return;

    const clampedPosition = Math.min(Math.max(requestedPosition, 1), pages.length);
    const toIndex = clampedPosition - 1;
    if (fromIndex === toIndex) return;

    const nextPages = [...pages];
    const [movedPage] = nextPages.splice(fromIndex, 1);
    nextPages.splice(toIndex, 0, movedPage);
    await savePageOrder(nextPages);
  }

  async function handleDrop(targetPageId: string) {
    if (!draggedPageId || draggedPageId === targetPageId || reordering) {
      setDraggedPageId(null);
      return;
    }

    const fromIndex = pages.findIndex(page => page.id === draggedPageId);
    const toIndex = pages.findIndex(page => page.id === targetPageId);
    if (fromIndex === -1 || toIndex === -1) {
      setDraggedPageId(null);
      return;
    }

    const nextPages = [...pages];
    const [movedPage] = nextPages.splice(fromIndex, 1);
    nextPages.splice(toIndex, 0, movedPage);
    setDraggedPageId(null);
    await savePageOrder(nextPages);
  }

  async function handleDelete(pageId: string) {
    if (!window.confirm('Delete this page? This cannot be undone.')) return;
    setDeletingPage(prev => ({ ...prev, [pageId]: true }));
    await deletePage(pageId);
    setDeletingPage(prev => ({ ...prev, [pageId]: false }));
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

      {/* ── Add page from URL ── */}
      <section>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-deep)', marginBottom: '1.25rem' }}>
          Add page from URL
        </h2>
        <div style={{
          background: 'white',
          border: '1px solid rgba(45,90,61,.12)',
          padding: '1.75rem',
          maxWidth: '480px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <div>
            <label style={labelStyle}>Image URL or path (added to end of book)</label>
            <input
              value={addUrl}
              onChange={e => setAddUrl(e.target.value)}
              placeholder="/archive/years-photos/2026/page-01.jpg"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Caption (optional)</label>
            <input
              value={addCaption}
              onChange={e => setAddCaption(e.target.value)}
              placeholder="e.g. Club dinner, July 2026"
              style={inputStyle}
            />
          </div>
          {addError && <p style={{ color: '#a00', fontSize: '13px', margin: 0 }}>{addError}</p>}
          <button
            onClick={handleAddByUrl}
            disabled={adding || !addUrl.trim()}
            style={{ ...btnStyle, opacity: (adding || !addUrl.trim()) ? 0.6 : 1, alignSelf: 'flex-start' }}
          >
            {adding ? 'Adding…' : 'Add page'}
          </button>
        </div>
      </section>

      {/* ── Pages list ── */}
      <section>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-deep)', marginBottom: '.35rem' }}>
          Pages ({pages.length})
        </h2>
        <p style={{ margin: '0 0 1.25rem', fontSize: '13px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
          Drag a page using the ☰ handle, or type the position number you want.
          {reordering && <span> Saving order…</span>}
        </p>
        {reorderError && (
          <p style={{ color: '#a00', fontSize: '13px', margin: '0 0 1rem' }}>{reorderError}</p>
        )}

        {pages.length === 0 && (
          <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
            No pages yet — upload a photo above to add the first page.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pages.map((page, i) => {
            const src = page.photos[0]?.src ?? '';
            const caption = page.photos[0]?.caption ?? '';
            const isDragging = draggedPageId === page.id;

            return (
              <div
                key={page.id}
                onDragOver={e => {
                  if (!reordering && draggedPageId) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }
                }}
                onDrop={e => {
                  e.preventDefault();
                  void handleDrop(page.id);
                }}
                style={{
                  background: 'white',
                  border: draggedPageId && !isDragging
                    ? '1px solid rgba(45,90,61,.28)'
                    : '1px solid rgba(45,90,61,.12)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  opacity: isDragging ? 0.5 : 1,
                }}
              >
                {/* Drag handle */}
                <div
                  draggable={!reordering}
                  onDragStart={e => {
                    setDraggedPageId(page.id);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', page.id);
                  }}
                  onDragEnd={() => setDraggedPageId(null)}
                  title="Drag to move this page"
                  aria-label={`Drag page ${i + 1}`}
                  style={{
                    flexShrink: 0,
                    width: '30px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(45,90,61,.18)',
                    color: 'var(--green-deep)',
                    background: '#fff',
                    borderRadius: '2px',
                    cursor: reordering ? 'wait' : 'grab',
                    fontSize: '20px',
                    lineHeight: 1,
                    userSelect: 'none',
                  }}
                >
                  ☰
                </div>

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <PositionInput
                      position={i + 1}
                      max={pages.length}
                      disabled={reordering}
                      onMove={position => void handlePositionChange(page.id, position)}
                    />
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
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => handleDelete(page.id)}
                    disabled={deletingPage[page.id] ?? false}
                    style={{ ...deleteBtnStyle, opacity: (deletingPage[page.id] ?? false) ? 0.6 : 1 }}
                  >
                    Delete
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
  position,
  max,
  disabled,
  onMove,
}: {
  position: number;
  max: number;
  disabled: boolean;
  onMove: (position: number) => void;
}) {
  const [value, setValue] = useState(String(position));

  useEffect(() => {
    setValue(String(position));
  }, [position]);

  function applyPosition() {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) {
      setValue(String(position));
      return;
    }
    const nextPosition = Math.min(Math.max(parsed, 1), max);
    setValue(String(nextPosition));
    if (nextPosition !== position) onMove(nextPosition);
  }

  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)' }}>
      Position
      <input
        type="number"
        min={1}
        max={max}
        value={value}
        disabled={disabled}
        onChange={e => setValue(e.target.value)}
        onBlur={applyPosition}
        onKeyDown={e => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') {
            setValue(String(position));
            e.currentTarget.blur();
          }
        }}
        style={{
          width: '54px',
          padding: '4px 5px',
          border: '1px solid rgba(45,90,61,.22)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '12px',
          color: 'var(--green-deep)',
          textAlign: 'center',
          background: disabled ? '#f3f1ec' : 'white',
        }}
      />
    </label>
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
