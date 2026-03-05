import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://z360-virtual-tour.vercel.app'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0D1B2A',
};

export const metadata: Metadata = {
  title: 'Z360 Virtual Tours | Professional 360° Tour Services',
  description:
    'Professional 360° virtual tour services for real estate, businesses, hospitality, and more. Immersive experiences that showcase your space.',
  keywords: [
    'virtual tour',
    '360 tour',
    'real estate photography',
    'business tour',
    'virtual walkthrough',
    'immersive tour',
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Z360 Tours',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-navy">{children}</div>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
