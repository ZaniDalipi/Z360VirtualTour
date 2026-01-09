import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import { CookieConsent } from '@/components/CookieConsent'
import { JsonLd } from '@/components/JsonLd'
import { generateOrganizationSchema, generateLocalBusinessSchema } from '@/lib/seo'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://z360-virtual-tour.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Z360 Virtual Tours | Professional 360° Tour Services',
    template: '%s | Z360 Virtual Tours',
  },
  description: 'Professional 360° virtual tour services for real estate, businesses, hospitality, and more. Immersive experiences that showcase your space across the Balkans.',
  keywords: ['virtual tour', '360 tour', 'real estate photography', 'business tour', 'virtual walkthrough', 'immersive tour', 'property tour', 'Balkans', 'Macedonia', 'Skopje'],
  authors: [{ name: 'Z360 Virtual Tours', url: BASE_URL }],
  creator: 'Z360 Virtual Tours',
  publisher: 'Z360 Virtual Tours',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'Z360 Virtual Tours',
    title: 'Z360 Virtual Tours | Professional 360° Tour Services',
    description: 'Professional 360° virtual tour services for real estate, businesses, hospitality, and more. Immersive experiences that showcase your space.',
    images: [
      {
        url: `${BASE_URL}/images/og-default.svg`,
        width: 1200,
        height: 630,
        alt: 'Z360 Virtual Tours',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Z360 Virtual Tours | Professional 360° Tour Services',
    description: 'Professional 360° virtual tour services for real estate, businesses, hospitality, and more.',
    images: [`${BASE_URL}/images/og-default.jpg`],
    creator: '@z360tours',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <JsonLd data={[generateOrganizationSchema(), generateLocalBusinessSchema()]} />
      </head>
      <body className={`${inter.className} overflow-x-hidden`}>
        <Providers>
          <div className="min-h-screen bg-navy w-full max-w-full overflow-x-hidden">
            {children}
          </div>
          <CookieConsent />
        </Providers>
      </body>
    </html>
  )
}
