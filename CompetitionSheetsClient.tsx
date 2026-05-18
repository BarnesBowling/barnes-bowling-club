'use client';

import { useState, useEffect } from 'react';
import type { CompetitionSheet, Competition } from '@/data/competition-sheets';
import { SheetBracketView } from './SheetBracketView';
import { ManserRoundRobinGrid } from './ManserRoundRobinGrid';

const FILTERS: { value: 'all' | Competition; label: string }[] = [
  { value: 'all',    label: 'All'    },
  { value: 'cup',    label: 'Cup'    },
  { value: 'shield', label: 'Shield' },
  { value: 'pairs',  label: 'Pairs'  },
  { value: 'manser', label: 'Manser' },
];

export function CompetitionSheetsClient({ sheets }: { sheets: CompetitionSheet[] }) {
  const [active, setActive]       = useState<'all' | Competition>('all');
  const [lightbox, setLightbox]   = useState<CompetitionSheet | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightbox]);

  function handleCard(sheet: CompetitionSheet) {
    if (sheet.type === 'image') setLightbox(sheet);
    else if (sheet.type === 'pdf') window.open(sheet.src, '_blank');
  }

  return (
    <>
      {/* ── Filter bar ── */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '0.75rem',
        }}>
          Filter by competition
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {FILTERS.map(({ value, label }) => {
            const isActive = active === value;
            return (
              <button
                key={value}
                onClick={() => setActive(value)}
                style={{
                  padding: '7px 20px',
                  border: '1px solid rgba(45,90,61,.3)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'background .15s, color .15s, border-color .15s',
                  background:   isActive ? 'var(--green-deep)' : 'transparent',
                  color:        isActive ? '#fff' : 'var(--green-deep)',
                  borderColor:  isActive ? 'var(--green-deep)' : 'rgba(45,90,61,.3)',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Brackets / Grids ── */}
      {(active === 'all' ? (['cup', 'shield', 'pairs', 'manser'] as Competition[]) : [active]).flatMap(comp =>
        sheets
          .filter(s => s.competition === comp)
          .map(sheet => (
            <div key={sheet.id} style={{ marginBottom: '3rem' }}>
              {sheet.type === 'round-robin' && sheet.players ? (
                <ManserRoundRobinGrid players={sheet.players} rules={sheet.rules} initialScores={sheet.initialScores} />
              ) : (
                <SheetBracketView sheet={sheet} />
              )}
            </div>
          ))
      )}

      {/* ── Image lightbox ── */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.88)',
            zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={lightbox.src}
            alt={lightbox.title}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', boxShadow: '0 8px 40px rgba(0,0,0,0.6)', cursor: 'default' }}
          />
        </div>
      )}

    </>
  );
}
