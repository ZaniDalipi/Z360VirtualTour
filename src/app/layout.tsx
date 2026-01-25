import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ClientLayout } from '@/components/layout/ClientLayout'

export const metadata: Metadata = {
  title: 'Z360 Virtual Tours | Professional 360° Tour Services',
  description: 'Professional 360° virtual tour services for real estate, businesses, hospitality, and more. Immersive experiences that showcase your space.',
  keywords: ['virtual tour', '360 tour', 'real estate photography', 'business tour', 'virtual walkthrough', 'immersive tour'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Z360',
    startupImage: [
      {
        url: '/icons/apple-splash-2048-2732.png',
        media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  formatDetection: {
    telephone: true,
    email: true,
  },
  openGraph: {
    title: 'Z360 Virtual Tours',
    description: 'Professional 360° virtual tour services for real estate, businesses, hospitality, and more.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Z360 Virtual Tours',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Z360 Virtual Tours',
    description: 'Professional 360° virtual tour services',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#C9A962' },
    { media: '(prefers-color-scheme: dark)', color: '#0D1B2A' },
  ],
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
