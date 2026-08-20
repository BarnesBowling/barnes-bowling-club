'use client';

import { useEffect, useState } from 'react';
import type { RichPage, RichPageLayout } from '@/data/photo-books';
import { FlipBook } from './FlipBook';

// Heights ×1.2 of original [210,195,215,198,207,192]
const SPINE_HEIGHTS = [252, 234, 258, 238, 248, 230];

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
  // Book at index 4 leans against the book at index 3
  if (i === 4) return hovered ? 'translateY(-8px) rotate(12deg)' : 'rotate(12deg)';
  return hovered ? 'translateY(-8px)' : 'none';
}

export type DbBook = {
  id: string;
  title: string;
  spine_colour: string;
  single_page: boolean;
  sort_order: number;
};

export type DbPage = {
  id: string;
  sort_order: number;
  layout: string;
  page_title: string | null;
  page_subtitle: string | null;
  shared_caption: string | null;
  photos: { src: string; caption?: string }[];
};

interface Props {
  books: DbBook[];
  pagesByBook: Record<string, DbPage[]>;
}

function toRichPage(p: DbPage): RichPage {
  return {
    layout: p.layout as RichPageLayout,
    title: p.page_title ?? undefined,
    subtitle: p.page_subtitle ?? undefined,
    sharedCaption: p.shared_caption ?? undefined,
    photos: p.photos,
  };
}

interface SelectedBook {
  id: string;
  title: string;
  spineColour: string;
  singlePage: boolean;
  pages: string[];
  richPages?: RichPage[];
}

export function BookShelf({ books, pagesByBook }: Props) {
  const [selected, setSelected] = useState<SelectedBook | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const sorted = [...books].sort((a, b) => a.sort_order - b.sort_order);

  // First up to 10 books: upright. Next 2: flat. Any beyond 12: upright at end.
  const uprightBooks = sorted.slice(0, 10);
  const flatBooks = sorted.slice(10, 12);
  const extraBooks = sorted.slice(12);

  // For flat layout: intl on top, the one before it on bottom — preserve original stacking order
  const flatDisplay = [...flatBooks].reverse();

  function openBook(book: DbBook) {
    const dbPages = pagesByBook[book.id] ?? [];
    const hasSingleLayout = dbPages.length > 0 && dbPages.every(p => p.layout === 'single');
    const hasRichLayouts = dbPages.some(p => p.layout !== 'single');

    if (book.single_page) {
      setSelected({
        id: book.id,
        title: book.title,
        spineColour: book.spine_colour,
        singlePage: true,
        pages: dbPages.map(p => p.photos[0]?.src ?? '').filter(Boolean),
        richPages: undefined,
      });
    } else if (hasRichLayouts || (!hasSingleLayout && dbPages.length > 0)) {
      setSelected({
        id: book.id,
        title: book.title,
        spineColour: book.spine_colour,
        singlePage: false,
        pages: [],
        richPages: dbPages.map(toRichPage),
      });
    } else if (hasSingleLayout) {
      setSelected({
        id: book.id,
        title: book.title,
        spineColour: book.spine_colour,
        singlePage: false,
        pages: dbPages.map(p => p.photos[0]?.src ?? '').filter(Boolean),
        richPages: undefined,
      });
    } else {
      setSelected({
        id: book.id,
        title: book.title,
        spineColour: book.spine_colour,
        singlePage: false,
        pages: [],
        richPages: undefined,
      });
    }
  }

  function hasContent(book: DbBook): boolean {
    return (pagesByBook[book.id]?.length ?? 0) > 0;
  }

  function renderUprightBook(book: DbBook, i: number) {
    const isLeaning = i === 4;
    const isHovered = hovered === book.id;
    return (
      <div
        key={book.id}
        onClick={() => openBook(book)}
        onMouseEnter={() => setHovered(book.id)}
        onMouseLeave={() => setHovered(null)}
        title={hasContent(book) ? `Open: ${book.title}` : `${book.title} — coming soon`}
        style={{
          flexShrink: 0,
          width: 'clamp(36px, 6vw, 55px)',
          height: `${SPINE_HEIGHTS[i % SPINE_HEIGHTS.length]}px`,
          background: book.spine_colour,
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
          opacity: hasContent(book) ? 1 : 0.75,
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
  }

  return (
    <>
      {/* Library background */}
      <div style={{
        background: 'linear-gradient(180deg, #F5EDD8 0%, #E8D9BC 100%)',
        borderRadius: '6px',
        padding: '4rem 2rem 0',
      }}>
        {/* Books row */}
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

          {/* Upright books 0–9 */}
          {uprightBooks.map((book, i) => renderUprightBook(book, i))}

          {/* Flat books (stacked at right end) */}
          {flatBooks.length > 0 && (
            <div style={{
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              alignSelf: 'flex-end',
              marginLeft: '10px',
            }}>
              {flatDisplay.map((book, fi) => (
                <div
                  key={book.id}
                  onClick={() => openBook(book)}
                  onMouseEnter={() => setHovered(book.id)}
                  onMouseLeave={() => setHovered(null)}
                  title={hasContent(book) ? `Open: ${book.title}` : `${book.title} — coming soon`}
                  style={{
                    width: '211px',
                    height: '55px',
                    background: fi === 0 ? 'var(--gold, #C9A84C)' : book.spine_colour,
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
                    opacity: hasContent(book) ? 1 : 0.75,
                  }}
                >
                  <div style={{ position: 'absolute', left: '10px', top: 0, bottom: 0, width: '3px', background: 'rgba(255,255,255,0.2)' }} />
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
          )}

          {/* Extra upright books beyond index 11 */}
          {extraBooks.map((book, i) => renderUprightBook(book, i + 12))}

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
              {(selected.richPages?.length ?? selected.pages.length) > 0 ? (
                <FlipBook
                  key={selected.id}
                  pages={selected.pages}
                  richPages={selected.richPages}
                  singlepage={selected.singlePage}
                />
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
