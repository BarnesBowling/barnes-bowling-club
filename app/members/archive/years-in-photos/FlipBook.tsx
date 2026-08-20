'use client';

import { useEffect, useRef, useState } from 'react';
import type { RichPage } from '@/data/photo-books';

const PAGE_W = 550;
const PAGE_H = 733;
const RICH_BOOK_TITLE = '2026 Season';
const RICH_BOOK_SPINE_COLOUR = '#2D5A3D';

type CaptionPlacement = 'below' | 'above' | 'overlay-top' | 'overlay-bottom';
type CaptionFont = 'Libre Baskerville' | 'Playfair Display' | 'DM Sans' | 'Josefin Sans' | 'Optima';
type PhotoHorizontalPosition = 'left' | 'center' | 'right';
type PhotoVerticalPosition = 'top' | 'center' | 'bottom';

type StyledPhoto = RichPage['photos'][number] & {
  captionFontSize?: number;
  captionColor?: string;
  captionPlacement?: CaptionPlacement;
  captionFont?: CaptionFont;
  photoScale?: number;
  photoHorizontal?: PhotoHorizontalPosition;
  photoVertical?: PhotoVerticalPosition;
};

const TAB_DEFS: Array<Record<string, string>> = [
  { top: '-10px', left: '-10px', clipPath: 'polygon(0 0, 100% 0, 0 100%)' },
  { top: '-10px', right: '-10px', clipPath: 'polygon(0 0, 100% 0, 100% 100%)' },
  { bottom: '-10px', left: '-10px', clipPath: 'polygon(0 0, 0 100%, 100% 100%)' },
  { bottom: '-10px', right: '-10px', clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' },
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

function horizontalFlex(position: PhotoHorizontalPosition): string {
  if (position === 'left') return 'flex-start';
  if (position === 'right') return 'flex-end';
  return 'center';
}

function verticalFlex(position: PhotoVerticalPosition): string {
  if (position === 'top') return 'flex-start';
  if (position === 'bottom') return 'flex-end';
  return 'center';
}

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
  const shade = document.createElement('div');
  Object.assign(shade.style, {
    position: 'absolute',
    top: '0',
    bottom: '0',
    width: '18%',
    pointerEvents: 'none',
    zIndex: '20',
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

function albumPageBase(isLeft: boolean): HTMLDivElement {
  const page = document.createElement('div');
  page.className = 'album-page';
  Object.assign(page.style, {
    background: '#ffffff',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    isolation: 'isolate',
    boxShadow: isLeft
      ? 'inset -1px 0 rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.24)'
      : 'inset 1px 0 rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.24)',
  });
  page.appendChild(spineShadeEl(isLeft));
  return page;
}

function buildFrontCover(title: string, spineColour: string): HTMLDivElement {
  const page = document.createElement('div');
  page.className = 'album-page';
  Object.assign(page.style, {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    background: '#ffffff',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 10px rgba(0,0,0,0.24)',
  });

  const spineBand = document.createElement('div');
  Object.assign(spineBand.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    bottom: '0',
    width: '7%',
    minWidth: '30px',
    background: spineColour,
    boxShadow: '2px 0 3px rgba(0,0,0,0.13)',
  });

  const titleBlock = document.createElement('div');
  Object.assign(titleBlock.style, {
    position: 'absolute',
    inset: '12% 12% 12% 16%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  });

  const club = document.createElement('div');
  club.textContent = 'Barnes Bowling Club';
  Object.assign(club.style, {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#A89560',
    marginBottom: '12px',
  });

  const heading = document.createElement('div');
  heading.textContent = title;
  Object.assign(heading.style, {
    fontFamily: "'Playfair Display', serif",
    fontSize: '36px',
    lineHeight: '1.15',
    fontWeight: '700',
    color: '#1a3a2a',
  });

  const subtitle = document.createElement('div');
  subtitle.textContent = 'A year in photographs';
  Object.assign(subtitle.style, {
    fontFamily: "'Libre Baskerville', serif",
    fontSize: '13px',
    fontStyle: 'italic',
    color: '#77746c',
    marginTop: '12px',
  });

  titleBlock.appendChild(club);
  titleBlock.appendChild(heading);
  titleBlock.appendChild(subtitle);
  page.appendChild(spineBand);
  page.appendChild(titleBlock);
  return page;
}

function captionEl(photo: StyledPhoto, overlay = false): HTMLDivElement {
  const el = document.createElement('div');
  el.textContent = photo.caption ?? '';
  const captionFont = photo.captionFont ?? 'Libre Baskerville';

  Object.assign(el.style, {
    fontFamily: captionFontCss(captionFont),
    fontSize: `${photo.captionFontSize ?? 11}px`,
    fontStyle: captionFont === 'Libre Baskerville' ? 'italic' : 'normal',
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
      zIndex: '12',
      padding: '6px 8px',
      background: 'rgba(255,255,255,0.84)',
      borderRadius: '2px',
      ...(photo.captionPlacement === 'overlay-top' ? { top: '5%' } : { bottom: '5%' }),
    });
  } else {
    Object.assign(el.style, {
      flexShrink: '0',
      minHeight: '18px',
      padding: '6px 2px 2px',
    });
  }
  return el;
}

function photoFrame(photo: StyledPhoto, fit: 'contain' | 'cover' = 'contain'): HTMLDivElement {
  const scale = Math.min(Math.max(photo.photoScale ?? 100, 40), 100);
  const horizontal = photo.photoHorizontal ?? 'center';
  const vertical = photo.photoVertical ?? 'center';

  const mount = document.createElement('div');
  Object.assign(mount.style, {
    width: `${scale}%`,
    height: `${scale}%`,
    position: 'relative',
    flexShrink: '0',
    background: '#ffffff',
    padding: '12px',
    boxSizing: 'border-box',
    border: '1px solid rgba(65,65,65,0.10)',
    boxShadow: '0 2px 9px rgba(0,0,0,0.14)',
  });

  const imageWell = document.createElement('div');
  Object.assign(imageWell.style, {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    background: '#ffffff',
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
    objectPosition: `${horizontal} ${vertical}`,
    display: 'block',
  });
  imageWell.appendChild(img);

  if (
    (photo.captionPlacement === 'overlay-top' || photo.captionPlacement === 'overlay-bottom') &&
    photo.caption
  ) {
    imageWell.appendChild(captionEl(photo, true));
  }

  mount.appendChild(imageWell);
  return mount;
}

function buildPhotoBlock(photoRaw: RichPage['photos'][number], fit: 'contain' | 'cover' = 'contain'): HTMLDivElement {
  const photo = photoRaw as StyledPhoto;
  const horizontal = photo.photoHorizontal ?? 'center';
  const vertical = photo.photoVertical ?? 'center';
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
    alignItems: verticalFlex(vertical),
    justifyContent: horizontalFlex(horizontal),
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
  Object.assign(inner.style, { position: 'absolute', inset: '7%' });
  if (rp.photos[0]) inner.appendChild(buildPhotoBlock(rp.photos[0], 'contain'));
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
    photoArea.appendChild(buildPhotoBlock(rp.photos[0], 'contain'));
    inner.appendChild(photoArea);
  }

  page.appendChild(inner);
  return page;
}

function buildTwoPhotosPage(rp: RichPage, isLeft: boolean, fit: 'contain' | 'cover'): HTMLDivElement {
  const page = albumPageBase(isLeft);
  const inner = document.createElement('div');
  Object.assign(inner.style, {
    padding: '7%',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
    gap: '12px',
  });
  addHeader(inner, rp);

  rp.photos.slice(0, 2).forEach(photo => {
    const slot = document.createElement('div');
    Object.assign(slot.style, { flex: '1', minHeight: '0' });
    slot.appendChild(buildPhotoBlock(photo, fit));
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
    gap: '10px',
  });

  rp.photos.slice(0, 4).forEach(photo => {
    const cell = document.createElement('div');
    Object.assign(cell.style, { minHeight: '0', minWidth: '0' });
    cell.appendChild(buildPhotoBlock(photo, 'contain'));
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
    gap: '12px',
  });

  rp.photos.slice(0, 2).forEach(photo => {
    const slot = document.createElement('div');
    Object.assign(slot.style, { flex: '1', minHeight: '0' });
    slot.appendChild(buildPhotoBlock(photo, 'contain'));
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
    case 'title-hero': return buildTitleHeroPage(rp, isLeft);
    case 'two-photos': return buildTwoPhotosPage(rp, isLeft, 'cover');
    case 'sf-pair': return buildTwoPhotosPage(rp, isLeft, 'contain');
    case 'grid-left':
    case 'grid-right': return buildGridPage(rp, isLeft);
    case 'grid-2x2': return buildGrid2x2Page(rp, isLeft);
    case 'sf-single':
    case 'single':
    default: return buildSinglePage(rp, isLeft);
  }
}

function forceWhiteBookSurfaces(wrapper: HTMLElement): void {
  wrapper.style.backgroundColor = 'transparent';

  wrapper.querySelectorAll<HTMLElement>('.album-page').forEach(page => {
    page.style.background = '#ffffff';
    page.style.backgroundColor = '#ffffff';
  });

  wrapper.querySelectorAll<HTMLElement>('.stf__item').forEach(pageSurface => {
    pageSurface.style.background = '#ffffff';
    pageSurface.style.backgroundColor = '#ffffff';
  });
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

  const totalPages = richPages ? richPages.length + 1 : pages.length;
  const richBook = Boolean(richPages);

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
        wrapper.appendChild(buildFrontCover(RICH_BOOK_TITLE, RICH_BOOK_SPINE_COLOUR));
        richPages.forEach((rp, i) => wrapper.appendChild(buildRichPage(rp, i + 1)));
        pf.loadFromHTML(Array.from(wrapper.querySelectorAll('.album-page')) as HTMLElement[]);

        forceWhiteBookSurfaces(wrapper);
        requestAnimationFrame(() => forceWhiteBookSurfaces(wrapper));
        window.setTimeout(() => forceWhiteBookSurfaces(wrapper), 120);
      } else if (singlepage) {
        pages.forEach((src, i) => wrapper.appendChild(buildAlbumPage(src, i)));
        pf.loadFromHTML(Array.from(wrapper.querySelectorAll('.album-page')) as HTMLElement[]);
      } else {
        pf.loadFromImages(pages);
      }

      pf.on('flip', (e: { data: number }) => {
        setCurrentPage(e.data);
        if (richPages) requestAnimationFrame(() => forceWhiteBookSurfaces(wrapper));
      });
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
    <div style={{
      width: '100%',
      background: singlepage ? 'transparent' : '#000000',
      padding: singlepage ? 0 : '1.5rem',
      boxSizing: 'border-box',
      minHeight: singlepage ? undefined : '70vh',
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

      <div style={bookBacking}>
        <div
          ref={wrapperRef}
          style={{
            width: '100%',
            minHeight: '60vh',
            background: 'transparent',
          }}
        />
      </div>

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
