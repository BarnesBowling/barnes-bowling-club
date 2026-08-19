import './globals.css';
import './mobile-nav-fix.css';
import type { Metadata, Viewport } from 'next';
import { CookieConsent } from '@/components/CookieConsent';
import { PwaRegister } from '@/components/PwaRegister';
import { AppPreviewEnhancements } from '@/components/AppPreviewEnhancements';

export const metadata: Metadata = {
  title: 'Barnes Bowling Club',
  description: 'Production website for Barnes Bowling Club',
  applicationName: 'Barnes Bowling Club',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/bbc-app-icon-v4-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/bbc-app-icon-v4-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icons/bbc-app-icon-v4-192.png',
    apple: [
      { url: '/apple-touch-icon-v4.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Barnes Bowls',
  },
};

export const viewport: Viewport = {
  themeColor: '#1b3b2a',
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <AppPreviewEnhancements />
        <PwaRegister />
        <CookieConsent />
      </body>
    </html>
  );
}
