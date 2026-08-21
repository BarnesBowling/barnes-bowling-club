'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  uploadPhoto, addPage, addPhotoToPage, deletePage, deletePhoto,
  reorderPage, updatePhotoStyle, updateBook,
} from './actions';
import { updatePageLayout } from './presentationActions';

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
  photos: {
    src: string;
    caption?: string;
    captionFont?: string;
    captionSize?: string;
    captionColour?: string;
    captionPosition?: 'top' | 'bottom';
    objectPosition?: string;
  }[];
}

interface Props {
  book: DbPhotoBook;
  pages: DbPhotoBookPage[];
}

type StandardLayout = 'sf-single' | 'sf-pair' | 'grid-2x2';

const LAYOUT_CAPACITY: Record<StandardLayout, number> = {
  'sf-single': 1,
  'sf-pair': 2,
  'grid-2x2': 4,
};

function standardLayout(layout: string): StandardLayout | '' {
  if (layout === 'sf-single' || layout === 'single') return 'sf-single';
  if (layout === 'sf-pair' || layout === 'two-photos') return 'sf-pair';
  if (layout === 'grid-2x2') return 'grid-2x2';
  return '';
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

const selectStyle: React.CSSProperties = {
  padding: '3px 5px',
  border: '1px solid rgba(45,90,61,.2)',
  fontFamily: 'inherit',
  fontSize: '11px',
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

  const [reorderingPage, setReorderingPage] = useState<Record<string, boolean>>({});
  const [deletingPage, setDeletingPage] = useState<Record<string, boolean>>({});
  const [deletingPhoto, setDeletingPhoto] = useState<Record<string, boolean>>({});
  const [savingStyle, setSavingStyle] = useState<Record<string, boolean>>({});
  const [savingLayout, setSavingLayout] = useState<Record<string, boolean>>({});
  const [layoutError, setLayoutError] = useState<Record<string, string | null>>({});
  const [uploadingToPage, setUploadingToPage] = useState<Record<string, boolean>>({});

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

  async function handleLayoutChange(page: DbPhotoBookPage, layout: StandardLayout) {
    const capacity = LAYOUT_CAPACITY[layout];
    if (page.photos.length > capacity) {
      setLayoutError(prev => ({
        ...prev,
        [page.id]: `This page already has ${page.photos.length} photos. Remove photos before changing to a ${capacity}-photo layout.`,
      }));
      return;
    }

    setLayoutError(prev => ({ ...prev, [page.id]: null }));
    setSavingLayout(prev => ({ ...prev, [page.id]: true }));
    const result = await updatePageLayout(page.id, layout);
    setSavingLayout(prev => ({ ...prev, [page.id]: false }));

    if (result.error) {
      setLayoutError(prev => ({ ...prev, [page.id]: result.error ?? 'Could not change layout' }));
      return;
    }
    router.refresh();
  }

  async function handleAddPhotoToPage(page: DbPhotoBookPage, file: File | null) {
    if (!file) return;
    const layout = standardLayout(page.layout);
    if (!layout) {
      setLayoutError(prev => ({ ...prev, [page.id]: 'Choose Single, 2 photos or 4 photos first.' }));
      return;
    }

    const capacity = LAYOUT_CAPACITY[layout];
    if (page.photos.length >= capacity) {
      setLayoutError(prev => ({ ...prev, [page.id]: `This layout already contains its maximum of ${capacity} photo${capacity === 1 ? '' : 's'}.` }));
      return;
    }

    setLayoutError(prev => ({ ...prev, [page.id]: null }));
    setUploadingToPage(prev => ({ ...prev, [page.id]: true }));

    const fd = new FormData();
    fd.append('file', file);
    fd.append('bookId', book.id);
    const uploaded = await uploadPhoto(fd);

    if (uploaded.error || !uploaded.url) {
      setUploadingToPage(prev => ({ ...prev, [page.id]: false }));
      setLayoutError(prev => ({ ...prev, [page.id]: uploaded.error ?? 'Upload failed' }));
      return;
    }

    const result = await addPhotoToPage(page.id, uploaded.url);
    setUploadingToPage(prev => ({ ...prev, [page.id]: false }));
    if (result.error) {
      setLayoutError(prev => ({ ...prev, [page.id]: result.error ?? 'Could not add photo to page' }));
      return;
    }
    router.refresh();
  }

  async function handleStyleChange(
    pageId: string,
    photoIndex: number,
    style: {
      caption?: string;
      captionFont?: string;
      captionSize?: string;
      captionColour?: string;
      captionPosition?: 'top' | 'bottom';
      objectPosition?: string;
    }
  ) {
    setSavingStyle(prev => ({ ...prev, [`${pageId}:${photoIndex}`]: true }));
    await updatePhotoStyle(pageId, photoIndex, style);
    setSavingStyle(prev => ({ ...prev, [`${pageId}:${photoIndex}`]: false }));
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
            <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
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
              <div style={{ width: '36px', height: '36px', background: spineColour, border: '1px solid rgba(0,0,0,.15)', borderRadius: '2px' }} />
              <span style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-muted)' }}>{spineColour}</span>
            </div>
          </div>
          {metaError && <p style={{ color: '#a00', fontSize: '13px', margin: 0 }}>{metaError}</p>}
          <button onClick={handleSaveMeta} disabled={metaSaving} style={{ ...btnStyle, opacity: metaSaving ? 0.6 : 1, alignSelf: 'flex-start' }}>
            {metaSaving ? 'Saving…' : 'Save details'}
          </button>
        </div>
      </section>

      {/* ── Upload new photo ── */}
      <section>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-deep)', marginBottom: '1.25rem' }}>
          Add page
        </h2>
        <div style={{ background: 'white', border: '1px solid rgba(45,90,61,.12)', padding: '1.75rem', maxWidth: '480px' }}>
          <label style={labelStyle}>Choose image (added as new page at end)</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleFileChange}
            style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-muted)', cursor: uploading ? 'not-allowed' : 'pointer' }}
          />
          {uploading && (
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', border: '2px solid rgba(45,90,61,.2)', borderTopColor: 'var(--green-deep)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>Uploading…</span>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}
          {uploadError && <p style={{ color: '#a00', fontSize: '13px', margin: '0.5rem 0 0' }}>{uploadError}</p>}
        </div>
      </section>

      {/* ── Pages list ── */}
      <section>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-deep)', marginBottom: '1.25rem' }}>
          Pages ({pages.length})
        </h2>

        {pages.length === 0 && (
          <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
            No pages yet — add a photo above to create the first page.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pages.map((page, i) => {
            const isCover = page.sort_order < 0;
            const currentLayout = standardLayout(page.layout);
            const currentCapacity = currentLayout ? LAYOUT_CAPACITY[currentLayout] : null;
            const canAddPhoto = !isCover && currentCapacity !== null && page.photos.length < currentCapacity;

            return (
            <div
              key={page.id}
              style={{
                background: 'white',
                border: '1px solid rgba(45,90,61,.12)',
                padding: '1rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              {/* Page header row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
                  {isCover ? 'Cover' : `#${i + 1}`}
                </span>

                {isCover ? (
                  <span style={{
                    fontSize: '10px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.9)', background: 'var(--green-deep)', padding: '3px 8px', borderRadius: '2px',
                  }}>
                    Fixed cover
                  </span>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--green-deep)' }}>
                      Page layout
                    </span>
                    <select
                      value={currentLayout}
                      disabled={savingLayout[page.id] ?? false}
                      onChange={e => handleLayoutChange(page, e.target.value as StandardLayout)}
                      style={{
                        padding: '6px 9px',
                        border: '2px solid var(--green-deep)',
                        background: '#fff',
                        color: 'var(--green-deep)',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '12px',
                        fontWeight: 700,
                        minWidth: '150px',
                        cursor: 'pointer',
                      }}
                    >
                      {!currentLayout && <option value="">Current: {page.layout}</option>}
                      <option value="sf-single" disabled={page.photos.length > 1}>Single — 1 photo</option>
                      <option value="sf-pair" disabled={page.photos.length > 2}>2 photos</option>
                      <option value="grid-2x2" disabled={page.photos.length > 4}>4 photos</option>
                    </select>
                    {(savingLayout[page.id] ?? false) && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>saving…</span>
                    )}
                  </div>
                )}

                {canAddPhoto && (
                  <label style={{
                    padding: '6px 10px',
                    background: 'var(--green-deep)',
                    color: '#fff',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: (uploadingToPage[page.id] ?? false) ? 'wait' : 'pointer',
                    opacity: (uploadingToPage[page.id] ?? false) ? .6 : 1,
                  }}>
                    {(uploadingToPage[page.id] ?? false) ? 'Uploading…' : '+ Add photo to this page'}
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingToPage[page.id] ?? false}
                      onChange={e => {
                        const input = e.currentTarget;
                        const file = input.files?.[0] ?? null;
                        void handleAddPhotoToPage(page, file).finally(() => { input.value = ''; });
                      }}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {!isCover && (
                    <PositionInput
                      pageId={page.id}
                      currentPosition={i + 1}
                      total={pages.length}
                      reordering={reorderingPage[page.id] ?? false}
                      onReorder={handleReorder}
                    />
                  )}
                  {!isCover && (
                    <button
                      onClick={() => handleDelete(page.id)}
                      disabled={deletingPage[page.id] ?? false}
                      style={{ ...deleteBtnStyle, opacity: (deletingPage[page.id] ?? false) ? 0.6 : 1 }}
                    >
                      Delete Page
                    </button>
                  )}
                </div>
              </div>

              {layoutError[page.id] && (
                <p style={{ margin: 0, color: '#a00', fontFamily: "'DM Sans', sans-serif", fontSize: '12px' }}>
                  {layoutError[page.id]}
                </p>
              )}

              {/* Per-photo rows */}
              {page.photos.map((photo, pi) => {
                const styleKey = `${page.id}:${pi}`;
                const isSavingStyle = savingStyle[styleKey] ?? false;
                const isDeletingPhoto = deletingPhoto[styleKey] ?? false;

                return (
                  <div
                    key={pi}
                    style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      borderTop: pi > 0 ? '1px solid rgba(45,90,61,.07)' : undefined,
                      paddingTop: pi > 0 ? '10px' : undefined,
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ flexShrink: 0, width: '72px', height: '72px', overflow: 'hidden', background: '#f0ece4', borderRadius: '2px' }}>
                      {photo.src && (
                        <img src={photo.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      )}
                    </div>

                    {/* Controls */}
                    <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {page.photos.length > 1 && (
                        <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
                          Photo {pi + 1}
                        </span>
                      )}
                      <CaptionInput
                        pageId={page.id}
                        photoIndex={pi}
                        initialCaption={photo.caption ?? ''}
                        saving={savingStyle[styleKey] ?? false}
                        onSave={handleStyleChange}
                      />
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '9px', marginBottom: '3px' }}>Font</label>
                          <select
                            value={photo.captionFont ?? "'Libre Baskerville', serif"}
                            onChange={e => handleStyleChange(page.id, pi, { captionFont: e.target.value })}
                            style={selectStyle}
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
                            value={photo.captionSize ?? '11px'}
                            onChange={e => handleStyleChange(page.id, pi, { captionSize: e.target.value })}
                            style={selectStyle}
                          >
                            <option value="10px">10px</option>
                            <option value="11px">11px</option>
                            <option value="12px">12px</option>
                            <option value="14px">14px</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '9px', marginBottom: '3px' }}>Font Colour</label>
                          <input
                            type="color"
                            value={photo.captionColour ?? '#888888'}
                            onChange={e => handleStyleChange(page.id, pi, { captionColour: e.target.value })}
                            style={{ width: '36px', height: '26px', padding: '1px', border: '1px solid rgba(45,90,61,.2)', cursor: 'pointer' }}
                          />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '9px', marginBottom: '3px' }}>Caption Position</label>
                          <select
                            value={photo.captionPosition ?? 'bottom'}
                            onChange={e => handleStyleChange(page.id, pi, { captionPosition: e.target.value as 'top' | 'bottom' })}
                            style={selectStyle}
                          >
                            <option value="bottom">Bottom</option>
                            <option value="top">Top</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ ...labelStyle, fontSize: '9px', marginBottom: '3px' }}>Photo Focus</label>
                          <select
                            value={photo.objectPosition ?? 'center top'}
                            onChange={e => handleStyleChange(page.id, pi, { objectPosition: e.target.value })}
                            style={selectStyle}
                          >
                            <option value="center top">Top</option>
                            <option value="center center">Centre</option>
                            <option value="center bottom">Bottom</option>
                            <option value="left center">Left</option>
                            <option value="right center">Right</option>
                          </select>
                        </div>
                        {isSavingStyle && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', paddingBottom: '3px' }}>saving…</span>
                        )}
                      </div>
                    </div>

                    {/* Delete photo button */}
                    {!isCover && photo.src && (
                      <button
                        onClick={() => handleDeletePhoto(page.id, pi)}
                        disabled={isDeletingPhoto}
                        style={{ ...deleteBtnStyle, opacity: isDeletingPhoto ? 0.6 : 1, flexShrink: 0, alignSelf: 'flex-start' }}
                      >
                        Del Photo
                      </button>
                    )}
                  </div>
                );
              })}

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
          width: '44px', padding: '3px 5px', border: '1px solid rgba(45,90,61,.25)',
          fontFamily: "'DM Sans', sans-serif", fontSize: '12px', textAlign: 'center',
          opacity: reordering ? 0.5 : 1,
        }}
      />
    </div>
  );
}

function CaptionInput({
  pageId,
  photoIndex,
  initialCaption,
  saving,
  onSave,
}: {
  pageId: string;
  photoIndex: number;
  initialCaption: string;
  saving: boolean;
  onSave: (pageId: string, photoIndex: number, style: { caption: string }) => void;
}) {
  const [value, setValue] = useState(initialCaption);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={() => onSave(pageId, photoIndex, { caption: value })}
        placeholder="Caption (optional)"
        style={{
          padding: '.4rem .6rem', border: '1px solid rgba(45,90,61,.2)',
          fontFamily: "'Libre Baskerville', serif", fontStyle: 'italic', fontSize: '13px',
          flex: 1, color: 'var(--text-mid)',
        }}
      />
      {saving && <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>saving…</span>}
    </div>
  );
}
