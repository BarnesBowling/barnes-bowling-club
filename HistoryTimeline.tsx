'use client';
import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { historyTimeline } from '@/data/history-timeline';

interface PopupPos {
  entry: (typeof historyTimeline)[0];
  x: number;
  y: number;
}

export function HistoryTimeline() {
  const [popup, setPopup] = useState<PopupPos | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const open = useCallback((el: HTMLElement, entry: (typeof historyTimeline)[0]) => {
    const rect = el.getBoundingClientRect();
    setPopup({ entry, x: rect.left + rect.width / 2, y: rect.bottom });
  }, []);

  return (
    <div className="yt-root">
      <div className="yt-label">Key Milestones</div>

      <div className="yt-wrap">
        <div className="yt-rail">
          {historyTimeline.map((entry) => {
            const hasContent = entry.title !== 'TBD';
            const isActive = popup?.entry.year === entry.year;
            return (
              <div
                key={entry.year}
                className="year-marker"
                onMouseEnter={(e) => { if (hasContent) open(e.currentTarget, entry); }}
                onMouseLeave={() => setPopup(null)}
                onClick={(e) => {
                  if (!hasContent) return;
                  if (isActive) setPopup(null);
                  else open(e.currentTarget, entry);
                }}
              >
                <button
                  className={`yt-item${isActive ? ' yt-item--on' : ''}${!hasContent ? ' yt-item--tbd' : ''}`}
                  aria-expanded={isActive}
                >
                  {entry.year}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {mounted && popup && createPortal(
        <div
          className="yt-detail"
          style={{
            position: 'fixed',
            left: popup.x,
            top: popup.y,
            transform: 'translateX(-50%)',
          }}
        >
          <span className="yt-detail-yr">{popup.entry.year}</span>
          <strong className="yt-detail-title">{popup.entry.title}</strong>
          <p className="yt-detail-body">{popup.entry.description}</p>
        </div>,
        document.body
      )}
    </div>
  );
}
