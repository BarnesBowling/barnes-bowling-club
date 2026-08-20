'use client';

import { useEffect, useRef, useState } from 'react';

const PAGE_W = 550;
const PAGE_H = 733;

interface Props {
  pages: string[];
  title: string;
  spineColour: string;
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

function pageBase(isLeft: boolean): HTMLDivElement {
  const page = document.createElement('div');
  page.className = 'shelf-album-page';
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

function buildCover(title: string, spineColour: string): HTMLDivElement {
  const page = document.createElement('div');
  page.className = 'shelf-album-page';
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

  const band = document.createElement('div');
  Object.assign(band.style, {
    position: 'absolute',
    top: '0',
    bottom: '0',
    left: '0',
    width: '7%',
    minWidth: '30px',
    background: spineColour,
    boxShadow: '2px 0 3px rgba(0,0,0,0.13)',
  });

  const block = document.createElement('div');
  Object.assign(block.style, {
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

  block.appendChild(club);
  block.appendChild(heading);
  block.appendChild(subtitle);
  page.appendChild(band);
  page.appendChild(block);
  return page;
}

function buildPhotoPage(src: string, index: number): HTMLDivElement {
  const isLeft = index % 2 === 0;
  const page = pageBase(isLeft);

  const mount = document.createElement('div');
  Object.assign(mount.style, {
    position: 'absolute',
    inset: '7%',
    background: '#ffffff',
    padding: '12px',
    boxSizing: 'border-box',
    border: '1px solid rgba(65,65,65,0.10)',
    boxShadow: '0 2px 9px rgba(0,0,0,0.14)',
    zIndex: '5',
  });

  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  Object.assign(img.style, {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block',
    background: '#ffffff',
  });

  mount.appendChild(img);
  page.appendChild(mount);
  return page;
}

function forceWhiteSurfaces(wrapper: HTMLElement): void {
  wrapper.style.backgroundColor = 'transparent';
  wrapper.querySelectorAll<HTMLElement>('.shelf-album-page').forEach(page => {
    page.style.background = '#ffffff';
    page.style.backgroundColor = '#ffffff';
  });
  wrapper.querySelectorAll<HTMLElement>('.stf__item').forEach(surface => {
    surface.style.background = '#ffffff';
    surface.style.backgroundColor = '#ffffff';
  });
}

export function ShelfAlbumBook({ pages, title, spineColour }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<{ flipPrev(): void; flipNext(): void; destroy?: () => void } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [ready, setReady] = useState(false);
  const totalPages = pages.length + 1;

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

      wrapper.appendChild(buildCover(title, spineColour));
      pages.forEach((src, i) => wrapper.appendChild(buildPhotoPage(src, i + 1)));
      pf.loadFromHTML(Array.from(wrapper.querySelectorAll('.shelf-album-page')) as HTMLElement[]);

      forceWhiteSurfaces(wrapper);
      requestAnimationFrame(() => forceWhiteSurfaces(wrapper));
      window.setTimeout(() => forceWhiteSurfaces(wrapper), 120);

      pf.on('flip', (e: { data: number }) => {
        setCurrentPage(e.data);
        requestAnimationFrame(() => forceWhiteSurfaces(wrapper));
      });

      flipRef.current = pf;
      setReady(true);
    });

    return () => {
      cancelled = true;
      flipRef.current?.destroy?.();
      flipRef.current = null;
    };
  }, [pages, title, spineColour]);

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
      background: '#000000',
      padding: '1.5rem',
      boxSizing: 'border-box',
      minHeight: '70vh',
    }}>
      {!ready && (
        <p style={{
          fontFamily: "'Libre Baskerville', serif",
          fontSize: '14px',
          fontStyle: 'italic',
          color: 'rgba(245,240,232,0.6)',
          marginBottom: '1.5rem',
        }}>
          Loading flipbook…
        </p>
      )}

      <div style={{
        width: '100%',
        maxWidth: '1100px',
        margin: '0 auto',
        background: 'linear-gradient(to right, #ffffff 0%, #ffffff 45%, #f0f0f0 48%, #b8b8b8 49.5%, #777777 50%, #b8b8b8 50.5%, #f0f0f0 52%, #ffffff 55%, #ffffff 100%)',
        boxShadow: '0 8px 28px rgba(0,0,0,0.58)',
        overflow: 'hidden',
      }}>
        <div ref={wrapperRef} style={{ width: '100%', minHeight: '60vh', background: 'transparent' }} />
      </div>

      {ready && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => flipRef.current?.flipPrev()} style={buttonStyle}>← Previous</button>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12px',
            color: 'rgba(245,240,232,0.55)',
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
