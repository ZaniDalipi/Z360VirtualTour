import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClientLayout } from '@/components/layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Z360 Virtual Tours | Professional 360° Tour Services',
  description: 'Professional 360° virtual tour services for real estate, businesses, hospitality, and more. Immersive experiences that showcase your space.',
  keywords: ['virtual tour', '360 tour', 'real estate photography', 'business tour', 'virtual walkthrough', 'immersive tour'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>
          <div className="min-h-screen bg-navy">
            {children}
          </div>
        </ClientLayout>
      </body>
    </html>
  )
}
