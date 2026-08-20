'use client';

import { useEffect, useRef, useState } from 'react';
import type { RichPage } from '@/data/photo-books';

const PAGE_W = 550;
const PAGE_H = 733;

type CaptionPlacement = 'below' | 'above' | 'overlay-top' | 'overlay-bottom';

type StyledPhoto = RichPage['photos'][number] & {
  captionFontSize?: number;
  captionColor?: string;
  captionPlacement?: CaptionPlacement;
  photoScale?: number;
};

const TAB_DEFS: Array<Record<string, string>> = [
  { top: '-10px', left: '-10px', clipPath: 'polygon(0 0, 100% 0, 0 100%)' },
  { top: '-10px', right: '-10px', clipPath: 'polygon(0 0, 100% 0, 100% 100%)' },
  { bottom: '-10px', left: '-10px', clipPath: 'polygon(0 0, 0 100%, 100% 100%)' },
  { bottom: '-10px', right: '-10px', clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' },
];

function addCornerTabs(mount: HTMLElement): void {
  TAB_DEFS.forEach(def => {
    const tab = document.createElement('div');
    Object.assign(tab.style, {
      position: 'absolute',
      width: '20px',
      height: '20px',
      background: '#d8d3c8',
      ...def,
    });
    mount.appendChild(tab);
  });
}

function spineShadeEl(isLeft: boolean): HTMLDivElement {
  const el = document.createElement('div');
  Object.assign(el.style, {
    position: 'absolute',
    top: '0',
    bottom: '0',
    width: '22%',
    pointerEvents: 'none',
    zIndex: '5',
    ...(isLeft
      ? { right: '0', background: 'linear-gradient(to right, transparent 38%, rgba(0,0,0,0.2) 100%)' }
      : { left: '0', background: 'linear-gradient(to left, transparent 38%, rgba(0,0,0,0.2) 100%)' }),
  });
  return el;
}

function albumPageBase(isLeft: boolean): HTMLDivElement {
  const page = document.createElement('div');
  page.className = 'album-page';
  Object.assign(page.style, {
    backgroundColor: '#ffffff',
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  });
  page.appendChild(spineShadeEl(isLeft));
  return page;
}

function captionEl(photo: StyledPhoto, overlay = false): HTMLDivElement {
  const el = document.createElement('div');
  el.textContent = photo.caption ?? '';

  Object.assign(el.style, {
    fontFamily: "'Libre Baskerville', serif",
    fontSize: `${photo.captionFontSize ?? 11}px`,
    fontStyle: 'italic',
    color: photo.captionColor ?? '#888888',
    textAlign: 'center',
    lineHeight: '1.4',
    boxSizing: 'border-box',
  });

  if (overlay) {
    Object.assign(el.style, {
      position: 'absolute',
      left: '5%',
      right: '5%',
      zIndex: '3',
      padding: '6px 8px',
      background: 'rgba(255,255,255,0.78)',
      borderRadius: '2px',
      ...(photo.captionPlacement === 'overlay-top' ? { top: '5%' } : { bottom: '5%' }),
    });
  } else {
    Object.assign(el.style, {
      flexShrink: '0',
      minHeight: '18px',
      padding: '5px 2px',
    });
  }

  return el;
}

function photoFrame(photo: StyledPhoto, fit: 'contain' | 'cover' = 'contain'): HTMLDivElement {
  const scale = Math.min(Math.max(photo.photoScale ?? 100, 40), 100);
  const frame = document.createElement('div');
  Object.assign(frame.style, {
    width: `${scale}%`,
    height: `${scale}%`,
    position: 'relative',
    overflow: 'hidden',
    flexShrink: '0',
  });

  const img = document.createElement('img');
  img.src = photo.src;
  img.alt = '';
  Object.assign(img.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    objectFit: fit,
    objectPosition: 'center center',
    display: 'block',
  });
  frame.appendChild(img);

  if (
    (photo.captionPlacement === 'overlay-top' || photo.captionPlacement === 'overlay-bottom') &&
    photo.caption
  ) {
    frame.appendChild(captionEl(photo, true));
  }

  return frame;
}

function buildPhotoBlock(photoRaw: RichPage['photos'][number], fit: 'contain' | 'cover' = 'contain'): HTMLDivElement {
  const photo = photoRaw as StyledPhoto;
  const block = document.createElement('div');
  Object.assign(block.style, {
    width: '100%',
    height: '100%',
    minHeight: '0',
    display: 'flex',
    flexDirection: 'column',
  });

  const placement = photo.captionPlacement ?? 'below';
  if (placement === 'above' && photo.caption) block.appendChild(captionEl(photo));

  const host = document.createElement('div');
  Object.assign(host.style, {
    flex: '1',
    minHeight: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });
  host.appendChild(photoFrame(photo, fit));
  block.appendChild(host);

  if (placement === 'below' && photo.caption) block.appendChild(captionEl(photo));

  return block;
}

function addHeader(inner: HTMLElement, rp: RichPage, titleSize = '22px'): void {
  if (rp.title) {
    const title = document.createElement('div');
    title.textContent = rp.title;
    Object.assign(title.style, {
      fontFamily: "'Playfair Display', serif",
      fontSize: titleSize,
      fontWeight: '700',
      color: '#1a3a2a',
      letterSpacing: '0.02em',
      marginBottom: '4px',
      lineHeight: '1.2',
      flexShrink: '0',
    });
    inner.appendChild(title);
  }

  if (rp.subtitle) {
    const subtitle = document.createElement('div');
    subtitle.textContent = rp.subtitle;
    Object.assign(subtitle.style, {
      fontFamily: "'Libre Baskerville', serif",
      fontSize: '11px',
      fontStyle: 'italic',
      color: '#A89560',
      letterSpacing: '0.07em',
      marginBottom: '10px',
      flexShrink: '0',
    });
    inner.appendChild(subtitle);
  }
}

function buildAlbumPage(src: string, index: number): HTMLDivElement {
  const isLeft = index % 2 === 0;
  const page = albumPageBase(isLeft);
  Object.assign(page.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '11%',
  });

  const photoWrapper = document.createElement('div');
  Object.assign(photoWrapper.style, {
    position: 'relative',
    display: 'inline-flex',
    overflow: 'visible',
    maxWidth: '100%',
    maxHeight: '100%',
  });
  addCornerTabs(photoWrapper);

  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  Object.assign(img.style, {
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  });
  photoWrapper.appendChild(img);
  page.appendChild(photoWrapper);
  return page;
}

function buildSinglePage(rp: RichPage, isLeft: boolean): HTMLDivElement {
  const page = albumPageBase(isLeft);
  const inner = document.createElement('div');
  Object.assign(inner.style, {
    position: 'absolute',
    inset: '6%',
  });
  if (rp.photos[0]) inner.appendChild(buildPhotoBlock(rp.photos[0]));
  page.appendChild(inner);
  return page;
}

function buildTitleHeroPage(rp: RichPage, isLeft: boolean): HTMLDivElement {
  const page = albumPageBase(isLeft);
  const inner = document.createElement('div');
  Object.assign(inner.style, {
    padding: '7% 8%',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
  });
  addHeader(inner, rp, '26px');

  if (rp.photos[0]) {
    const photoArea = document.createElement('div');
    Object.assign(photoArea.style, { flex: '1', minHeight: '0' });
    photoArea.appendChild(buildPhotoBlock(rp.photos[0]));
    inner.appendChild(photoArea);
  }

  page.appendChild(inner);
  return page;
}

function buildTwoPhotosPage(rp: RichPage, isLeft: boolean): HTMLDivElement {
  const page = albumPageBase(isLeft);
  const inner = document.createElement('div');
  Object.assign(inner.style, {
    padding: '7%',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
    gap: '10px',
  });

  addHeader(inner, rp);

  rp.photos.slice(0, 2).forEach(photo => {
    const slot = document.createElement('div');
    Object.assign(slot.style, { flex: '1', minHeight: '0' });
    slot.appendChild(buildPhotoBlock(photo));
    inner.appendChild(slot);
  });

  page.appendChild(inner);
  return page;
}

function buildGrid2x2Page(rp: RichPage, isLeft: boolean): HTMLDivElement {
  const page = albumPageBase(isLeft);
  const inner = document.createElement('div');
  Object.assign(inner.style, {
    padding: '6%',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
    gap: '8px',
  });

  addHeader(inner, rp, '20px');

  const grid = document.createElement('div');
  Object.assign(grid.style, {
    flex: '1',
    minHeight: '0',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '8px',
  });

  rp.photos.slice(0, 4).forEach(photo => {
    const cell = document.createElement('div');
    Object.assign(cell.style, { minHeight: '0', minWidth: '0' });
    cell.appendChild(buildPhotoBlock(photo));
    grid.appendChild(cell);
  });

  inner.appendChild(grid);
  page.appendChild(inner);
  return page;
}

function buildGridPage(rp: RichPage, isLeft: boolean): HTMLDivElement {
  const page = albumPageBase(isLeft);
  const inner = document.createElement('div');
  Object.assign(inner.style, {
    padding: '7%',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
    gap: '10px',
  });

  rp.photos.slice(0, 2).forEach(photo => {
    const slot = document.createElement('div');
    Object.assign(slot.style, { flex: '1', minHeight: '0' });
    slot.appendChild(buildPhotoBlock(photo));
    inner.appendChild(slot);
  });

  if (!isLeft && rp.sharedCaption) {
    const shared = document.createElement('div');
    shared.textContent = rp.sharedCaption;
    Object.assign(shared.style, {
      fontFamily: "'Libre Baskerville', serif",
      fontSize: '11px',
      fontStyle: 'italic',
      color: '#888888',
      textAlign: 'center',
      paddingTop: '4px',
    });
    inner.appendChild(shared);
  }

  page.appendChild(inner);
  return page;
}

function buildRichPage(rp: RichPage, index: number): HTMLDivElement {
  const isLeft = index % 2 === 0;

  switch (rp.layout) {
    case 'title-hero':
      return buildTitleHeroPage(rp, isLeft);
    case 'two-photos':
    case 'sf-pair':
      return buildTwoPhotosPage(rp, isLeft);
    case 'grid-left':
    case 'grid-right':
      return buildGridPage(rp, isLeft);
    case 'grid-2x2':
      return buildGrid2x2Page(rp, isLeft);
    case 'sf-single':
    case 'single':
    default:
      return buildSinglePage(rp, isLeft);
  }
}

interface Props {
  pages: string[];
  richPages?: RichPage[];
  singlepage?: boolean;
}

export function FlipBook({ pages, richPages, singlepage }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<{ flipPrev(): void; flipNext(): void; destroy?: () => void } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [ready, setReady] = useState(false);

  const totalPages = richPages?.length ?? pages.length;

  useEffect(() => {
    if (!wrapperRef.current) return;
    const wrapper = wrapperRef.current;
    wrapper.replaceChildren();
    setReady(false);

    let cancelled = false;

    import('page-flip').then(({ PageFlip }) => {
      if (cancelled || !wrapperRef.current) return;

      const pf = new PageFlip(wrapper, {
        width: PAGE_W,
        height: PAGE_H,
        size: 'stretch',
        minWidth: 150,
        minHeight: 200,
        maxWidth: PAGE_W,
        maxHeight: PAGE_H,
        drawShadow: true,
        flippingTime: 700,
        usePortrait: true,
        autoSize: true,
        startPage: 0,
        showCover: false,
        mobileScrollSupport: true,
        clickEventForward: true,
      } as object);

      if (richPages) {
        richPages.forEach((rp, i) => wrapper.appendChild(buildRichPage(rp, i)));
        pf.loadFromHTML(Array.from(wrapper.querySelectorAll('.album-page')) as HTMLElement[]);
      } else if (singlepage) {
        pages.forEach((src, i) => wrapper.appendChild(buildAlbumPage(src, i)));
        pf.loadFromHTML(Array.from(wrapper.querySelectorAll('.album-page')) as HTMLElement[]);
      } else {
        // Keep the established 2025 book behaviour unchanged.
        pf.loadFromImages(pages);
      }

      pf.on('flip', (e: { data: number }) => setCurrentPage(e.data));
      flipRef.current = pf;
      setReady(true);
    });

    return () => {
      cancelled = true;
      flipRef.current?.destroy?.();
      flipRef.current = null;
    };
  }, [pages, richPages, singlepage]);

  const buttonStyle: React.CSSProperties = {
    padding: '9px 24px',
    background: 'var(--green-deep, #2D5A3D)',
    color: '#fff',
    border: 'none',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '.08em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  };

  return (
    <div style={{
      width: '100%',
      background: singlepage ? 'transparent' : '#050505',
      padding: singlepage ? 0 : '1rem',
      boxSizing: 'border-box',
    }}>
      {!ready && (
        <p style={{
          fontFamily: "'Libre Baskerville', serif",
          fontSize: '14px',
          fontStyle: 'italic',
          color: singlepage ? 'var(--text-muted)' : 'rgba(245,240,232,0.6)',
          marginBottom: '1.5rem',
        }}>
          Loading flipbook…
        </p>
      )}
      <div ref={wrapperRef} style={{ width: '100%', minHeight: '60vh' }} />
      {ready && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => flipRef.current?.flipPrev()} style={buttonStyle}>← Previous</button>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12px',
            color: singlepage ? 'var(--text-muted)' : 'rgba(245,240,232,0.55)',
            letterSpacing: '.05em',
            minWidth: '80px',
            textAlign: 'center',
          }}>
            {currentPage + 1} / {totalPages}
          </span>
          <button onClick={() => flipRef.current?.flipNext()} style={buttonStyle}>Next →</button>
        </div>
      )}
    </div>
  );
}
