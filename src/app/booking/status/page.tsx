'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Search, CheckCircle, Clock, Package, Truck, Camera, Edit3,
  Download, Star, AlertCircle, XCircle, ArrowRight, CreditCard,
  Calendar, MapPin, Phone, Mail, FileText, ChevronRight
} from 'lucide-react'
import { PublicHeader, Footer } from '@/components/layout'
import { Button, Card, Input } from '@/components/ui'
import { motion } from 'framer-motion'

interface BookingStatus {
  id: string
  clientName: string
  clientEmail: string
  propertyAddress: string
  propertyCity: string | null
  totalQuote: number | null
  depositAmount: number | null
  depositPaid: boolean
  paymentStatus: string
  paidAmount: number | null
  balanceAmount: number | null
  status: string
  createdAt: string
  confirmedDate: string | null
  confirmedTime: string | null
  preferredDate: string | null
  pricingPlanName?: string
}

const statusConfig: Record<string, {
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
  bgColor: string
  description: string
}> = {
  quote_requested: {
    icon: FileText,
    label: 'Quote Requested',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    description: 'Your booking request has been received. We will review and send you a quote within 24 hours.',
  },
  quote_sent: {
    icon: Mail,
    label: 'Quote Sent',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    description: 'We have sent you a personalized quote. Please review and pay the deposit to confirm your booking.',
  },
  negotiating: {
    icon: Phone,
    label: 'Negotiating',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    description: 'We are discussing the details with you. Feel free to contact us with any questions.',
  },
  pending_deposit: {
    icon: CreditCard,
    label: 'Awaiting Deposit',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    description: 'Your quote has been confirmed. Please pay the deposit to secure your booking date.',
  },
  confirmed: {
    icon: CheckCircle,
    label: 'Confirmed',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    description: 'Your booking is confirmed! We will contact you to finalize the shooting schedule.',
  },
  scheduled: {
    icon: Calendar,
    label: 'Scheduled',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    description: 'Your photo shoot is scheduled. We look forward to capturing your space!',
  },
  in_progress: {
    icon: Camera,
    label: 'In Progress',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20',
    description: 'We are currently working on your virtual tour. You will be notified once it is ready.',
  },
  editing: {
    icon: Edit3,
    label: 'Editing',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/20',
    description: 'Your virtual tour is in the editing phase. We are adding the finishing touches!',
  },
  delivered: {
    icon: Package,
    label: 'Delivered',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/20',
    description: 'Your virtual tour has been completed and delivered. Thank you for choosing Z360!',
  },
  completed: {
    icon: Star,
    label: 'Completed',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    description: 'Your project has been completed successfully. We hope you love your virtual tour!',
  },
  cancelled: {
    icon: XCircle,
    label: 'Cancelled',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    description: 'This booking has been cancelled. Contact us if you have any questions.',
  },
}

const workflowSteps = [
  'quote_requested',
  'quote_sent',
  'pending_deposit',
  'confirmed',
  'scheduled',
  'in_progress',
  'editing',
  'delivered',
  'completed',
]

function BookingStatusContent() {
  const searchParams = useSearchParams()
  const bookingIdParam = searchParams.get('id')

  const [bookingId, setBookingId] = useState(bookingIdParam || '')
  const [booking, setBooking] = useState<BookingStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  // Auto-search if ID is provided in URL
  useEffect(() => {
    if (bookingIdParam) {
      searchBooking(bookingIdParam)
    }
  }, [bookingIdParam])

  async function searchBooking(id: string) {
    if (!id.trim()) {
      setError('Please enter a booking reference')
      return
    }

    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const response = await fetch(`/api/booking/${id}`)
      if (response.ok) {
        const data = await response.json()
        setBooking(data)
      } else if (response.status === 404) {
        setError('Booking not found. Please check your reference number.')
        setBooking(null)
      } else {
        setError('Failed to fetch booking. Please try again.')
        setBooking(null)
      }
    } catch (err) {
      setError('Connection error. Please try again.')
      setBooking(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchBooking(bookingId)
  }

  const currentStatus = booking ? statusConfig[booking.status] || statusConfig.quote_requested : null
  const currentStepIndex = booking ? workflowSteps.indexOf(booking.status) : -1

  return (
    <div className="min-h-screen bg-navy">
      <PublicHeader />

      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-display font-bold text-cream mb-4">
              Track Your <span className="text-gold">Booking</span>
            </h1>
            <p className="text-body-lg text-cream-muted">
              Enter your booking reference to see the current status of your virtual tour project
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search Form */}
      <section className="pb-8">
        <div className="max-w-xl mx-auto px-4">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1">
                <Input
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="Enter booking reference (e.g., ABC12345)"
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </Button>
            </form>
            <p className="text-xs text-cream-muted mt-2 text-center">
              You can find your reference number in the confirmation email we sent you
            </p>
          </Card>
        </div>
      </section>

      {/* Results */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4">
          {error && searched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-8 text-center border-red-500/30">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-cream mb-2">Booking Not Found</h3>
                <p className="text-cream-muted">{error}</p>
              </Card>
            </motion.div>
          )}

          {booking && currentStatus && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Current Status Card */}
              <Card className="p-8">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className={`w-20 h-20 rounded-2xl ${currentStatus.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <currentStatus.icon className={`w-10 h-10 ${currentStatus.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${currentStatus.color}`}>
                        Current Status
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-cream mb-2">{currentStatus.label}</h2>
                    <p className="text-cream-muted">{currentStatus.description}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                {booking.status !== 'cancelled' && (
                  <div className="mt-8">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-cream-muted">Progress</span>
                      <span className="text-sm text-gold font-medium">
                        Step {currentStepIndex + 1} of {workflowSteps.length}
                      </span>
                    </div>
                    <div className="h-2 bg-navy rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gold to-gold-light transition-all duration-500"
                        style={{ width: `${((currentStepIndex + 1) / workflowSteps.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </Card>

              {/* Booking Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-cream mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gold" />
                    Booking Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gold/10">
                      <span className="text-cream-muted">Reference</span>
                      <span className="font-mono font-semibold text-gold">
                        #{booking.id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gold/10">
                      <span className="text-cream-muted">Name</span>
                      <span className="text-cream">{booking.clientName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gold/10">
                      <span className="text-cream-muted">Property</span>
                      <span className="text-cream text-right">
                        {booking.propertyAddress}
                        {booking.propertyCity && `, ${booking.propertyCity}`}
                      </span>
                    </div>
                    {booking.confirmedDate && (
                      <div className="flex justify-between py-2 border-b border-gold/10">
                        <span className="text-cream-muted">Scheduled Date</span>
                        <span className="text-cream">
                          {new Date(booking.confirmedDate).toLocaleDateString('en-GB', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                          {booking.confirmedTime && ` at ${booking.confirmedTime}`}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2">
                      <span className="text-cream-muted">Created</span>
                      <span className="text-cream">
                        {(() => {
                          const d = new Date(booking.createdAt)
                          return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
                        })()}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-cream mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gold" />
                    Payment Status
                  </h3>
                  <div className="space-y-3 text-sm">
                    {booking.totalQuote && (
                      <div className="flex justify-between py-2 border-b border-gold/10">
                        <span className="text-cream-muted">Total Quote</span>
                        <span className="text-cream font-semibold">€{booking.totalQuote.toFixed(2)}</span>
                      </div>
                    )}
                    {booking.depositAmount && (
                      <div className="flex justify-between py-2 border-b border-gold/10">
                        <span className="text-cream-muted">Deposit Required</span>
                        <span className="text-cream">€{booking.depositAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-gold/10">
                      <span className="text-cream-muted">Deposit Status</span>
                      <span className={booking.depositPaid ? 'text-green-400' : 'text-orange-400'}>
                        {booking.depositPaid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                    {booking.paidAmount !== null && booking.paidAmount > 0 && (
                      <div className="flex justify-between py-2 border-b border-gold/10">
                        <span className="text-cream-muted">Amount Paid</span>
                        <span className="text-green-400 font-semibold">€{booking.paidAmount.toFixed(2)}</span>
                      </div>
                    )}
                    {booking.balanceAmount !== null && booking.balanceAmount > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-cream-muted">Balance Due</span>
                        <span className="text-cream">€{booking.balanceAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Pay Now Button */}
                  {!booking.depositPaid && booking.depositAmount && (
                    <Link
                      href={`/payment/checkout?booking_id=${booking.id}&type=deposit`}
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold hover:bg-gold-dark text-navy font-semibold rounded-xl transition-colors"
                    >
                      <CreditCard className="w-5 h-5" />
                      Pay Deposit - €{booking.depositAmount.toFixed(2)}
                    </Link>
                  )}
                </Card>
              </div>

              {/* Timeline */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-cream mb-6">Booking Timeline</h3>
                <div className="relative">
                  {workflowSteps.map((step, index) => {
                    const config = statusConfig[step]
                    const isCompleted = index < currentStepIndex
                    const isCurrent = index === currentStepIndex
                    const isPending = index > currentStepIndex

                    return (
                      <div key={step} className="flex gap-4 mb-4 last:mb-0">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isCompleted
                                ? 'bg-green-500'
                                : isCurrent
                                ? config.bgColor
                                : 'bg-gray-700'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : (
                              <config.icon className={`w-5 h-5 ${isCurrent ? config.color : 'text-gray-500'}`} />
                            )}
                          </div>
                          {index < workflowSteps.length - 1 && (
                            <div className={`w-0.5 h-8 ${isCompleted ? 'bg-green-500' : 'bg-gray-700'}`} />
                          )}
                        </div>
                        <div className={`flex-1 pb-4 ${isPending ? 'opacity-50' : ''}`}>
                          <p className={`font-medium ${isCurrent ? 'text-cream' : isCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                            {config.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-cream-muted mt-1">{config.description}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Contact */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-cream mb-4">Need Help?</h3>
                <p className="text-cream-muted mb-4">
                  If you have any questions about your booking, feel free to contact us.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="mailto:z360virtualtours@gmail.com"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-navy rounded-lg hover:bg-navy-light transition-colors text-cream"
                  >
                    <Mail className="w-4 h-4 text-gold" />
                    z360virtualtours@gmail.com
                  </a>
                  <a
                    href="tel:+38971967915"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-navy rounded-lg hover:bg-navy-light transition-colors text-cream"
                  >
                    <Phone className="w-4 h-4 text-gold" />
                    +389 71 967 915
                  </a>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Initial State */}
          {!searched && !loading && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gold/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-cream mb-2">Search for Your Booking</h3>
              <p className="text-cream-muted">
                Enter your booking reference number above to see your project status
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function BookingStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BookingStatusContent />
    </Suspense>
  )
}
