'use client';

import { useState, useEffect } from 'react';
import { BowlPositionDiagrams } from './BowlPositionDiagrams';
import { ShotDiagrams } from './ShotDiagrams';
import { GreenDiagrams } from './GreenDiagrams';
import { GameTypeDiagrams } from './GameTypeDiagrams';

type Section = { id: string; title: string; body: string; sort_order: number };

const DIAGRAM_SECTION = 'Bowl & Jack Positions';
const SHOT_SECTION = 'Types of Shot';
const GREEN_SECTION = 'The Green & The Rink';
const GAME_SECTION = 'Types of Game';

export function HowToPlayAccordion({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#section-')) {
      const order = parseInt(hash.replace('#section-', ''), 10);
      const match = sections.find(s => s.sort_order === order);
      if (match) { setOpen(match.id); return; }
    }
    setOpen(sections[0]?.id ?? null);
  }, [sections]);

  return (
    <div style={{ borderTop: '1.5px solid rgba(45,90,61,.15)' }}>
      {sections.map((s) => {
        const isOpen = open === s.id;
        const hasDiagrams = s.title === DIAGRAM_SECTION;
        const hasShots = s.title === SHOT_SECTION;
        const hasGreen = s.title === GREEN_SECTION;
        const hasGame = s.title === GAME_SECTION;

        return (
          <div key={s.id} id={`section-${s.sort_order}`} style={{ borderBottom: '1px solid rgba(45,90,61,.1)', scrollMarginTop: '80px' }}>
            <button
              onClick={() => setOpen(isOpen ? null : s.id)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '11px',
                  color: 'var(--gold)',
                  fontWeight: 500,
                  minWidth: '24px',
                }}>
                  {String(s.sort_order).padStart(2, '0')}
                </span>
                <span style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '20px',
                  fontWeight: 500,
                  color: isOpen ? 'var(--green-mid)' : 'var(--green-deep)',
                  transition: 'color .2s',
                }}>
                  {s.title}
                </span>
                {(hasDiagrams || hasShots || hasGreen || hasGame) && (
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 600,
                    letterSpacing: '.12em',
                    textTransform: 'uppercase',
                    color: 'var(--gold)',
                    border: '1px solid rgba(201,168,76,.35)',
                    padding: '2px 7px',
                  }}>
                    Diagrams
                  </span>
                )}
              </div>
              <span style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: '1.5px solid rgba(45,90,61,.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'var(--green-mid)',
                fontSize: '18px',
                fontWeight: 300,
                transition: 'transform .25s, border-color .2s',
                transform: isOpen ? 'rotate(45deg)' : 'none',
              }}>
                +
              </span>
            </button>

            <div style={{
              overflow: 'hidden',
              maxHeight: isOpen ? (hasDiagrams || hasShots || hasGreen || hasGame ? '2400px' : '600px') : '0',
              transition: 'max-height .4s ease',
            }}>
              <div style={{ paddingBottom: '2.5rem', paddingLeft: '3.5rem' }}>
                {/* Body text */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '240px 1fr',
                  gap: '3rem',
                  marginBottom: (hasDiagrams || hasShots || hasGreen || hasGame) ? '2.5rem' : 0,
                }}>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '13px',
                    color: 'var(--green-lawn)',
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                    paddingTop: '3px',
                  }}>
                    {s.title}
                  </div>
                  <p style={{
                    fontFamily: "'Libre Baskerville', serif",
                    fontSize: '15px',
                    lineHeight: 1.9,
                    color: 'var(--text-mid)',
                    margin: 0,
                  }}>
                    {s.body}
                  </p>
                </div>

                {/* Diagrams */}
                {hasDiagrams && <BowlPositionDiagrams />}
                {hasShots && <ShotDiagrams />}
                {hasGreen && <GreenDiagrams />}
                {hasGame && <GameTypeDiagrams />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
