'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, CheckCircle, Building2, Banknote, Copy, Check,
  Mail, Phone, Clock, FileText
} from 'lucide-react'

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

// Bank account details - can be configured via environment variables or admin settings
const BANK_DETAILS = {
  bankName: 'NLB Banka',
  accountHolder: 'Z360 Virtual Tours',
  iban: 'MK07250120000012345',
  swift: 'TUTBMK22',
  reference: 'Z360-BOOKING',
}

const CONTACT_INFO = {
  email: 'z360virtualtours@gmail.com',
  phone: '+389 71 967 915',
  whatsapp: '+38971967915',
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('booking_id')
  const paymentType = searchParams.get('type') || 'deposit'

  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

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

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
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

  const getPaymentReference = () => {
    if (!booking) return ''
    return `${BANK_DETAILS.reference}-${booking.id.slice(-8).toUpperCase()}`
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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center px-4">
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
        <div className="max-w-lg mx-auto px-4 py-12 sm:py-20">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-4">Deposit Already Paid</h1>
            <p className="text-gray-400 mb-8">
              Your deposit for this booking has already been received. Thank you!
            </p>
            <Link
              href={`/booking/status?id=${booking.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
            >
              View Booking Status
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const amount = getPaymentAmount()
  const paymentReference = getPaymentReference()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Payment Instructions</h1>
          <p className="text-gray-400">
            {paymentType === 'deposit' ? 'Pay your deposit to confirm your booking' : 'Complete your balance payment'}
          </p>
        </div>

        {/* Booking Summary */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-pink-500" />
            Booking Summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Reference</span>
              <span className="font-mono">#{booking.id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Name</span>
              <span>{booking.clientName}</span>
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

        {/* Payment Methods */}
        <div className="space-y-4">
          {/* Bank Transfer */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Bank Transfer
            </h3>

            <div className="space-y-4">
              <div className="bg-gray-900/50 rounded-xl p-4 space-y-3">
                {/* Bank Name */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-gray-400 text-sm">Bank</span>
                  <span className="font-medium">{BANK_DETAILS.bankName}</span>
                </div>

                {/* Account Holder */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-gray-400 text-sm">Account Holder</span>
                  <span className="font-medium">{BANK_DETAILS.accountHolder}</span>
                </div>

                {/* IBAN */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-gray-400 text-sm">IBAN</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm sm:text-base break-all">{BANK_DETAILS.iban}</span>
                    <button
                      onClick={() => copyToClipboard(BANK_DETAILS.iban, 'iban')}
                      className="p-2 rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
                      title="Copy IBAN"
                    >
                      {copiedField === 'iban' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* SWIFT */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-gray-400 text-sm">SWIFT/BIC</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{BANK_DETAILS.swift}</span>
                    <button
                      onClick={() => copyToClipboard(BANK_DETAILS.swift, 'swift')}
                      className="p-2 rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
                      title="Copy SWIFT"
                    >
                      {copiedField === 'swift' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Payment Reference */}
                <div className="pt-3 border-t border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-gray-400 text-sm">Payment Reference</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-pink-400 font-semibold">{paymentReference}</span>
                      <button
                        onClick={() => copyToClipboard(paymentReference, 'reference')}
                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors flex-shrink-0"
                        title="Copy Reference"
                      >
                        {copiedField === 'reference' ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Please include this reference in your transfer description
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-300">
                  Bank transfers typically take 1-2 business days to process. Your booking will be confirmed once we receive the payment.
                </p>
              </div>
            </div>
          </div>

          {/* Cash Payment */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-green-400" />
              Cash Payment
            </h3>

            <p className="text-gray-300 mb-4">
              You can pay in cash at the time of the photo shoot or arrange a meeting before the scheduled date.
            </p>

            <div className="bg-gray-900/50 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-3">Contact us to arrange cash payment:</p>
              <div className="space-y-2">
                <a
                  href={`tel:${CONTACT_INFO.phone}`}
                  className="flex items-center gap-3 text-green-400 hover:text-green-300 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>{CONTACT_INFO.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-green-400 hover:text-green-300 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`mailto:${CONTACT_INFO.email}?subject=Cash Payment - ${paymentReference}`}
                  className="flex items-center gap-3 text-green-400 hover:text-green-300 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>{CONTACT_INFO.email}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <p className="text-sm text-amber-200">
            <strong>Important:</strong> Your booking will be confirmed once we receive your payment.
            Please contact us after making the transfer so we can expedite the confirmation process.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href={`/booking/status?id=${booking.id}`}
            className="flex-1 py-3 px-6 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl transition-colors text-center"
          >
            Track Booking Status
          </Link>
          <Link
            href="/"
            className="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors text-center flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return Home
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
