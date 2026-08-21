'use client';

import { useEffect, useRef, useState } from 'react';
import type { RichPage } from '@/data/photo-books';

const PAGE_W = 550;
const PAGE_H = 733;


const TAB_DEFS: Array<Record<string, string>> = [
  { top: '-10px',    left: '-10px',   clipPath: 'polygon(0 0, 100% 0, 0 100%)'       },
  { top: '-10px',    right: '-10px',  clipPath: 'polygon(0 0, 100% 0, 100% 100%)'    },
  { bottom: '-10px', left: '-10px',   clipPath: 'polygon(0 0, 0 100%, 100% 100%)'    },
  { bottom: '-10px', right: '-10px',  clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' },
];

// ── DOM helpers ──────────────────────────────────────────────────────────────

function addCornerTabs(mount: HTMLElement): void {
  TAB_DEFS.forEach(def => {
    const tab = document.createElement('div');
    Object.assign(tab.style, { position: 'absolute', width: '20px', height: '20px', background: '#d8d3c8', ...def });
    mount.appendChild(tab);
  });
}

function spineShadeEl(isLeft: boolean, strong = true): HTMLDivElement {
  const shade = document.createElement('div');

  if (!strong) {
    Object.assign(shade.style, {
      position: 'absolute', top: '0', bottom: '0', width: '22%', pointerEvents: 'none', zIndex: '2',
      ...(isLeft
        ? { right: '0', background: 'linear-gradient(to right, transparent 40%, rgba(0,0,0,0.18) 100%)' }
        : { left: '0',  background: 'linear-gradient(to left,  transparent 40%, rgba(0,0,0,0.18) 100%)' }),
    });
    return shade;
  }

  Object.assign(shade.style, {
    position: 'absolute',
    top: '0',
    bottom: '0',
    width: '18%',
    pointerEvents: 'none',
    zIndex: '2',
    ...(isLeft
      ? {
          right: '0',
          background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(220,220,220,0.18) 48%, rgba(170,170,170,0.34) 72%, rgba(108,108,108,0.52) 94%, rgba(74,74,74,0.62) 100%)',
          boxShadow: 'inset -2px 0 2px rgba(60,60,60,0.20)',
        }
      : {
          left: '0',
          background: 'linear-gradient(to left, rgba(255,255,255,0) 0%, rgba(220,220,220,0.18) 48%, rgba(170,170,170,0.34) 72%, rgba(108,108,108,0.52) 94%, rgba(74,74,74,0.62) 100%)',
          boxShadow: 'inset 2px 0 2px rgba(60,60,60,0.20)',
        }),
  });

  const crease = document.createElement('div');
  Object.assign(crease.style, {
    position: 'absolute',
    top: '0',
    bottom: '0',
    width: '2px',
    background: 'rgba(70,70,70,0.46)',
    ...(isLeft ? { right: '0' } : { left: '0' }),
  });
  shade.appendChild(crease);
  return shade;
}

function albumPageBase(isLeft: boolean, strongSpine = true): HTMLDivElement {
  const page = document.createElement('div');
  page.className = 'album-page';
  Object.assign(page.style, {
    background: '#ffffff',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box', width: '100%', height: '100%',
    position: 'relative', overflow: 'hidden',
    ...(strongSpine
      ? {
          isolation: 'isolate',
          boxShadow: isLeft
            ? 'inset -1px 0 rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.24)'
            : 'inset 1px 0 rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.24)',
        }
      : {}),
  });
  page.appendChild(spineShadeEl(isLeft, strongSpine));
  return page;
}

function coverImgEl(src: string, objectPosition = 'center top'): HTMLImageElement {
  const img = document.createElement('img');
  img.src = src; img.alt = '';
  Object.assign(img.style, {
    position: 'absolute', inset: '0', width: '100%', height: '100%',
    objectFit: 'cover', objectPosition, display: 'block',
  });
  return img;
}

function containImgEl(src: string): HTMLImageElement {
  const img = document.createElement('img');
  img.src = src; img.alt = '';
  Object.assign(img.style, {
    position: 'absolute', inset: '0', width: '100%', height: '100%',
    objectFit: 'contain', objectPosition: 'center center', display: 'block',
  });
  return img;
}

function captionEl(text: string, fontFamily?: string, fontSize?: string, colour?: string): HTMLDivElement {
  const el = document.createElement('div');
  el.textContent = text;
  Object.assign(el.style, {
    fontFamily: fontFamily ?? "'Libre Baskerville', serif",
    fontSize: fontSize ?? '11px',
    fontStyle: 'italic',
    color: colour ?? '#888888', textAlign: 'center', lineHeight: '1.4',
    flexShrink: '0', minHeight: '18px', paddingTop: '6px',
  });
  return el;
}

// ── Page builders ────────────────────────────────────────────────────────────

// Used by the singlePage (International Days) books — unchanged from original.
function buildAlbumPage(src: string, index: number): HTMLDivElement {
  const isLeft = index % 2 === 0;
  const page = albumPageBase(isLeft, false);
  Object.assign(page.style, { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '11%' });

  const photoWrapper = document.createElement('div');
  Object.assign(photoWrapper.style, {
    position: 'relative', display: 'inline-flex', overflow: 'visible', maxWidth: '100%', maxHeight: '100%',
  });
  addCornerTabs(photoWrapper);

  const img = document.createElement('img');
  img.src = src; img.alt = '';
  Object.assign(img.style, { display: 'block', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' });
  photoWrapper.appendChild(img);
  page.appendChild(photoWrapper);
  return page;
}

// Single photo — restored to the earlier album presentation with white margin
// and a dedicated caption area above or below the image.
function buildSinglePage(rp: RichPage, isLeft: boolean): HTMLDivElement {
  const page = albumPageBase(isLeft);
  const photo = rp.photos[0];
  if (!photo) return page;

  const inner = document.createElement('div');
  Object.assign(inner.style, {
    position: 'absolute',
    inset: '7%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '0',
  });

  const wrap = document.createElement('div');
  Object.assign(wrap.style, {
    flex: '1',
    minHeight: '0',
    position: 'relative',
    overflow: 'hidden',
  });
  wrap.appendChild(containImgEl(photo.src));

  const cap = captionEl(photo.caption ?? '', photo.captionFont, photo.captionSize, photo.captionColour);
  if (photo.captionPosition === 'top') {
    inner.appendChild(cap);
    inner.appendChild(wrap);
  } else {
    inner.appendChild(wrap);
    inner.appendChild(cap);
  }

  page.appendChild(inner);
  return page;
}

// Title + subtitle + large hero photo + caption.
function buildTitleHeroPage(rp: RichPage, isLeft: boolean): HTMLDivElement {
  const page = albumPageBase(isLeft);
  const inner = document.createElement('div');
  Object.assign(inner.style, {
    padding: '9% 10% 8%', display: 'flex', flexDirection: 'column',
    height: '100%', boxSizing: 'border-box',
  });

  if (rp.title) {
    const t = document.createElement('div');
    t.textContent = rp.title;
    Object.assign(t.style, {
      fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: '700',
      color: '#1a3a2a', letterSpacing: '0.02em', marginBottom: '4px', lineHeight: '1.2',
    });
    inner.appendChild(t);
  }
  if (rp.subtitle) {
    const s = document.createElement('div');
    s.textContent = rp.subtitle;
    Object.assign(s.style, {
      fontFamily: "'Libre Baskerville', serif", fontSize: '12px', fontStyle: 'italic',
      color: '#A89560', letterSpacing: '0.07em', marginBottom: '14px',
    });
    inner.appendChild(s);
  }

  const photo = rp.photos[0];
  if (photo) {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, { flex: '1', position: 'relative', overflow: 'hidden' });
    wrap.appendChild(coverImgEl(photo.src, photo.objectPosition ?? 'center center'));
    inner.appendChild(wrap);
    inner.appendChild(captionEl(photo.caption ?? '', photo.captionFont, photo.captionSize, photo.captionColour));
  }

  page.appendChild(inner);
  return page;
}

// Two photos stacked vertically, each with its own caption (above or below).
function buildTwoPhotosPage(rp: RichPage, isLeft: boolean): HTMLDivElement {
  const page = albumPageBase(isLeft);
  const inner = document.createElement('div');
  Object.assign(inner.style, {
    padding: '9% 10% 7%', display: 'flex', flexDirection: 'column',
    height: '100%', boxSizing: 'border-box', gap: '10px',
  });

  rp.photos.forEach(photo => {
    const block = document.createElement('div');
    Object.assign(block.style, { flex: '1', display: 'flex', flexDirection: 'column', minHeight: '0' });

    const wrap = document.createElement('div');
    Object.assign(wrap.style, { flex: '1', position: 'relative', overflow: 'hidden' });
    wrap.appendChild(coverImgEl(photo.src, photo.objectPosition ?? 'center center'));

    const cap = captionEl(photo.caption ?? '', photo.captionFont, photo.captionSize, photo.captionColour);
    if (photo.captionPosition === 'top') {
      block.appendChild(cap);
      block.appendChild(wrap);
    } else {
      block.appendChild(wrap);
      block.appendChild(cap);
    }
    inner.appendChild(block);
  });

  page.appendChild(inner);
  return page;
}

// Self-contained 2×2 grid. Optional title/subtitle at top; one caption per photo.
// With 4 photos renders 2 rows × 2 cols; with 2 photos renders 1 row × 2 cols.
function buildGrid2x2Page(rp: RichPage, isLeft: boolean): HTMLDivElement {
  const page = albumPageBase(isLeft);
  const inner = document.createElement('div');
  const hasHeader = !!(rp.title || rp.subtitle);
  Object.assign(inner.style, {
    padding: hasHeader ? '6% 7% 7%' : '7%',
    display: 'flex', flexDirection: 'column',
    height: '100%', boxSizing: 'border-box', gap: '6px',
  });

  if (rp.title) {
    const t = document.createElement('div');
    t.textContent = rp.title;
    Object.assign(t.style, {
      fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '700',
      color: '#1a3a2a', letterSpacing: '0.02em', marginBottom: '2px', lineHeight: '1.2', flexShrink: '0',
    });
    inner.appendChild(t);
  }
  if (rp.subtitle) {
    const s = document.createElement('div');
    s.textContent = rp.subtitle;
    Object.assign(s.style, {
      fontFamily: "'Libre Baskerville', serif", fontSize: '11px', fontStyle: 'italic',
      color: '#A89560', letterSpacing: '0.07em', marginBottom: '6px', flexShrink: '0',
    });
    inner.appendChild(s);
  }

  const grid = document.createElement('div');
  Object.assign(grid.style, {
    flex: '1', display: 'grid', gridTemplateColumns: '1fr 1fr',
    gridAutoRows: '1fr', gap: '5px', minHeight: '0',
  });

  rp.photos.forEach(photo => {
    const cell = document.createElement('div');
    Object.assign(cell.style, { position: 'relative', overflow: 'hidden', minHeight: '0' });
    cell.appendChild(coverImgEl(photo.src, photo.objectPosition ?? 'center center'));
    grid.appendChild(cell);
  });

  inner.appendChild(grid);
  page.appendChild(inner);
  return page;
}

// One column of the 2×2 grid spread. Shared caption appears on the right page only.
function buildGridPage(rp: RichPage, isLeft: boolean): HTMLDivElement {
  const page = albumPageBase(isLeft);
  const inner = document.createElement('div');
  Object.assign(inner.style, {
    padding: '8%', display: 'flex', flexDirection: 'column',
    height: '100%', boxSizing: 'border-box', gap: '8px',
  });

  rp.photos.forEach(photo => {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, { flex: '1', position: 'relative', overflow: 'hidden' });
    wrap.appendChild(coverImgEl(photo.src, photo.objectPosition ?? 'center center'));
    inner.appendChild(wrap);
  });

  if (!isLeft && rp.sharedCaption !== undefined) {
    inner.appendChild(captionEl(rp.sharedCaption));
  }

  page.appendChild(inner);
  return page;
}

// Full-page single photo with object-fit:contain (no cropping).
function buildSfSinglePage(rp: RichPage, isLeft: boolean): HTMLDivElement {
  const page = albumPageBase(isLeft);
  const hasHeader = !!(rp.title || rp.subtitle);

  if (!hasHeader) {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, { position: 'absolute', inset: '0', overflow: 'hidden' });
    if (rp.photos[0]) wrap.appendChild(containImgEl(rp.photos[0].src));
    page.appendChild(wrap);
    return page;
  }

  const inner = document.createElement('div');
  Object.assign(inner.style, {
    padding: '7% 8% 7%', display: 'flex', flexDirection: 'column',
    height: '100%', boxSizing: 'border-box',
  });
  if (rp.title) {
    const t = document.createElement('div');
    t.textContent = rp.title;
    Object.assign(t.style, {
      fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: '700',
      color: '#1a3a2a', letterSpacing: '0.02em', marginBottom: '4px', lineHeight: '1.2', flexShrink: '0',
    });
    inner.appendChild(t);
  }
  if (rp.subtitle) {
    const s = document.createElement('div');
    s.textContent = rp.subtitle;
    Object.assign(s.style, {
      fontFamily: "'Libre Baskerville', serif", fontSize: '11px', fontStyle: 'italic',
      color: '#A89560', letterSpacing: '0.07em', marginBottom: '10px', flexShrink: '0',
    });
    inner.appendChild(s);
  }
  const photo = rp.photos[0];
  if (photo) {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, { flex: '1', position: 'relative', overflow: 'hidden', minHeight: '0' });
    wrap.appendChild(containImgEl(photo.src));
    inner.appendChild(wrap);
    if (photo.caption !== undefined) inner.appendChild(captionEl(photo.caption ?? '', photo.captionFont, photo.captionSize, photo.captionColour));
  }
  page.appendChild(inner);
  return page;
}

// Two photos stacked with object-fit:contain — used for landscape pairs.
function buildSfPairPage(rp: RichPage, isLeft: boolean): HTMLDivElement {
  const page = albumPageBase(isLeft);
  const hasHeader = !!(rp.title || rp.subtitle);
  const inner = document.createElement('div');
  Object.assign(inner.style, {
    padding: hasHeader ? '6% 7% 7%' : '7%',
    display: 'flex', flexDirection: 'column',
    height: '100%', boxSizing: 'border-box', gap: '8px',
  });

  if (rp.title) {
    const t = document.createElement('div');
    t.textContent = rp.title;
    Object.assign(t.style, {
      fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '700',
      color: '#1a3a2a', letterSpacing: '0.02em', marginBottom: '3px', lineHeight: '1.2', flexShrink: '0',
    });
    inner.appendChild(t);
  }
  if (rp.subtitle) {
    const s = document.createElement('div');
    s.textContent = rp.subtitle;
    Object.assign(s.style, {
      fontFamily: "'Libre Baskerville', serif", fontSize: '11px', fontStyle: 'italic',
      color: '#A89560', letterSpacing: '0.07em', marginBottom: '6px', flexShrink: '0',
    });
    inner.appendChild(s);
  }

  rp.photos.forEach(photo => {
    const block = document.createElement('div');
    Object.assign(block.style, { flex: '1', display: 'flex', flexDirection: 'column', minHeight: '0' });
    const wrap = document.createElement('div');
    Object.assign(wrap.style, { flex: '1', position: 'relative', overflow: 'hidden', minHeight: '0' });
    wrap.appendChild(containImgEl(photo.src));
    block.appendChild(wrap);
    if (photo.caption !== undefined) block.appendChild(captionEl(photo.caption ?? '', photo.captionFont, photo.captionSize, photo.captionColour));
    inner.appendChild(block);
  });

  page.appendChild(inner);
  return page;
}

function buildRichPage(rp: RichPage, index: number): HTMLDivElement {
  const isLeft = index % 2 === 0;
  switch (rp.layout) {
    case 'title-hero': return buildTitleHeroPage(rp, isLeft);
    case 'two-photos': return buildTwoPhotosPage(rp, isLeft);
    case 'grid-left':
    case 'grid-right': return buildGridPage(rp, isLeft);
    case 'grid-2x2':   return buildGrid2x2Page(rp, isLeft);
    case 'sf-single':  return buildSinglePage(rp, isLeft);
    case 'sf-pair':    return buildSfPairPage(rp, isLeft);
    default:           return buildSinglePage(rp, isLeft);
  }
}

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  pages: string[];
  richPages?: RichPage[];
  singlepage?: boolean;
}

export function FlipBook({ pages, richPages, singlepage }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<{ flipPrev(): void; flipNext(): void } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [ready, setReady] = useState(false);

  const totalPages = richPages?.length ?? pages.length;
  const richBook = Boolean(richPages);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const wrapper = wrapperRef.current;

    import('page-flip').then(({ PageFlip }) => {
      if (!wrapperRef.current) return;

      const pf = new PageFlip(wrapper, {
        width: PAGE_W, height: PAGE_H, size: 'stretch',
        minWidth: 150, minHeight: 200, maxWidth: PAGE_W, maxHeight: PAGE_H,
        drawShadow: true, flippingTime: 700, usePortrait: true, autoSize: true,
        startPage: 0, showCover: false, mobileScrollSupport: true, clickEventForward: true,
      } as object);

      if (richPages) {
        richPages.forEach((rp, i) => wrapper.appendChild(buildRichPage(rp, i)));
        pf.loadFromHTML(Array.from(wrapper.querySelectorAll('.album-page')) as HTMLElement[]);
      } else if (singlepage) {
        pages.forEach((src, i) => wrapper.appendChild(buildAlbumPage(src, i)));
        pf.loadFromHTML(Array.from(wrapper.querySelectorAll('.album-page')) as HTMLElement[]);
      } else {
        pf.loadFromImages(pages);
      }

      pf.on('flip', (e: { data: number }) => setCurrentPage(e.data));
      flipRef.current = pf;
      setReady(true);
    });

    return () => {
      (flipRef.current as { destroy?: () => void } | null)?.destroy?.();
      flipRef.current = null;
    };
  }, [pages, richPages, singlepage]);

  const btnStyle: React.CSSProperties = {
    padding: '9px 24px', background: 'var(--green-deep, #2D5A3D)', color: '#fff', border: 'none',
    fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 700,
    letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer',
  };

  const bookBacking: React.CSSProperties = richBook
    ? {
        width: '100%',
        maxWidth: '1100px',
        margin: '0 auto',
        background: 'linear-gradient(to right, #ffffff 0%, #ffffff 45%, #f0f0f0 48%, #b8b8b8 49.5%, #777777 50%, #b8b8b8 50.5%, #f0f0f0 52%, #ffffff 55%, #ffffff 100%)',
        boxShadow: '0 8px 28px rgba(0,0,0,0.58)',
        overflow: 'hidden',
      }
    : { width: '100%' };

  return (
    <div style={{ width: '100%' }}>
      {!ready && (
        <p style={{ fontFamily: "'Libre Baskerville', serif", fontSize: '14px', fontStyle: 'italic', color: 'rgba(245,240,232,0.6)', marginBottom: '1.5rem' }}>
          Loading flipbook…
        </p>
      )}
      <div style={bookBacking}>
        <div ref={wrapperRef} style={{ width: '100%', minHeight: '60vh', background: 'transparent' }} />
      </div>
      {ready && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem' }}>
          <button onClick={() => flipRef.current?.flipPrev()} style={btnStyle}>← Previous</button>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(245,240,232,0.55)', letterSpacing: '.05em', minWidth: '80px', textAlign: 'center' }}>
            {currentPage + 1} / {totalPages}
          </span>
          <button onClick={() => flipRef.current?.flipNext()} style={btnStyle}>Next →</button>
        </div>
      )}
    </div>
  );
}
