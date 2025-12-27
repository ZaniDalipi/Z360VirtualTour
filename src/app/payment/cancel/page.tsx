'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { XCircle, ArrowLeft, CreditCard, MessageCircle } from 'lucide-react'

export default function PaymentCancelPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('booking_id')

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="text-center">
          {/* Cancel Icon */}
          <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/20">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>

          <h1 className="text-4xl font-bold mb-4">Payment Cancelled</h1>
          <p className="text-xl text-gray-400 mb-8">
            Your payment was not completed. Don&apos;t worry, your booking is still saved.
          </p>

          {/* Info Box */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 text-left">
            <h2 className="text-xl font-semibold mb-4">What happened?</h2>
            <p className="text-gray-400 mb-6">
              You cancelled the payment process. Your booking request is still in our system
              and you can complete the payment at any time.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-700/50 rounded-lg">
                <CreditCard className="w-5 h-5 text-pink-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Try again</h3>
                  <p className="text-sm text-gray-400">
                    You can complete your payment at any time using the link we sent you.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-700/50 rounded-lg">
                <MessageCircle className="w-5 h-5 text-pink-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Need help?</h3>
                  <p className="text-sm text-gray-400">
                    If you&apos;re having trouble with the payment, contact us and we&apos;ll help you out.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {bookingId && (
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/payments/create-checkout', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ bookingId, paymentType: 'deposit' }),
                    })
                    const data = await response.json()
                    if (data.url) {
                      window.location.href = data.url
                    }
                  } catch (error) {
                    console.error('Failed to create checkout:', error)
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Try Payment Again
              </button>
            )}

            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Contact Us
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 hover:bg-gray-800 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Home
            </Link>
          </div>

          {/* Booking Reference */}
          {bookingId && (
            <div className="mt-8 pt-8 border-t border-gray-700">
              <p className="text-gray-500 text-sm">
                Booking Reference: <span className="font-mono">#{bookingId.slice(-8).toUpperCase()}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
