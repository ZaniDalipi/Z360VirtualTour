'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Download, Mail } from 'lucide-react'

interface PaymentDetails {
  bookingId: string
  clientName: string
  clientEmail: string
  amount: number
  paymentType: string
  status: string
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const bookingId = searchParams.get('booking_id')
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function verifyPayment() {
      if (!sessionId || !bookingId) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/payments/verify?session_id=${sessionId}&booking_id=${bookingId}`)
        if (response.ok) {
          const data = await response.json()
          setPaymentDetails(data)
        }
      } catch (error) {
        console.error('Failed to verify payment:', error)
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [sessionId, bookingId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>

          <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-xl text-gray-400 mb-8">
            Thank you for your payment. Your booking has been confirmed.
          </p>

          {paymentDetails && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 text-left">
              <h2 className="text-xl font-semibold mb-6 text-center">Payment Details</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Booking Reference</span>
                  <span className="font-mono font-semibold">
                    #{paymentDetails.bookingId.slice(-8).toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Name</span>
                  <span>{paymentDetails.clientName}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Payment Type</span>
                  <span className="capitalize">{paymentDetails.paymentType}</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-400">Amount Paid</span>
                  <span className="text-2xl font-bold text-green-500">
                    €{paymentDetails.amount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-400">Status</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    {paymentDetails.status === 'paid' ? 'Fully Paid' : 'Deposit Received'}
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
                <Mail className="w-5 h-5 text-pink-500 mt-0.5" />
                <span>You will receive a confirmation email shortly</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-pink-500 mt-0.5" />
                <span>Our team will contact you to confirm the shooting date</span>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-pink-500 mt-0.5" />
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

          {/* Receipt */}
          {bookingId && (
            <div className="mt-8 pt-8 border-t border-gray-700">
              <a
                href={`/api/admin/bookings/${bookingId}/receipt`}
                target="_blank"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
