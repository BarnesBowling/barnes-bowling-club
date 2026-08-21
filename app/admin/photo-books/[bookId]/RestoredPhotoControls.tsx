'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { reorderPages } from './actions';
import {
  updatePageLayout,
  updatePhotoPresentation,
  type CaptionFont,
  type CaptionPlacement,
  type PhotoHorizontalPosition,
  type PhotoPresentationSettings,
  type PhotoVerticalPosition,
} from './presentationActions';
import { movePhotoWithinPage } from './photoOrderActions';

type ControlPhoto = {
  src: string;
  caption?: string;
  captionFontSize?: number;
  captionColor?: string;
  captionPlacement?: CaptionPlacement;
  captionFont?: CaptionFont;
  photoScale?: number;
  photoHorizontal?: PhotoHorizontalPosition;
  photoVertical?: PhotoVerticalPosition;
};

type ControlPage = {
  id: string;
  book_id: string;
  sort_order: number;
  layout: string;
  photos: ControlPhoto[];
};

interface Props {
  bookId: string;
  pages: ControlPage[];
}

const selectStyle: React.CSSProperties = {
  padding: '6px 8px',
  border: '1px solid rgba(45,90,61,.22)',
  background: '#fff',
  color: 'var(--green-deep)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '12px',
};

const smallLabel: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
};

const LAYOUTS = [
  ['single', 'Single photo'],
  ['sf-single', 'Single photo — fit to page'],
  ['sf-pair', 'Two photos — stacked'],
  ['two-photos', 'Two photos — stacked / cropped'],
  ['grid-2x2', 'Grid — 2 × 2'],
  ['title-hero', 'Title + hero photo'],
  ['grid-left', 'Grid — left'],
  ['grid-right', 'Grid — right'],
] as const;

const FONTS: CaptionFont[] = [
  'Libre Baskerville',
  'Playfair Display',
  'DM Sans',
  'Josefin Sans',
  'Optima',
];

function defaults(photo: ControlPhoto): PhotoPresentationSettings {
  return {
    caption: photo.caption ?? '',
    captionFontSize: photo.captionFontSize ?? 11,
    captionColor: photo.captionColor ?? '#888888',
    captionPlacement: photo.captionPlacement ?? 'below',
    captionFont: photo.captionFont ?? 'Libre Baskerville',
    photoScale: photo.photoScale ?? 100,
    photoHorizontal: photo.photoHorizontal ?? 'center',
    photoVertical: photo.photoVertical ?? 'center',
  };
}

export function RestoredPhotoControls({ bookId, pages: initialPages }: Props) {
  const router = useRouter();
  const [pages, setPages] = useState(initialPages);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setPages(initialPages), [initialPages]);

  async function movePage(pageId: string, targetPosition: number) {
    const fromIndex = pages.findIndex(page => page.id === pageId);
    const toIndex = Math.max(0, Math.min(targetPosition - 1, pages.length - 1));
    if (fromIndex < 0 || fromIndex === toIndex) return;

    const next = [...pages];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setPages(next);
    setBusy(`page:${pageId}`);
    setError(null);

    const result = await reorderPages(bookId, next.map(page => page.id));
    setBusy(null);
    if (result.error) {
      setError(result.error);
      router.refresh();
      return;
    }
    router.refresh();
  }

  async function changeLayout(pageId: string, layout: string) {
    setPages(prev => prev.map(page => page.id === pageId ? { ...page, layout } : page));
    setBusy(`layout:${pageId}`);
    setError(null);
    const result = await updatePageLayout(pageId, layout);
    setBusy(null);
    if (result.error) {
      setError(result.error);
      router.refresh();
    }
  }

  async function movePhoto(pageId: string, fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    setPages(prev => prev.map(page => {
      if (page.id !== pageId) return page;
      const photos = [...page.photos];
      const [moved] = photos.splice(fromIndex, 1);
      photos.splice(toIndex, 0, moved);
      return { ...page, photos };
    }));

    setBusy(`photo-order:${pageId}`);
    setError(null);
    const result = await movePhotoWithinPage(pageId, fromIndex, toIndex);
    setBusy(null);
    if (result.error) {
      setError(result.error);
      router.refresh();
      return;
    }
    router.refresh();
  }

  async function savePhoto(pageId: string, photoIndex: number, settings: PhotoPresentationSettings) {
    const key = `photo:${pageId}:${photoIndex}`;
    setPages(prev => prev.map(page => {
      if (page.id !== pageId) return page;
      const photos = [...page.photos];
      photos[photoIndex] = { ...photos[photoIndex], ...settings };
      return { ...page, photos };
    }));

    setBusy(key);
    setError(null);
    const result = await updatePhotoPresentation(pageId, photoIndex, settings);
    setBusy(null);
    if (result.error) setError(result.error);
  }

  return (
    <section style={{ marginBottom: '3.5rem' }}>
      <div style={{
        background: '#fffdf8',
        border: '1px solid rgba(168,149,96,.35)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '22px',
          color: 'var(--green-deep)',
          margin: '0 0 .5rem',
        }}>
          Photo layout & styling controls
        </h2>
        <p style={{
          margin: 0,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          lineHeight: 1.6,
          color: 'var(--text-muted)',
        }}>
          Reorder pages and photos, change layout, photo size and position, and style captions here. These controls are separate from photo uploading below.
        </p>
      </div>

      {error && (
        <p style={{ color: '#a00', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', marginBottom: '1rem' }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {pages.map((page, pageIndex) => (
          <details
            key={page.id}
            style={{
              background: 'white',
              border: '1px solid rgba(45,90,61,.14)',
              padding: '0',
            }}
          >
            <summary style={{
              listStyle: 'none',
              cursor: 'pointer',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <strong style={{ color: 'var(--green-deep)', minWidth: '72px' }}>Page {pageIndex + 1}</strong>

              <label style={{ ...smallLabel, flexDirection: 'row', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                Page position
                <select
                  value={pageIndex + 1}
                  disabled={busy === `page:${page.id}`}
                  onChange={e => void movePage(page.id, Number(e.target.value))}
                  style={selectStyle}
                >
                  {pages.map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                </select>
              </label>

              <label style={{ ...smallLabel, flexDirection: 'row', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                Layout
                <select
                  value={page.layout}
                  disabled={busy === `layout:${page.id}`}
                  onChange={e => void changeLayout(page.id, e.target.value)}
                  style={{ ...selectStyle, minWidth: '190px' }}
                >
                  {!LAYOUTS.some(([value]) => value === page.layout) && <option value={page.layout}>{page.layout}</option>}
                  {LAYOUTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>

              <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '12px' }}>
                {page.photos.length} photo{page.photos.length === 1 ? '' : 's'} · click to edit
              </span>
            </summary>

            <div style={{ padding: '0 1.25rem 1.25rem' }}>
              {page.photos.length === 0 ? (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-muted)' }}>
                  Blank page. Use the existing “Add photo to this page” uploader below to add a photo.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {page.photos.map((photo, photoIndex) => (
                    <PhotoControlRow
                      key={`${page.id}:${photoIndex}:${photo.src}`}
                      photo={photo}
                      photoIndex={photoIndex}
                      photoCount={page.photos.length}
                      saving={busy === `photo:${page.id}:${photoIndex}` || busy === `photo-order:${page.id}`}
                      onMove={toIndex => void movePhoto(page.id, photoIndex, toIndex)}
                      onSave={settings => void savePhoto(page.id, photoIndex, settings)}
                    />
                  ))}
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function PhotoControlRow({
  photo,
  photoIndex,
  photoCount,
  saving,
  onMove,
  onSave,
}: {
  photo: ControlPhoto;
  photoIndex: number;
  photoCount: number;
  saving: boolean;
  onMove: (toIndex: number) => void;
  onSave: (settings: PhotoPresentationSettings) => void;
}) {
  const [settings, setSettings] = useState<PhotoPresentationSettings>(() => defaults(photo));

  useEffect(() => setSettings(defaults(photo)), [photo]);

  function update<K extends keyof PhotoPresentationSettings>(key: K, value: PhotoPresentationSettings[K], saveNow = true) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    if (saveNow) onSave(next);
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '92px minmax(220px, 1fr)',
      gap: '14px',
      padding: '12px',
      background: '#faf9f6',
      border: '1px solid rgba(45,90,61,.08)',
    }}>
      <div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '5px' }}>
          PHOTO {photoIndex + 1}
        </div>
        <div style={{ width: '82px', height: '82px', background: '#eee9df', overflow: 'hidden', marginBottom: '8px' }}>
          {photo.src && <img src={photo.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
        </div>
        {photoCount > 1 && (
          <label style={smallLabel}>
            Photo order
            <select
              value={photoIndex + 1}
              disabled={saving}
              onChange={e => onMove(Number(e.target.value) - 1)}
              style={{ ...selectStyle, width: '82px' }}
            >
              {Array.from({ length: photoCount }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            value={settings.caption}
            onChange={e => update('caption', e.target.value, false)}
            onBlur={() => onSave(settings)}
            placeholder="Caption (optional)"
            style={{
              flex: 1,
              minWidth: 0,
              padding: '8px 10px',
              border: '1px solid rgba(45,90,61,.2)',
              fontFamily: settings.captionFont === 'Playfair Display' ? "'Playfair Display', serif" : settings.captionFont === 'DM Sans' ? "'DM Sans', sans-serif" : settings.captionFont === 'Josefin Sans' ? "'Josefin Sans', sans-serif" : settings.captionFont === 'Optima' ? "'Optima', sans-serif" : "'Libre Baskerville', serif",
              fontSize: '13px',
            }}
          />
          {saving && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: 'var(--text-muted)' }}>saving…</span>}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'end' }}>
          <label style={smallLabel}>
            Photo size
            <select value={settings.photoScale} onChange={e => update('photoScale', Number(e.target.value))} style={selectStyle}>
              {[40, 50, 60, 75, 90, 100].map(value => <option key={value} value={value}>{value}%</option>)}
            </select>
          </label>

          <label style={smallLabel}>
            Left / Right
            <select value={settings.photoHorizontal} onChange={e => update('photoHorizontal', e.target.value as PhotoHorizontalPosition)} style={selectStyle}>
              <option value="left">Left</option>
              <option value="center">Centre</option>
              <option value="right">Right</option>
            </select>
          </label>

          <label style={smallLabel}>
            Top / Bottom
            <select value={settings.photoVertical} onChange={e => update('photoVertical', e.target.value as PhotoVerticalPosition)} style={selectStyle}>
              <option value="top">Top</option>
              <option value="center">Centre</option>
              <option value="bottom">Bottom</option>
            </select>
          </label>

          <label style={smallLabel}>
            Caption font
            <select value={settings.captionFont} onChange={e => update('captionFont', e.target.value as CaptionFont)} style={{ ...selectStyle, minWidth: '150px' }}>
              {FONTS.map(font => <option key={font} value={font}>{font}</option>)}
            </select>
          </label>

          <label style={smallLabel}>
            Caption size
            <select value={settings.captionFontSize} onChange={e => update('captionFontSize', Number(e.target.value))} style={selectStyle}>
              {[10, 11, 12, 14, 16, 18, 20, 24].map(value => <option key={value} value={value}>{value}px</option>)}
            </select>
          </label>

          <label style={smallLabel}>
            Caption colour
            <input
              type="color"
              value={settings.captionColor}
              onChange={e => update('captionColor', e.target.value, false)}
              onBlur={() => onSave(settings)}
              style={{ width: '44px', height: '32px', border: '1px solid rgba(45,90,61,.22)', padding: '2px', background: 'white' }}
            />
          </label>

          <label style={smallLabel}>
            Caption placement
            <select value={settings.captionPlacement} onChange={e => update('captionPlacement', e.target.value as CaptionPlacement)} style={selectStyle}>
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
