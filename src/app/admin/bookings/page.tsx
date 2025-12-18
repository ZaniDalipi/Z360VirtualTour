'use client'

import { useState, useEffect } from 'react'
import {
  CalendarCheck, Mail, Phone, MapPin, Clock, DollarSign,
  Check, X, AlertCircle, Calendar, ChevronDown, ChevronUp,
  Trash2, Building2, FileText, Route, Users, Tag
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
  estimatedDistance: number | null
  serviceType: string | null
  projectDescription: string | null
  specialRequests: string | null
  preferredDate: string | null
  alternateDate: string | null
  deadlineDate: string | null
  confirmedDate: string | null
  basePrice: number | null
  urgencySurcharge: number | null
  travelFee: number | null
  bundleDiscount: number | null
  totalQuote: number | null
  depositAmount: number | null
  depositPaid: boolean
  status: string
  isRead: boolean
  createdAt: string
  internalNotes: string | null
  // Related data
  pricingPlanName?: string | null
  urgencyTierName?: string | null
  travelBundleName?: string | null
}

const statusColors: Record<string, string> = {
  quote_requested: 'bg-blue-500/20 text-blue-400',
  quote_sent: 'bg-yellow-500/20 text-yellow-400',
  pending_confirmation: 'bg-orange-500/20 text-orange-400',
  confirmed: 'bg-green-500/20 text-green-400',
  scheduled: 'bg-purple-500/20 text-purple-400',
  in_progress: 'bg-indigo-500/20 text-indigo-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

const statusLabels: Record<string, string> = {
  quote_requested: 'Quote Requested',
  quote_sent: 'Quote Sent',
  pending_confirmation: 'Pending',
  confirmed: 'Confirmed',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [unreadCount, setUnreadCount] = useState(0)
  const [confirmingDate, setConfirmingDate] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [statusFilter])

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.set('status', statusFilter)
      }

      const res = await fetch(`/api/admin/bookings?${params}`)
      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        fetchBookings()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleConfirmBooking = async (id: string) => {
    if (!selectedDate) {
      alert('Please select a confirmed date')
      return
    }

    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'confirmed',
          confirmedDate: selectedDate
        }),
      })

      if (res.ok) {
        fetchBookings()
        setConfirmingDate(null)
        setSelectedDate('')
      }
    } catch (error) {
      console.error('Failed to confirm booking:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this booking request?')) return

    try {
      await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' })
      fetchBookings()
      if (expandedId === id) setExpandedId(null)
    } catch (error) {
      console.error('Failed to delete booking:', error)
    }
  }

  const toggleExpand = async (booking: Booking) => {
    const newExpandedId = expandedId === booking.id ? null : booking.id
    setExpandedId(newExpandedId)

    // Mark as read when expanding
    if (newExpandedId && !booking.isRead) {
      try {
        await fetch(`/api/admin/bookings/${booking.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
        })
        fetchBookings()
      } catch (error) {
        console.error('Failed to mark as read:', error)
      }
    }
  }

  const toggleRead = async (id: string, isRead: boolean) => {
    try {
      await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !isRead }),
      })
      fetchBookings()
    } catch (error) {
      console.error('Failed to toggle read status:', error)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-'
    return `€${amount.toFixed(2)}`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gold/10 rounded animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gold/10 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-bold text-cream">All Bookings</h1>
          <p className="text-body text-cream-muted">
            {unreadCount > 0
              ? `You have ${unreadCount} unread booking${unreadCount > 1 ? 's' : ''}`
              : 'Manage booking requests and quotes'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm transition-colors ${
            statusFilter === 'all'
              ? 'bg-gold text-navy'
              : 'bg-navy-medium text-cream-muted hover:text-cream'
          }`}
        >
          All
        </button>
        {Object.entries(statusLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              statusFilter === key
                ? 'bg-gold text-navy'
                : 'bg-navy-medium text-cream-muted hover:text-cream'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarCheck className="w-12 h-12 text-cream-muted mx-auto mb-4" />
          <p className="text-cream-muted">No booking requests yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {bookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card
                  className={`overflow-hidden transition-colors ${
                    !booking.isRead ? 'border-gold/40 bg-gold/5' : ''
                  }`}
                >
                  {/* Booking Header - Clickable */}
                  <div
                    className="p-4 cursor-pointer hover:bg-navy-medium/50 transition-colors"
                    onClick={() => toggleExpand(booking)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {!booking.isRead && (
                            <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
                          )}
                          <h3 className="font-semibold text-cream truncate">
                            {booking.clientName}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded ${statusColors[booking.status]}`}>
                            {statusLabels[booking.status]}
                          </span>
                          {booking.deadlineDate && (
                            <span className="flex items-center gap-1 text-xs text-orange-400">
                              <AlertCircle className="w-3 h-3" />
                              Urgent
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-cream-muted">
                          {booking.clientPhone && (
                            <span className="flex items-center gap-1 text-gold font-medium">
                              <Phone className="w-3.5 h-3.5" />
                              {booking.clientPhone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {booking.clientEmail}
                          </span>
                          {booking.propertyCity && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {booking.propertyCity}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {booking.totalQuote && (
                          <span className="text-gold font-semibold">
                            {formatCurrency(booking.totalQuote)}
                          </span>
                        )}
                        <span className="text-xs text-cream-muted">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                        {expandedId === booking.id ? (
                          <ChevronUp className="w-5 h-5 text-cream-muted" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-cream-muted" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedId === booking.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-gold/10 pt-4 space-y-4">
                          {/* Contact Information */}
                          <div>
                            <h4 className="text-sm font-medium text-gold mb-3 flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Contact Information
                            </h4>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-cream-muted" />
                                <a
                                  href={`mailto:${booking.clientEmail}`}
                                  className="text-cream hover:text-gold transition-colors"
                                >
                                  {booking.clientEmail}
                                </a>
                              </div>
                              {booking.clientPhone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="w-4 h-4 text-cream-muted" />
                                  <a
                                    href={`tel:${booking.clientPhone}`}
                                    className="text-cream hover:text-gold transition-colors font-medium"
                                  >
                                    {booking.clientPhone}
                                  </a>
                                </div>
                              )}
                              {booking.companyName && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Building2 className="w-4 h-4 text-cream-muted" />
                                  <span className="text-cream">{booking.companyName}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-cream-muted" />
                                <span className="text-cream-muted">
                                  {formatDateTime(booking.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Property Location */}
                          <div>
                            <h4 className="text-sm font-medium text-gold mb-3 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Property Location
                            </h4>
                            <div className="p-3 rounded-lg bg-navy">
                              <p className="text-cream">{booking.propertyAddress}</p>
                              {booking.propertyCity && (
                                <p className="text-cream-muted text-sm">{booking.propertyCity}</p>
                              )}
                              {booking.estimatedDistance && (
                                <p className="text-cream-dim text-xs mt-1 flex items-center gap-1">
                                  <Route className="w-3 h-3" />
                                  ~{booking.estimatedDistance} km from base
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Service & Dates */}
                          <div className="grid sm:grid-cols-2 gap-4">
                            {/* Scheduling */}
                            <div>
                              <h4 className="text-sm font-medium text-gold mb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Scheduling
                              </h4>
                              <div className="space-y-2 text-sm">
                                {booking.preferredDate && (
                                  <div className="flex justify-between">
                                    <span className="text-cream-muted">Preferred Date</span>
                                    <span className="text-cream">{formatDate(booking.preferredDate)}</span>
                                  </div>
                                )}
                                {booking.alternateDate && (
                                  <div className="flex justify-between">
                                    <span className="text-cream-muted">Alternate Date</span>
                                    <span className="text-cream">{formatDate(booking.alternateDate)}</span>
                                  </div>
                                )}
                                {booking.deadlineDate && (
                                  <div className="flex justify-between">
                                    <span className="text-cream-muted">Deadline (Urgent)</span>
                                    <span className="text-orange-400 font-medium">{formatDate(booking.deadlineDate)}</span>
                                  </div>
                                )}
                                {booking.confirmedDate && (
                                  <div className="flex justify-between">
                                    <span className="text-cream-muted">Confirmed Date</span>
                                    <span className="text-green-400 font-medium">{formatDate(booking.confirmedDate)}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Quote Breakdown */}
                            <div>
                              <h4 className="text-sm font-medium text-gold mb-3 flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                Quote Breakdown
                              </h4>
                              <div className="space-y-2 text-sm">
                                {booking.basePrice !== null && (
                                  <div className="flex justify-between">
                                    <span className="text-cream-muted">Base Price</span>
                                    <span className="text-cream">{formatCurrency(booking.basePrice)}</span>
                                  </div>
                                )}
                                {booking.urgencySurcharge && booking.urgencySurcharge > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-cream-muted">Urgency Surcharge</span>
                                    <span className="text-orange-400">+{formatCurrency(booking.urgencySurcharge)}</span>
                                  </div>
                                )}
                                {booking.travelFee && booking.travelFee > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-cream-muted">Travel Fee</span>
                                    <span className="text-cream">+{formatCurrency(booking.travelFee)}</span>
                                  </div>
                                )}
                                {booking.bundleDiscount && booking.bundleDiscount > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-cream-muted">Bundle Discount</span>
                                    <span className="text-green-400">-{formatCurrency(booking.bundleDiscount)}</span>
                                  </div>
                                )}
                                {booking.totalQuote !== null && (
                                  <div className="flex justify-between pt-2 border-t border-gold/10">
                                    <span className="text-cream font-medium">Total</span>
                                    <span className="text-gold font-bold">{formatCurrency(booking.totalQuote)}</span>
                                  </div>
                                )}
                                {booking.depositAmount !== null && (
                                  <div className="flex justify-between text-xs">
                                    <span className="text-cream-muted">Deposit Required</span>
                                    <span className="text-cream">
                                      {formatCurrency(booking.depositAmount)}
                                      {booking.depositPaid && (
                                        <span className="ml-2 text-green-400">PAID</span>
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Project Description / Message */}
                          {booking.projectDescription && (
                            <div>
                              <h4 className="text-sm font-medium text-gold mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Project Description
                              </h4>
                              <div className="p-4 rounded-xl bg-navy">
                                <p className="text-cream whitespace-pre-wrap">
                                  {booking.projectDescription}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Special Requests */}
                          {booking.specialRequests && (
                            <div>
                              <h4 className="text-sm font-medium text-gold mb-3 flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Special Requests
                              </h4>
                              <div className="p-4 rounded-xl bg-navy">
                                <p className="text-cream whitespace-pre-wrap">
                                  {booking.specialRequests}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Date Confirmation Flow */}
                          {confirmingDate === booking.id && booking.status === 'quote_sent' && (
                            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                              <p className="text-sm text-cream mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-green-400" />
                                Select confirmed date for this booking:
                              </p>
                              <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-navy border border-gold/20 text-cream text-sm mb-3"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleConfirmBooking(booking.id)}
                                  disabled={!selectedDate}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Confirm Date
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => {
                                    setConfirmingDate(null)
                                    setSelectedDate('')
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Status Actions */}
                          <div className="flex flex-wrap gap-2 pt-2">
                            {booking.status === 'quote_requested' && (
                              <Button size="sm" onClick={() => handleStatusChange(booking.id, 'quote_sent')}>
                                Mark Quote Sent
                              </Button>
                            )}
                            {booking.status === 'quote_sent' && confirmingDate !== booking.id && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setConfirmingDate(booking.id)
                                  if (booking.preferredDate) {
                                    setSelectedDate(booking.preferredDate.split('T')[0])
                                  }
                                }}
                              >
                                <Calendar className="w-4 h-4 mr-1" />
                                Confirm Booking
                              </Button>
                            )}
                            {booking.status === 'confirmed' && (
                              <Button size="sm" onClick={() => handleStatusChange(booking.id, 'scheduled')}>
                                Mark Scheduled
                              </Button>
                            )}
                            {booking.status === 'scheduled' && (
                              <Button size="sm" onClick={() => handleStatusChange(booking.id, 'in_progress')}>
                                Start Work
                              </Button>
                            )}
                            {booking.status === 'in_progress' && (
                              <Button size="sm" onClick={() => handleStatusChange(booking.id, 'completed')}>
                                <Check className="w-4 h-4 mr-1" />
                                Mark Complete
                              </Button>
                            )}
                            {!['completed', 'cancelled'].includes(booking.status) && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleStatusChange(booking.id, 'cancelled')}
                              >
                                Cancel Booking
                              </Button>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-3 pt-2 border-t border-gold/10">
                            <Button
                              variant="secondary"
                              onClick={() => toggleRead(booking.id, booking.isRead)}
                            >
                              {booking.isRead ? (
                                <>
                                  <X className="w-4 h-4 mr-2" />
                                  Mark as Unread
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-2" />
                                  Mark as Read
                                </>
                              )}
                            </Button>
                            {booking.clientPhone && (
                              <a href={`tel:${booking.clientPhone}`}>
                                <Button>
                                  <Phone className="w-4 h-4 mr-2" />
                                  Call
                                </Button>
                              </a>
                            )}
                            <a href={`mailto:${booking.clientEmail}`}>
                              <Button variant="secondary">
                                <Mail className="w-4 h-4 mr-2" />
                                Email
                              </Button>
                            </a>
                            <Button
                              variant="ghost"
                              onClick={() => handleDelete(booking.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-auto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
