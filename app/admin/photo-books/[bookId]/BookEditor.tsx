'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { uploadPhoto, addPage, deletePage, reorderPages, updateBook } from './actions';
import {
  updatePageLayout,
  updatePhotoPresentation,
  type CaptionFont,
  type CaptionPlacement,
  type PhotoHorizontalPosition,
  type PhotoPresentationSettings,
  type PhotoVerticalPosition,
} from './presentationActions';

export interface DbPhotoBook {
  id: string;
  title: string;
  spine_colour: string;
  single_page: boolean;
  sort_order: number;
}

export interface DbPhoto {
  src: string;
  caption?: string;
  captionFontSize?: number;
  captionColor?: string;
  captionPlacement?: CaptionPlacement;
  captionFont?: CaptionFont;
  photoScale?: number;
  photoHorizontal?: PhotoHorizontalPosition;
  photoVertical?: PhotoVerticalPosition;
}

export interface DbPhotoBookPage {
  id: string;
  book_id: string;
  sort_order: number;
  layout: string;
  page_title: string | null;
  page_subtitle: string | null;
  shared_caption: string | null;
  photos: DbPhoto[];
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

const compactInputStyle: React.CSSProperties = {
  padding: '5px 7px',
  border: '1px solid rgba(45,90,61,.22)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '12px',
  color: 'var(--green-deep)',
  background: 'white',
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

const LAYOUT_OPTIONS = [
  { value: 'single', label: 'Single photo' },
  { value: 'sf-single', label: 'Single photo — fit to page' },
  { value: 'sf-pair', label: 'Two photos — stacked' },
  { value: 'two-photos', label: 'Two photos — stacked / cropped' },
  { value: 'grid-2x2', label: 'Grid — 2 × 2' },
  { value: 'title-hero', label: 'Title + hero photo' },
];

const CAPTION_FONT_OPTIONS: Array<{ value: CaptionFont; label: string }> = [
  { value: 'Libre Baskerville', label: 'Libre Baskerville' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'Josefin Sans', label: 'Josefin Sans' },
  { value: 'Optima', label: 'Optima' },
];

function captionFontCss(font: CaptionFont): string {
  switch (font) {
    case 'Playfair Display': return "'Playfair Display', serif";
    case 'DM Sans': return "'DM Sans', sans-serif";
    case 'Josefin Sans': return "'Josefin Sans', sans-serif";
    case 'Optima': return "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif";
    case 'Libre Baskerville':
    default: return "'Libre Baskerville', serif";
  }
}

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

  const [deletingPage, setDeletingPage] = useState<Record<string, boolean>>({});
  const [savingLayout, setSavingLayout] = useState<Record<string, boolean>>({});
  const [savingPhoto, setSavingPhoto] = useState<Record<string, boolean>>({});
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
      if (result.error) setMetaError(result.error);
      else router.refresh();
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
    if (pageErr) setUploadError(pageErr);
    else router.refresh();
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

    if (result.error) setReorderError(result.error);
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

  async function handleLayoutChange(pageId: string, layout: string) {
    setSavingLayout(prev => ({ ...prev, [pageId]: true }));
    setPages(prev => prev.map(page => page.id === pageId ? { ...page, layout } : page));
    const result = await updatePageLayout(pageId, layout);
    setSavingLayout(prev => ({ ...prev, [pageId]: false }));
    if (result.error) {
      setReorderError(result.error);
      router.refresh();
    }
  }

  async function handlePhotoSave(
    pageId: string,
    photoIndex: number,
    settings: PhotoPresentationSettings
  ) {
    const key = `${pageId}:${photoIndex}`;
    setSavingPhoto(prev => ({ ...prev, [key]: true }));

    setPages(prev => prev.map(page => {
      if (page.id !== pageId) return page;
      const nextPhotos = [...page.photos];
      nextPhotos[photoIndex] = { ...nextPhotos[photoIndex], ...settings };
      return { ...page, photos: nextPhotos };
    }));

    const result = await updatePhotoPresentation(pageId, photoIndex, settings);
    setSavingPhoto(prev => ({ ...prev, [key]: false }));
    if (result.error) setReorderError(result.error);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
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
          <button
            onClick={handleSaveMeta}
            disabled={metaSaving}
            style={{ ...btnStyle, opacity: metaSaving ? 0.6 : 1, alignSelf: 'flex-start' }}
          >
            {metaSaving ? 'Saving…' : 'Save details'}
          </button>
        </div>
      </section>

      <section>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-deep)', marginBottom: '1.25rem' }}>
          Upload new photo
        </h2>
        <div style={{ background: 'white', border: '1px solid rgba(45,90,61,.12)', padding: '1.75rem', maxWidth: '480px' }}>
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
          {uploading && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Uploading…</p>}
          {uploadError && <p style={{ color: '#a00', fontSize: '13px', margin: '0.5rem 0 0' }}>{uploadError}</p>}
        </div>
      </section>

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

      <section>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', color: 'var(--green-deep)', marginBottom: '.35rem' }}>
          Pages ({pages.length})
        </h2>
        <p style={{ margin: '0 0 1.25rem', fontSize: '13px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
          Drag a page using the ☰ handle, type a position number, choose the page layout, then set each photo size and its left/centre/right and top/centre/bottom position.
          {reordering && <span> Saving order…</span>}
        </p>
        {reorderError && <p style={{ color: '#a00', fontSize: '13px', margin: '0 0 1rem' }}>{reorderError}</p>}

        {pages.length === 0 && (
          <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
            No pages yet — upload a photo above to add the first page.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {pages.map((page, i) => {
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
                  opacity: isDragging ? 0.5 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
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
                      height: '36px',
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

                  <PositionInput
                    position={i + 1}
                    max={pages.length}
                    disabled={reordering}
                    onMove={position => void handlePositionChange(page.id, position)}
                  />

                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)' }}>
                    Layout
                    <select
                      value={page.layout}
                      disabled={savingLayout[page.id] ?? false}
                      onChange={e => void handleLayoutChange(page.id, e.target.value)}
                      style={{ ...compactInputStyle, minWidth: '180px' }}
                    >
                      {!LAYOUT_OPTIONS.some(option => option.value === page.layout) && (
                        <option value={page.layout}>{page.layout}</option>
                      )}
                      {LAYOUT_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>

                  {savingLayout[page.id] && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>saving layout…</span>
                  )}

                  <button
                    onClick={() => handleDelete(page.id)}
                    disabled={deletingPage[page.id] ?? false}
                    style={{ ...deleteBtnStyle, marginLeft: 'auto', opacity: (deletingPage[page.id] ?? false) ? 0.6 : 1 }}
                  >
                    Delete page
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {page.photos.map((photo, photoIndex) => (
                    <PhotoEditor
                      key={`${page.id}:${photoIndex}`}
                      photo={photo}
                      photoNumber={photoIndex + 1}
                      saving={savingPhoto[`${page.id}:${photoIndex}`] ?? false}
                      onSave={settings => void handlePhotoSave(page.id, photoIndex, settings)}
                    />
                  ))}
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
        style={{ ...compactInputStyle, width: '54px', textAlign: 'center', background: disabled ? '#f3f1ec' : 'white' }}
      />
    </label>
  );
}

function PhotoEditor({
  photo,
  photoNumber,
  saving,
  onSave,
}: {
  photo: DbPhoto;
  photoNumber: number;
  saving: boolean;
  onSave: (settings: PhotoPresentationSettings) => void;
}) {
  const [caption, setCaption] = useState(photo.caption ?? '');
  const [fontSize, setFontSize] = useState(photo.captionFontSize ?? 11);
  const [colour, setColour] = useState(photo.captionColor ?? '#888888');
  const [placement, setPlacement] = useState<CaptionPlacement>(photo.captionPlacement ?? 'below');
  const [captionFont, setCaptionFont] = useState<CaptionFont>(photo.captionFont ?? 'Libre Baskerville');
  const [photoScale, setPhotoScale] = useState(photo.photoScale ?? 100);
  const [photoHorizontal, setPhotoHorizontal] = useState<PhotoHorizontalPosition>(photo.photoHorizontal ?? 'center');
  const [photoVertical, setPhotoVertical] = useState<PhotoVerticalPosition>(photo.photoVertical ?? 'center');

  useEffect(() => {
    setCaption(photo.caption ?? '');
    setFontSize(photo.captionFontSize ?? 11);
    setColour(photo.captionColor ?? '#888888');
    setPlacement(photo.captionPlacement ?? 'below');
    setCaptionFont(photo.captionFont ?? 'Libre Baskerville');
    setPhotoScale(photo.photoScale ?? 100);
    setPhotoHorizontal(photo.photoHorizontal ?? 'center');
    setPhotoVertical(photo.photoVertical ?? 'center');
  }, [photo]);

  function commit(overrides: Partial<PhotoPresentationSettings> = {}) {
    onSave({
      caption,
      captionFontSize: fontSize,
      captionColor: colour,
      captionPlacement: placement,
      captionFont,
      photoScale,
      photoHorizontal,
      photoVertical,
      ...overrides,
    });
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '90px minmax(180px, 1fr)',
      gap: '12px',
      alignItems: 'start',
      padding: '10px',
      background: '#faf9f6',
      border: '1px solid rgba(45,90,61,.08)',
    }}>
      <div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', color: 'var(--text-muted)', marginBottom: '5px' }}>
          PHOTO {photoNumber}
        </div>
        <div style={{ width: '80px', height: '80px', overflow: 'hidden', background: '#eee9df' }}>
          {photo.src && <img src={photo.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            value={caption}
            onChange={e => setCaption(e.target.value)}
            onBlur={() => commit()}
            placeholder="Caption (optional)"
            style={{
              padding: '.45rem .6rem',
              border: '1px solid rgba(45,90,61,.2)',
              fontFamily: captionFontCss(captionFont),
              fontStyle: captionFont === 'Libre Baskerville' ? 'italic' : 'normal',
              fontSize: '13px',
              flex: 1,
              minWidth: 0,
              color: 'var(--text-mid)',
            }}
          />
          {saving && <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>saving…</span>}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'end' }}>
          <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)' }}>
            Photo size
            <select
              value={photoScale}
              onChange={e => {
                const next = Number(e.target.value);
                setPhotoScale(next);
                commit({ photoScale: next });
              }}
              style={{ ...compactInputStyle, display: 'block', marginTop: '3px' }}
            >
              <option value={40}>40%</option>
              <option value={50}>50%</option>
              <option value={60}>60%</option>
              <option value={75}>75%</option>
              <option value={90}>90%</option>
              <option value={100}>100%</option>
            </select>
          </label>

          <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)' }}>
            Left / Right
            <select
              value={photoHorizontal}
              onChange={e => {
                const next = e.target.value as PhotoHorizontalPosition;
                setPhotoHorizontal(next);
                commit({ photoHorizontal: next });
              }}
              style={{ ...compactInputStyle, display: 'block', marginTop: '3px' }}
            >
              <option value="left">Left</option>
              <option value="center">Centre</option>
              <option value="right">Right</option>
            </select>
          </label>

          <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)' }}>
            Top / Bottom
            <select
              value={photoVertical}
              onChange={e => {
                const next = e.target.value as PhotoVerticalPosition;
                setPhotoVertical(next);
                commit({ photoVertical: next });
              }}
              style={{ ...compactInputStyle, display: 'block', marginTop: '3px' }}
            >
              <option value="top">Top</option>
              <option value="center">Centre</option>
              <option value="bottom">Bottom</option>
            </select>
          </label>

          <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)' }}>
            Caption font
            <select
              value={captionFont}
              onChange={e => {
                const next = e.target.value as CaptionFont;
                setCaptionFont(next);
                commit({ captionFont: next });
              }}
              style={{ ...compactInputStyle, display: 'block', marginTop: '3px', minWidth: '145px' }}
            >
              {CAPTION_FONT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)' }}>
            Caption size
            <select
              value={fontSize}
              onChange={e => {
                const next = Number(e.target.value);
                setFontSize(next);
                commit({ captionFontSize: next });
              }}
              style={{ ...compactInputStyle, display: 'block', marginTop: '3px' }}
            >
              {[10, 11, 12, 14, 16, 18, 20, 24].map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
          </label>

          <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)' }}>
            Caption colour
            <input
              type="color"
              value={colour}
              onChange={e => setColour(e.target.value)}
              onBlur={() => commit()}
              style={{ display: 'block', width: '44px', height: '31px', marginTop: '3px', border: '1px solid rgba(45,90,61,.22)', padding: '2px', background: 'white' }}
            />
          </label>

          <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)' }}>
            Caption placement
            <select
              value={placement}
              onChange={e => {
                const next = e.target.value as CaptionPlacement;
                setPlacement(next);
                commit({ captionPlacement: next });
              }}
              style={{ ...compactInputStyle, display: 'block', marginTop: '3px' }}
            >
              <option value="below">Below photo</option>
              <option value="above">Above photo</option>
              <option value="overlay-top">Over photo — top</option>
              <option value="overlay-bottom">Over photo — bottom</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
