import './globals.css';
import type { Metadata } from 'next';
import { CookieConsent } from '@/components/CookieConsent';
export const metadata: Metadata={title:'Barnes Bowling Club',description:'Production website for Barnes Bowling Club'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang='en'><body>{children}<CookieConsent /></body></html>}
