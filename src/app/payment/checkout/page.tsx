'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CreditCard, ArrowLeft, Lock, CheckCircle } from 'lucide-react'

interface BookingDetails {
  id: string
  clientName: string
  clientEmail: string
  totalQuote: number | null
  depositAmount: number | null
  depositPaid: boolean
  paymentStatus: string
  paidAmount: number | null
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('booking_id')
  const paymentType = searchParams.get('type') || 'deposit'

  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) {
        setError('No booking ID provided')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/booking/${bookingId}`)
        if (response.ok) {
          const data = await response.json()
          setBooking(data)
        } else {
          setError('Booking not found')
        }
      } catch {
        setError('Failed to load booking details')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  const handlePayment = async () => {
    if (!bookingId) return

    setProcessing(true)
    try {
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          paymentType,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Failed to create payment session')
      }
    } catch {
      setError('Payment initialization failed')
    } finally {
      setProcessing(false)
    }
  }

  const getPaymentAmount = () => {
    if (!booking) return 0
    if (paymentType === 'deposit') {
      return booking.depositAmount || 0
    } else if (paymentType === 'balance') {
      return (booking.totalQuote || 0) - (booking.paidAmount || 0)
    }
    return booking.totalQuote || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-gray-400 mb-6">{error || 'Booking not found'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-pink-500 hover:text-pink-400"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  // Already paid check
  if (paymentType === 'deposit' && booking.depositPaid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="max-w-lg mx-auto px-4 py-20">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Deposit Already Paid</h1>
            <p className="text-gray-400 mb-8">
              Your deposit for this booking has already been received. Thank you!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const amount = getPaymentAmount()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
          <p className="text-gray-400">
            {paymentType === 'deposit' ? 'Pay your deposit to confirm your booking' : 'Complete your balance payment'}
          </p>
        </div>

        {/* Booking Summary */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Reference</span>
              <span className="font-mono">#{booking.id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Name</span>
              <span>{booking.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span>{booking.clientEmail}</span>
            </div>

            <div className="border-t border-gray-700 my-4"></div>

            {booking.totalQuote && (
              <div className="flex justify-between">
                <span className="text-gray-400">Total Quote</span>
                <span>€{booking.totalQuote.toFixed(2)}</span>
              </div>
            )}

            {booking.paidAmount && booking.paidAmount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Already Paid</span>
                <span>-€{booking.paidAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between pt-3 border-t border-gray-700">
              <span className="font-semibold">
                {paymentType === 'deposit' ? 'Deposit Amount' : 'Amount Due'}
              </span>
              <span className="text-2xl font-bold text-pink-500">
                €{amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-xl mb-6">
          <Lock className="w-8 h-8 text-green-500" />
          <div className="text-sm">
            <p className="font-semibold">Secure Payment</p>
            <p className="text-gray-400">Your payment is processed securely by LemonSqueezy</p>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={processing || amount <= 0}
          className="w-full py-4 px-6 bg-pink-500 hover:bg-pink-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              Pay €{amount.toFixed(2)} with Card
            </>
          )}
        </button>

        {/* Payment Methods */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 mb-3">Accepted payment methods</p>
          <div className="flex justify-center gap-2">
            <div className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-400">Visa</div>
            <div className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-400">Mastercard</div>
            <div className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-400">Amex</div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel and return home
          </Link>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutContent />
    </Suspense>
  )
}
