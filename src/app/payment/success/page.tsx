'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Mail } from 'lucide-react'

interface BookingDetails {
  id: string
  clientName: string
  totalQuote: number | null
  depositAmount: number | null
  paidAmount: number | null
  balanceAmount: number | null
  depositPaid: boolean
  paymentStatus: string
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('booking_id')
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/booking/${bookingId}`)
        if (response.ok) {
          const data = await response.json()
          setBooking(data)
        }
      } catch (error) {
        console.error('Failed to fetch booking:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-8 inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-500/20">
            <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Thank You!</h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-8">
            Your payment information has been received.
          </p>

          {booking && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-8 text-left">
              <h2 className="text-xl font-semibold mb-6 text-center">Booking Details</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Booking Reference</span>
                  <span className="font-mono font-semibold">
                    #{booking.id.slice(-8).toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Name</span>
                  <span>{booking.clientName}</span>
                </div>

                {booking.totalQuote && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-700">
                    <span className="text-gray-400">Total Quote</span>
                    <span className="text-lg font-semibold">
                      €{booking.totalQuote.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-400">Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    booking.paymentStatus === 'paid'
                      ? 'bg-green-500/20 text-green-400'
                      : booking.depositPaid
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {booking.paymentStatus === 'paid'
                      ? 'Fully Paid'
                      : booking.depositPaid
                        ? 'Deposit Received'
                        : 'Pending Confirmation'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-gray-800/30 rounded-xl p-6 mb-8">
            <h3 className="font-semibold mb-4">What happens next?</h3>
            <ul className="text-left text-gray-400 space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                <span>You will receive a confirmation email once your payment is verified</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                <span>Our team will contact you to confirm the shooting date</span>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" />
                <span>We&apos;ll send you preparation guidelines before the shoot</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {bookingId && (
              <Link
                href={`/booking/status?id=${bookingId}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
              >
                Track Your Booking
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Return to Home
            </Link>
          </div>
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

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
