'use client';

import { useEffect, useState } from 'react';
import { photoBooks, type PhotoBook } from '@/data/photo-books';
import { FlipBook } from './FlipBook';

// Heights ×1.2 of original [210,195,215,198,207,192]
const SPINE_HEIGHTS = [252, 234, 258, 238, 248, 230];

// Books 10–11 lie flat at the shelf end: intl on top, 2003-07 on bottom
const FLAT_BOOKS = [photoBooks[11], photoBooks[10]];

const shelfSurface: React.CSSProperties = {
  height: '20px',
  background: 'linear-gradient(180deg, #C8923C 0%, #A06D28 50%, #7B5018 100%)',
  boxShadow: '0 8px 22px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',
  borderRadius: '1px',
};

const shelfFloor: React.CSSProperties = {
  height: '1.5rem',
  background: 'linear-gradient(180deg, rgba(0,0,0,0.07) 0%, transparent 100%)',
};

function uprightTransform(i: number, hovered: boolean): string {
  // Book 4 (2020-22) leans against the upright book 3 (2023)
  if (i === 4) return hovered ? 'translateY(-8px) rotate(12deg)' : 'rotate(12deg)';
  return hovered ? 'translateY(-8px)' : 'none';
}

export function BookShelf() {
  const [selected, setSelected] = useState<PhotoBook | null>(null);
  const [hovered,  setHovered]  = useState<string | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  return (
    <>
      {/* Library background */}
      <div style={{
        background: 'linear-gradient(180deg, #F5EDD8 0%, #E8D9BC 100%)',
        borderRadius: '6px',
        // Extra top padding so leaning-book tops don't clip
        padding: '4rem 2rem 0',
      }}>
        {/* Books row — all 12 on one shelf */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '3px',
          overflowX: 'auto',
          paddingLeft: '1.25rem',
          paddingRight: '1.25rem',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        } as React.CSSProperties}>

          {/* Books 0–9: upright (books 3 & 4 lean) */}
          {photoBooks.slice(0, 10).map((book, i) => {
            const isLeaning = i === 4;
            const isHovered = hovered === book.id;
            return (
              <div
                key={book.id}
                onClick={() => setSelected(book)}
                onMouseEnter={() => setHovered(book.id)}
                onMouseLeave={() => setHovered(null)}
                title={book.pages.length ? `Open: ${book.title}` : `${book.title} — coming soon`}
                style={{
                  flexShrink: 0,
                  width: 'clamp(36px, 6vw, 55px)',
                  height: `${SPINE_HEIGHTS[i % SPINE_HEIGHTS.length]}px`,
                  background: book.spineColour,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  transform: uprightTransform(i, isHovered),
                  transformOrigin: isLeaning ? 'bottom center' : undefined,
                  boxShadow: isHovered
                    ? '4px 0 14px rgba(0,0,0,0.5), -1px 0 0 rgba(255,255,255,0.1)'
                    : '3px 0 8px rgba(0,0,0,0.3), -1px 0 0 rgba(255,255,255,0.06)',
                  borderRadius: '2px 1px 0 0',
                  opacity: book.pages.length ? 1 : 0.75,
                  // Breathing room around the leaning book
                  marginRight: i === 4 ? '8px' : undefined,
                }}
              >
                <div style={{ position: 'absolute', top: '14px', left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.2)' }} />
                <div style={{ position: 'absolute', bottom: '14px', left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.2)' }} />
                <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '7px', background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.28))', borderRadius: '0 1px 0 0' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '2px', background: 'rgba(255,255,255,0.12)' }} />
                <span style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '18.75px',
                  fontStyle: 'italic',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.92)',
                  letterSpacing: '0.07em',
                  textAlign: 'center',
                  padding: '0 2px',
                  userSelect: 'none',
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  lineHeight: 1.2,
                }}>
                  {book.title}
                </span>
              </div>
            );
          })}

          {/* Books 10–11: lying flat, stacked at the right end */}
          <div style={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            alignSelf: 'flex-end',
            marginLeft: '10px',
          }}>
            {FLAT_BOOKS.map((book, fi) => (
              <div
                key={book.id}
                onClick={() => setSelected(book)}
                onMouseEnter={() => setHovered(book.id)}
                onMouseLeave={() => setHovered(null)}
                title={book.pages.length ? `Open: ${book.title}` : `${book.title} — coming soon`}
                style={{
                  width: '211px',
                  height: '55px',
                  background: fi === 0 ? 'var(--gold, #C9A84C)' : book.spineColour,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  transform: hovered === book.id ? 'translateY(-4px)' : 'none',
                  boxShadow: hovered === book.id
                    ? '0 -4px 12px rgba(0,0,0,0.4), 2px 0 0 rgba(0,0,0,0.15)'
                    : '0 -2px 6px rgba(0,0,0,0.2), 2px 0 0 rgba(0,0,0,0.1)',
                  borderRadius: '1px 1px 0 0',
                  opacity: book.pages.length ? 1 : 0.75,
                }}
              >
                {/* Spine edge detail (left side when lying flat) */}
                <div style={{ position: 'absolute', left: '10px', top: 0, bottom: 0, width: '3px', background: 'rgba(255,255,255,0.2)' }} />
                {/* Bottom shadow for stacking depth */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '5px', background: 'rgba(0,0,0,0.18)', borderRadius: '0 0 1px 1px' }} />
                <span style={{
                  fontFamily: "'Libre Baskerville', serif",
                  fontSize: '15.5px',
                  fontStyle: 'italic',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.9)',
                  letterSpacing: '0.06em',
                  userSelect: 'none',
                  textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  padding: '0 1rem',
                  maxWidth: '100%',
                }}>
                  {book.title}
                </span>
              </div>
            ))}
          </div>

        </div>

        {/* Wooden shelf surface */}
        <div style={shelfSurface} />
        {/* Floor shadow */}
        <div style={shelfFloor} />
      </div>

      {/* Hint */}
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '12px',
        color: 'var(--text-muted)',
        letterSpacing: '.04em',
        marginTop: '0.85rem',
        textAlign: 'center',
      }}>
        Click a book spine to open
      </p>

      {/* Full-screen modal */}
      {selected && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(8,8,8,0.9)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem 1rem',
            overflowY: 'auto',
          }}
        >
          <div style={{ width: '100%', maxWidth: '1180px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{
                fontFamily: "'Libre Baskerville', serif",
                fontSize: 'clamp(1.1rem, 3vw, 1.55rem)',
                color: 'var(--cream, #F5F0E8)',
                margin: 0,
                fontWeight: 400,
              }}>
                {selected.title}
              </h2>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  color: 'rgba(255,255,255,0.85)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: selected.singlePage ? '#fafaf8' : '#1c1c1c', borderRadius: '4px', padding: '1.5rem' }}>
              {selected.pages.length > 0 ? (
                <FlipBook key={selected.id} pages={selected.pages} singlepage={selected.singlePage} />
              ) : (
                <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                  <p style={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: '1.1rem',
                    fontStyle: 'italic',
                    color: 'rgba(245,240,232,0.55)',
                    margin: '0 0 0.5rem',
                  }}>
                    Coming soon
                  </p>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    color: 'rgba(245,240,232,0.35)',
                    margin: 0,
                    letterSpacing: '.03em',
                  }}>
                    Photos for this season are being digitised and will appear here shortly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
