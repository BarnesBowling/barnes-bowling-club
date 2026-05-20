'use client';

import { useEffect, useRef, useState } from 'react';

const PAGE_W = 550;
const PAGE_H = 733;

const CANVAS_TEXTURE = [
  'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.015) 2px, rgba(0,0,0,0.015) 3px)',
  'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.015) 2px, rgba(0,0,0,0.015) 3px)',
].join(', ');

const TAB_DEFS: Array<Record<string, string>> = [
  { top: '-10px',    left: '-10px',   clipPath: 'polygon(0 0, 100% 0, 0 100%)'       },
  { top: '-10px',    right: '-10px',  clipPath: 'polygon(0 0, 100% 0, 100% 100%)'    },
  { bottom: '-10px', left: '-10px',   clipPath: 'polygon(0 0, 0 100%, 100% 100%)'    },
  { bottom: '-10px', right: '-10px',  clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' },
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

// One photo per page. Even index = left page, odd = right page (used for spine shadow direction).
function buildAlbumPage(src: string, index: number): HTMLDivElement {
  const isLeft = index % 2 === 0;

  const page = document.createElement('div');
  page.className = 'album-page';
  Object.assign(page.style, {
    backgroundColor: '#fafaf8',
    backgroundImage: CANVAS_TEXTURE,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '11%',
    boxSizing: 'border-box',
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  });

  // Spine shadow on the inner edge (right edge of left page, left edge of right page)
  const spineShade = document.createElement('div');
  Object.assign(spineShade.style, {
    position: 'absolute',
    top: '0',
    bottom: '0',
    width: '18%',
    pointerEvents: 'none',
    zIndex: '2',
    ...(isLeft
      ? { right: '0', background: 'linear-gradient(to right, transparent 60%, rgba(0,0,0,0.09) 100%)' }
      : { left: '0',  background: 'linear-gradient(to left,  transparent 60%, rgba(0,0,0,0.09) 100%)' }),
  });
  page.appendChild(spineShade);

  // photoWrapper — inline-flex shrinks to the rendered image size so tabs land on photo corners
  const photoWrapper = document.createElement('div');
  Object.assign(photoWrapper.style, {
    position: 'relative',
    display: 'inline-flex',
    overflow: 'visible',
    maxWidth: '100%',
    maxHeight: '100%',
    transform: 'translateY(0)',
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

interface Props {
  pages: string[];
  singlepage? : boolean;
}

export function FlipBook({ pages, singlepage }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<{ flipPrev(): void; flipNext(): void } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const wrapper = wrapperRef.current;

    import('page-flip').then(({ PageFlip }) => {
      if (!wrapperRef.current) return;

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

      if (singlepage) {
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
  }, [pages, singlepage]);

  const btnStyle: React.CSSProperties = {
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
    <div style={{ width: '100%' }}>
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

      <div
        ref={wrapperRef}
        style={{ width: '100%', minHeight: '60vh' }}
      />

      {ready && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          justifyContent: 'center',
          marginTop: '1rem',
        }}>
          <button onClick={() => flipRef.current?.flipPrev()} style={btnStyle}>← Previous</button>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12px',
            color: 'rgba(245,240,232,0.55)',
            letterSpacing: '.05em',
            minWidth: '80px',
            textAlign: 'center',
          }}>
            {currentPage + 1} / {pages.length}
          </span>
          <button onClick={() => flipRef.current?.flipNext()} style={btnStyle}>Next →</button>
        </div>
      )}
    </div>
  );
}
