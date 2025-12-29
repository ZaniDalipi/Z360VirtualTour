'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Clock, CheckCircle, Calendar, MapPin,
  Loader2, Phone, Mail, Building, FileText, X,
  AlertTriangle, Send, CalendarClock
} from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'

interface Booking {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string | null
  companyName: string | null
  propertyAddress: string
  propertyCity: string | null
  serviceType: string | null
  projectDescription: string | null
  specialRequests: string | null
  status: string
  basePrice: number | null
  urgencySurcharge: number | null
  travelFee: number | null
  bundleDiscount: number | null
  sameCityDiscount: number | null
  totalQuote: number | null
  depositAmount: number | null
  depositPaid: boolean
  confirmedDate: string | null
  confirmedTime: string | null
  preferredDate: string | null
  alternateDate: string | null
  createdAt: string
  changeRequestType?: string | null
  changeRequestStatus?: string | null
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; description: string }> = {
  quote_requested: {
    label: 'Quote Requested',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    description: 'We are preparing your quote'
  },
  quote_sent: {
    label: 'Quote Sent',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    description: 'Please review and confirm your quote'
  },
  pending_confirmation: {
    label: 'Pending Confirmation',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    description: 'Awaiting your confirmation'
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    description: 'Your booking is confirmed'
  },
  scheduled: {
    label: 'Scheduled',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    description: 'Your tour is scheduled'
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20',
    description: 'We are working on your tour'
  },
  completed: {
    label: 'Completed',
    color: 'text-gold',
    bgColor: 'bg-gold/20',
    description: 'Your tour is ready'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    description: 'This booking was cancelled'
  },
}

export default function TourDetailPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestType, setRequestType] = useState<'date_change' | 'cancellation' | 'other'>('date_change')
  const [requestMessage, setRequestMessage] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState(false)

  useEffect(() => {
    async function loadBooking() {
      try {
        const res = await fetch(`/api/user/bookings/${id}`)
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login')
            return
          }
          if (res.status === 403) {
            setError('You do not have access to this booking')
            return
          }
          if (res.status === 404) {
            setError('Booking not found')
            return
          }
          throw new Error('Failed to fetch booking')
        }

        const data = await res.json()
        setBooking(data.booking)
      } catch (err) {
        console.error('Failed to load booking:', err)
        setError('Failed to load booking details')
      } finally {
        setLoading(false)
      }
    }

    loadBooking()
  }, [id, router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleSubmitRequest = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/user/bookings/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType,
          message: requestMessage,
          newPreferredDate: newDate || null,
          newPreferredTime: newTime || null,
        }),
      })

      if (res.ok) {
        setRequestSuccess(true)
        setTimeout(() => {
          setShowRequestModal(false)
          setRequestSuccess(false)
          // Reload booking to show updated status
          window.location.reload()
        }, 2000)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to submit request')
      }
    } catch {
      alert('Failed to submit request')
    } finally {
      setSubmitting(false)
    }
  }

  const canRequestChange = booking && !['completed', 'cancelled'].includes(booking.status)
  const hasPendingRequest = booking?.changeRequestType && booking?.changeRequestStatus === 'pending'

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-navy">
        <header className="sticky top-0 z-40 bg-navy/95 backdrop-blur-lg border-b border-gold/10">
          <div className="flex items-center gap-3 h-16 px-4 max-w-7xl mx-auto">
            <Link href="/profile/tours">
              <Button variant="icon" size="sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-h4 font-semibold text-cream">Tour Details</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-12 text-center">
          <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-cream-muted mb-4">{error || 'Booking not found'}</p>
          <Link href="/profile/tours">
            <Button>Back to My Tours</Button>
          </Link>
        </main>
      </div>
    )
  }

  const status = statusConfig[booking.status] || statusConfig.quote_requested

  return (
    <div className="min-h-screen bg-navy pb-8">
      <header className="sticky top-0 z-40 bg-navy/95 backdrop-blur-lg border-b border-gold/10">
        <div className="flex items-center gap-3 h-16 px-4 max-w-7xl mx-auto">
          <Link href="/profile/tours">
            <Button variant="icon" size="sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-h4 font-semibold text-cream">Tour Details</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className={`p-6 ${status.bgColor} border-0`}>
            <div className="flex items-center gap-3 mb-2">
              {booking.status === 'completed' ? (
                <CheckCircle className={`w-6 h-6 ${status.color}`} />
              ) : (
                <Clock className={`w-6 h-6 ${status.color}`} />
              )}
              <h2 className={`text-h4 font-semibold ${status.color}`}>
                {status.label}
              </h2>
            </div>
            <p className="text-cream-muted">{status.description}</p>
          </Card>
        </motion.div>

        {/* Pending Change Request Banner */}
        {hasPendingRequest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4 bg-orange-500/10 border-orange-500/30">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-orange-400 font-medium">Change Request Pending</p>
                  <p className="text-cream-muted text-sm">
                    Your {booking.changeRequestType === 'date_change' ? 'date change' : booking.changeRequestType} request is being reviewed.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Property Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <h3 className="text-body font-semibold text-cream mb-4">Property Details</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold mt-0.5" />
                <div>
                  <p className="text-body text-cream">{booking.propertyAddress}</p>
                  {booking.propertyCity && (
                    <p className="text-body-sm text-cream-muted">{booking.propertyCity}</p>
                  )}
                </div>
              </div>

              {booking.serviceType && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gold mt-0.5" />
                  <div>
                    <p className="text-body-sm text-cream-muted">Service Type</p>
                    <p className="text-body text-cream">{booking.serviceType}</p>
                  </div>
                </div>
              )}

              {booking.projectDescription && (
                <div className="pt-2 border-t border-gold/10">
                  <p className="text-body-sm text-cream-muted mb-1">Project Description</p>
                  <p className="text-body text-cream">{booking.projectDescription}</p>
                </div>
              )}

              {booking.specialRequests && (
                <div className="pt-2 border-t border-gold/10">
                  <p className="text-body-sm text-cream-muted mb-1">Special Requests</p>
                  <p className="text-body text-cream">{booking.specialRequests}</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="text-body font-semibold text-cream mb-4">Schedule</h3>

            <div className="space-y-3">
              {booking.confirmedDate ? (
                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-body-sm text-cream-muted">Confirmed Date</p>
                    <p className="text-body text-cream font-medium">
                      {formatDate(booking.confirmedDate)}
                      {booking.confirmedTime && ` at ${booking.confirmedTime}`}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {booking.preferredDate && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gold" />
                      <div>
                        <p className="text-body-sm text-cream-muted">Preferred Date</p>
                        <p className="text-body text-cream">{formatDate(booking.preferredDate)}</p>
                      </div>
                    </div>
                  )}
                  {booking.alternateDate && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-cream-muted" />
                      <div>
                        <p className="text-body-sm text-cream-muted">Alternate Date</p>
                        <p className="text-body text-cream">{formatDate(booking.alternateDate)}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center gap-3 text-cream-dim">
                <Calendar className="w-5 h-5" />
                <span className="text-body-sm">
                  Requested on {formatDate(booking.createdAt)}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quote / Pricing */}
        {booking.totalQuote && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h3 className="text-body font-semibold text-cream mb-4">Quote</h3>

              <div className="space-y-2">
                {booking.basePrice && (
                  <div className="flex justify-between text-body">
                    <span className="text-cream-muted">Base Price</span>
                    <span className="text-cream">€{booking.basePrice.toFixed(2)}</span>
                  </div>
                )}
                {booking.urgencySurcharge && booking.urgencySurcharge > 0 && (
                  <div className="flex justify-between text-body">
                    <span className="text-cream-muted">Urgency Surcharge</span>
                    <span className="text-orange-400">+€{booking.urgencySurcharge.toFixed(2)}</span>
                  </div>
                )}
                {booking.travelFee && booking.travelFee > 0 && (
                  <div className="flex justify-between text-body">
                    <span className="text-cream-muted">Travel Fee</span>
                    <span className="text-cream">+€{booking.travelFee.toFixed(2)}</span>
                  </div>
                )}
                {booking.bundleDiscount && booking.bundleDiscount > 0 && (
                  <div className="flex justify-between text-body">
                    <span className="text-cream-muted">Bundle Discount</span>
                    <span className="text-green-400">-€{booking.bundleDiscount.toFixed(2)}</span>
                  </div>
                )}
                {booking.sameCityDiscount && booking.sameCityDiscount > 0 && (
                  <div className="flex justify-between text-body">
                    <span className="text-cream-muted">Same-City Discount</span>
                    <span className="text-green-400">-€{booking.sameCityDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-h4 font-bold pt-3 border-t border-gold/20">
                  <span className="text-cream">Total</span>
                  <span className="text-gold">€{booking.totalQuote.toFixed(2)}</span>
                </div>

                {booking.depositAmount && (
                  <div className="flex justify-between text-body pt-2">
                    <span className="text-cream-muted">
                      Deposit {booking.depositPaid ? '(Paid)' : '(Required)'}
                    </span>
                    <span className={booking.depositPaid ? 'text-green-400' : 'text-cream'}>
                      €{booking.depositAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="text-body font-semibold text-cream mb-4">Contact Information</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold" />
                <span className="text-body text-cream">{booking.clientEmail}</span>
              </div>

              {booking.clientPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gold" />
                  <span className="text-body text-cream">{booking.clientPhone}</span>
                </div>
              )}

              {booking.companyName && (
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-gold" />
                  <span className="text-body text-cream">{booking.companyName}</span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Request Change Section */}
        {canRequestChange && !hasPendingRequest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="text-body font-semibold text-cream mb-2">Need to Make Changes?</h3>
              <p className="text-body-sm text-cream-muted mb-4">
                You can request a date change or cancellation. We'll review your request and get back to you.
              </p>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowRequestModal(true)}
              >
                <CalendarClock className="w-4 h-4 mr-2" />
                Request Change
              </Button>
            </Card>
          </motion.div>
        )}

        {/* Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 text-center">
            <p className="text-body-sm text-cream-muted mb-3">
              Have questions about your booking?
            </p>
            <Link href="/contact">
              <Button variant="secondary">Contact Support</Button>
            </Link>
          </Card>
        </motion.div>
      </main>

      {/* Request Change Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => !submitting && setShowRequestModal(false)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md pointer-events-auto"
              >
                <Card className="p-6">
                  {requestSuccess ? (
                    <div className="text-center py-6">
                      <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-cream mb-2">Request Submitted!</h3>
                      <p className="text-cream-muted">We'll review your request and contact you soon.</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-cream">Request Change</h3>
                        <button
                          onClick={() => setShowRequestModal(false)}
                          className="text-cream-muted hover:text-cream"
                          disabled={submitting}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Request Type */}
                        <div>
                          <label className="block text-sm text-cream-muted mb-2">Request Type</label>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { value: 'date_change', label: 'Date Change' },
                              { value: 'cancellation', label: 'Cancel' },
                              { value: 'other', label: 'Other' },
                            ].map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setRequestType(option.value as typeof requestType)}
                                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                  requestType === option.value
                                    ? 'bg-gold text-navy font-medium'
                                    : 'bg-navy-medium text-cream-muted hover:text-cream'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* New Date (for date change) */}
                        {requestType === 'date_change' && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm text-cream-muted mb-2">New Date</label>
                              <input
                                type="date"
                                value={newDate}
                                onChange={(e) => setNewDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-navy-medium border border-gold/20 text-cream focus:outline-none focus:border-gold/50"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-cream-muted mb-2">Preferred Time</label>
                              <select
                                value={newTime}
                                onChange={(e) => setNewTime(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-navy-medium border border-gold/20 text-cream focus:outline-none focus:border-gold/50"
                              >
                                <option value="">Any time</option>
                                <option value="09:00">9:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="12:00">12:00 PM</option>
                                <option value="14:00">2:00 PM</option>
                                <option value="15:00">3:00 PM</option>
                                <option value="16:00">4:00 PM</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Message */}
                        <div>
                          <label className="block text-sm text-cream-muted mb-2">
                            {requestType === 'cancellation' ? 'Reason for cancellation' : 'Additional details'}
                          </label>
                          <textarea
                            value={requestMessage}
                            onChange={(e) => setRequestMessage(e.target.value)}
                            rows={3}
                            placeholder={
                              requestType === 'cancellation'
                                ? 'Please let us know why you need to cancel...'
                                : 'Any additional information...'
                            }
                            className="w-full px-3 py-2 rounded-lg bg-navy-medium border border-gold/20 text-cream placeholder:text-cream-dim resize-none focus:outline-none focus:border-gold/50"
                          />
                        </div>

                        {/* Warning for cancellation */}
                        {requestType === 'cancellation' && (
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-red-400 text-sm">
                              Cancellation may be subject to fees depending on how close to the scheduled date.
                            </p>
                          </div>
                        )}

                        {/* Submit Button */}
                        <Button
                          className="w-full"
                          onClick={handleSubmitRequest}
                          disabled={submitting || (requestType === 'date_change' && !newDate)}
                        >
                          {submitting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          {submitting ? 'Submitting...' : 'Submit Request'}
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
