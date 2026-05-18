'use client';

import Script from 'next/script';

export function BeholdWidget({ feedId }: { feedId: string }) {
  return (
    <>
      {/* @ts-expect-error — behold-widget is a custom element */}
      <behold-widget feed-id={feedId} style={{ width: '100%', display: 'block' }} />
      <Script
        src="https://w.behold.so/widget.js"
        strategy="afterInteractive"
        type="module"
      />
    </>
  );
}
