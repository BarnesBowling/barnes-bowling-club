'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addPhotoToPage, uploadPhoto } from './actions';
import { updatePageLayout } from './presentationActions';

type Photo = {
  src: string;
  caption?: string;
};

type Page = {
  id: string;
  sort_order: number;
  layout: string;
  photos: Photo[];
};

interface Props {
  bookId: string;
  pages: Page[];
}

type SupportedLayout = 'sf-single' | 'sf-pair' | 'grid-2x2';

const LAYOUT_OPTIONS: Array<{
  value: SupportedLayout;
  label: string;
  capacity: number;
  help: string;
}> = [
  { value: 'sf-single', label: '1 photo', capacity: 1, help: 'One full photo, fitted to the page' },
  { value: 'sf-pair', label: '2 photos', capacity: 2, help: 'Two photos stacked on one page' },
  { value: 'grid-2x2', label: '4 photos', capacity: 4, help: 'Four photos in a 2 × 2 grid' },
];

const panelStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid rgba(45,90,61,.12)',
  padding: '1.25rem',
};

const labelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  color: 'var(--gold)',
  display: 'block',
  marginBottom: '5px',
  fontFamily: "'DM Sans', sans-serif",
};

function recognisedLayout(layout: string): SupportedLayout | null {
  if (layout === 'sf-single') return 'sf-single';
  if (layout === 'sf-pair' || layout === 'two-photos') return 'sf-pair';
  if (layout === 'grid-2x2') return 'grid-2x2';
  return null;
}

function capacityFor(layout: string): number | null {
  const recognised = recognisedLayout(layout);
  return LAYOUT_OPTIONS.find(option => option.value === recognised)?.capacity ?? null;
}

export function PageLayoutManager({ bookId, pages }: Props) {
  const router = useRouter();
  const [savingLayout, setSavingLayout] = useState<Record<string, boolean>>({});
  const [uploadingPage, setUploadingPage] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const orderedPages = useMemo(
    () => [...pages].sort((a, b) => a.sort_order - b.sort_order),
    [pages]
  );

  async function changeLayout(page: Page, layout: SupportedLayout) {
    const option = LAYOUT_OPTIONS.find(item => item.value === layout);
    if (!option) return;
    if (page.photos.length > option.capacity) {
      setErrors(prev => ({
        ...prev,
        [page.id]: `This page already contains ${page.photos.length} photos. Remove photos before switching to ${option.label}.`,
      }));
      return;
    }

    setErrors(prev => ({ ...prev, [page.id]: null }));
    setSavingLayout(prev => ({ ...prev, [page.id]: true }));
    const result = await updatePageLayout(page.id, layout);
    setSavingLayout(prev => ({ ...prev, [page.id]: false }));

    if (result.error) {
      setErrors(prev => ({ ...prev, [page.id]: result.error ?? 'Could not change layout' }));
      return;
    }
    router.refresh();
  }

  async function addPhoto(page: Page, file: File | null) {
    if (!file) return;

    const capacity = capacityFor(page.layout);
    if (capacity === null) {
      setErrors(prev => ({ ...prev, [page.id]: 'Choose a 1, 2 or 4 photo layout before adding another photo.' }));
      return;
    }
    if (page.photos.length >= capacity) {
      setErrors(prev => ({ ...prev, [page.id]: `This ${capacity}-photo layout is already full.` }));
      return;
    }

    setErrors(prev => ({ ...prev, [page.id]: null }));
    setUploadingPage(prev => ({ ...prev, [page.id]: true }));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bookId', bookId);

    const uploaded = await uploadPhoto(formData);
    if (uploaded.error || !uploaded.url) {
      setUploadingPage(prev => ({ ...prev, [page.id]: false }));
      setErrors(prev => ({ ...prev, [page.id]: uploaded.error ?? 'Upload failed' }));
      return;
    }

    const result = await addPhotoToPage(page.id, uploaded.url);
    setUploadingPage(prev => ({ ...prev, [page.id]: false }));

    if (result.error) {
      setErrors(prev => ({ ...prev, [page.id]: result.error ?? 'Could not add photo to page' }));
      return;
    }

    router.refresh();
  }

  return (
    <section style={{ marginBottom: '3rem' }}>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '20px',
        color: 'var(--green-deep)',
        marginBottom: '.5rem',
      }}>
        Page layouts
      </h2>
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '13px',
        color: 'var(--text-muted)',
        margin: '0 0 1.25rem',
      }}>
        Choose whether each page holds 1, 2 or 4 photos. The one-photo layout fits the whole image rather than cropping it.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {orderedPages.map((page, index) => {
          const isCover = page.sort_order < 0;
          const recognised = recognisedLayout(page.layout);
          const capacity = capacityFor(page.layout);
          const canAddPhoto = !isCover && capacity !== null && page.photos.length < capacity;

          return (
            <div key={page.id} style={panelStyle}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ minWidth: '78px' }}>
                  <span style={labelStyle}>{isCover ? 'Cover' : `Page ${index + 1}`}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: "'DM Sans', sans-serif" }}>
                    {page.photos.length} photo{page.photos.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                  {page.photos.slice(0, 4).map((photo, photoIndex) => (
                    <div
                      key={`${page.id}-${photoIndex}`}
                      style={{ width: '54px', height: '54px', background: '#f0ece4', overflow: 'hidden', borderRadius: '2px' }}
                    >
                      {photo.src && (
                        <img
                          src={photo.src}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {isCover ? (
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-muted)' }}>
                    Fixed cover page — layout protected
                  </div>
                ) : (
                  <>
                    <div style={{ minWidth: '190px' }}>
                      <label style={labelStyle}>Layout</label>
                      <select
                        value={recognised ?? page.layout}
                        disabled={savingLayout[page.id] ?? false}
                        onChange={event => changeLayout(page, event.target.value as SupportedLayout)}
                        style={{
                          padding: '.55rem .65rem',
                          border: '1px solid rgba(45,90,61,.2)',
                          background: 'white',
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '13px',
                          minWidth: '180px',
                        }}
                      >
                        {!recognised && (
                          <option value={page.layout}>Current: {page.layout}</option>
                        )}
                        {LAYOUT_OPTIONS.map(option => (
                          <option
                            key={option.value}
                            value={option.value}
                            disabled={page.photos.length > option.capacity}
                          >
                            {option.label}{page.photos.length > option.capacity ? ' — too many photos' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ flex: 1, minWidth: '210px' }}>
                      <label style={labelStyle}>Photo arrangement</label>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-muted)' }}>
                        {recognised
                          ? LAYOUT_OPTIONS.find(option => option.value === recognised)?.help
                          : 'Choose one of the standard layouts to control this page.'}
                      </div>
                    </div>

                    <div style={{ marginLeft: 'auto' }}>
                      <label style={labelStyle}>Add to this page</label>
                      {canAddPhoto ? (
                        <label style={{
                          display: 'inline-block',
                          padding: '7px 12px',
                          background: 'var(--green-deep)',
                          color: '#fff',
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: (uploadingPage[page.id] ?? false) ? 'wait' : 'pointer',
                          opacity: (uploadingPage[page.id] ?? false) ? .6 : 1,
                        }}>
                          {(uploadingPage[page.id] ?? false) ? 'Uploading…' : '+ Add photo'}
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingPage[page.id] ?? false}
                            onChange={event => {
                              const input = event.currentTarget;
                              const file = input.files?.[0] ?? null;
                              void addPhoto(page, file).finally(() => { input.value = ''; });
                            }}
                            style={{ display: 'none' }}
                          />
                        </label>
                      ) : (
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--text-muted)' }}>
                          {capacity === null ? 'Choose a standard layout first' : 'Layout full'}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {errors[page.id] && (
                <p style={{ color: '#a00', fontSize: '12px', fontFamily: "'DM Sans', sans-serif", margin: '.75rem 0 0' }}>
                  {errors[page.id]}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
