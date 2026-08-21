'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function PhotoSaveBar() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    function hideAddPhotoControls() {
      document.querySelectorAll('label').forEach(label => {
        if (label.textContent?.trim() !== 'Add photo to this page') return;
        const container = label.parentElement;
        if (container) container.style.display = 'none';
      });
    }

    hideAddPhotoControls();
    const observer = new MutationObserver(hideAddPhotoControls);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  function handleSave() {
    const active = document.activeElement as HTMLElement | null;
    active?.blur?.();

    setStatus('saving');
    window.setTimeout(() => {
      router.refresh();
      setStatus('saved');
      window.setTimeout(() => setStatus('idle'), 1400);
    }, 900);
  }

  return (
    <div
      style={{
        position: 'sticky',
        bottom: '12px',
        zIndex: 40,
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '1.25rem',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          background: 'rgba(255,255,255,.96)',
          border: '1px solid rgba(45,90,61,.16)',
          boxShadow: '0 4px 18px rgba(0,0,0,.12)',
          pointerEvents: 'auto',
        }}
      >
        {status === 'saved' && (
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'var(--green-deep)' }}>
            Saved ✓
          </span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={status === 'saving'}
          style={{
            padding: '9px 18px',
            border: 'none',
            background: 'var(--green-deep)',
            color: '#fff',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '.04em',
            cursor: status === 'saving' ? 'wait' : 'pointer',
            opacity: status === 'saving' ? 0.65 : 1,
          }}
        >
          {status === 'saving' ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
