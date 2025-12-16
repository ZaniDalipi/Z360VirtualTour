import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Z360 Virtual Tours | Explore Properties Like Never Before',
  description: 'Premium 360° virtual tour platform for real estate. Experience immersive property exploration with AR capabilities and interactive walkthroughs.',
  keywords: ['virtual tour', '360 tour', 'real estate', 'property', 'AR', 'immersive'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-navy">
          {children}
        </div>
      </body>
    </html>
  )
}
