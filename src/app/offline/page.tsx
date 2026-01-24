'use client'

import { WifiOff, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-navy-light rounded-full flex items-center justify-center mb-6">
            <WifiOff className="w-12 h-12 text-cream-muted" />
          </div>
          <h1 className="text-2xl font-bold text-cream mb-3">
            You&apos;re Offline
          </h1>
          <p className="text-cream-muted">
            It looks like you&apos;ve lost your internet connection.
            Some features may not be available until you&apos;re back online.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gold text-navy-dark font-semibold rounded-lg hover:bg-gold-soft transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-navy-light text-cream rounded-lg hover:bg-navy-medium transition-colors"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </Link>
        </div>

        <div className="mt-8 p-4 bg-navy-light rounded-lg">
          <h3 className="text-sm font-semibold text-cream mb-2">
            What you can still do:
          </h3>
          <ul className="text-sm text-cream-muted space-y-1 text-left">
            <li>• Browse previously viewed tours</li>
            <li>• View cached pricing information</li>
            <li>• Draft quote requests (will send when online)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
