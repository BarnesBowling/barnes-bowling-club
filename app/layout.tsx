import './globals.css';
import type { Metadata, Viewport } from 'next';
import { CookieConsent } from '@/components/CookieConsent';
import { PwaRegister } from '@/components/PwaRegister';

export const metadata: Metadata = {
  title: 'Barnes Bowling Club',
  description: 'Production website for Barnes Bowling Club',
  applicationName: 'Barnes Bowling Club',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icons/bbc-app-icon.svg',
    apple: '/icons/bbc-app-icon.svg',
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
        <PwaRegister />
        <CookieConsent />
      </body>
    </html>
  );
}
