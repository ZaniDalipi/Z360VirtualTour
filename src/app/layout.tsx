import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Z360 Virtual Tours | Professional 360° Tour Services',
  description: 'Professional 360° virtual tour services for real estate, businesses, hospitality, and more. Immersive experiences that showcase your space.',
  keywords: ['virtual tour', '360 tour', 'real estate photography', 'business tour', 'virtual walkthrough', 'immersive tour'],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    viewportFit: 'cover',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${inter.className} overflow-x-hidden`}>
        <div className="min-h-screen bg-navy w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  )
}
