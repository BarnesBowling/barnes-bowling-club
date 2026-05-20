'use client';

import { useState, useEffect, useCallback } from 'react';

interface Issue {
  title: string;
  date: string;
  issue: string;
  src: string;
  pdf?: string;
  type: 'image' | 'pdf';
}

export function NewsletterGrid({ issues }: { issues: Issue[] }) {
  const [lightbox, setLightbox] = useState<Issue | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox]);

  const handleClick = useCallback((issue: Issue) => {
    if (issue.type === 'image') setLightbox(issue);
    else window.open(issue.pdf ?? issue.src, '_blank');
  }, []);

  return (
    <>
      <style>{`
        .nl-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        @media (max-width: 600px) {
          .nl-grid { grid-template-columns: 1fr; }
        }
        .nl-card {
          cursor: pointer;
          background: #fff;
          border-radius: 2px;
          overflow: hidden;
          box-shadow: 3px 3px 10px rgba(0,0,0,0.10);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .nl-card:hover {
          transform: translateY(-2px);
          box-shadow: 5px 5px 16px rgba(0,0,0,0.15);
        }
      `}</style>

      <div className="nl-grid">
        {issues.map((issue) => (
          <div
            key={issue.src}
            className="nl-card"
            onClick={() => handleClick(issue)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(issue); }}
            aria-label={`Open ${issue.title}`}
          >
            <img
              src={issue.src}
              alt={issue.title}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            <div style={{ padding: '0.75rem 1rem 1rem' }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--green-deep)',
                lineHeight: 1.3,
              }}>
                {issue.title}
              </div>
              <div style={{
                fontFamily: "'Optima', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontSize: '12px',
                color: 'rgba(45,90,61,0.65)',
                marginTop: '4px',
              }}>
                {issue.date} · {issue.issue}
              </div>
            </div>
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.88)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            cursor: 'zoom-out',
          }}
        >
          <img
            src={lightbox.src}
            alt={lightbox.title}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
              cursor: 'default',
            }}
          />
        </div>
      )}
    </>
  );
}
