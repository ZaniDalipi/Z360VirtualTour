'use client'

import { useState, useEffect } from 'react'
import { CalendarCheck, Mail, Phone, MapPin, Clock, DollarSign, Eye, Check, X, AlertCircle } from 'lucide-react'
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
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [unreadCount, setUnreadCount] = useState(0)

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
        if (selectedBooking?.id === id) {
          const updated = await res.json()
          setSelectedBooking(updated)
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this booking request?')) return

    try {
      await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' })
      fetchBookings()
      setSelectedBooking(null)
    } catch (error) {
      console.error('Failed to delete booking:', error)
    }
  }

  const openBookingDetail = async (booking: Booking) => {
    setSelectedBooking(booking)

    // Mark as read
    if (!booking.isRead) {
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

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold text-cream flex items-center gap-2">
            Bookings
            {unreadCount > 0 && (
              <span className="text-sm bg-gold text-navy px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-body text-cream-muted">
            Manage booking requests and quotes
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
          {bookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className={`p-4 cursor-pointer hover:border-gold/30 transition-colors ${
                  !booking.isRead ? 'border-gold/40 bg-gold/5' : ''
                }`}
                onClick={() => openBookingDetail(booking)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-cream truncate">
                        {booking.clientName}
                      </h3>
                      {!booking.isRead && (
                        <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded ${statusColors[booking.status]}`}>
                        {statusLabels[booking.status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-cream-muted">
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
                      {booking.preferredDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(booking.preferredDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-gold font-semibold">
                      {formatCurrency(booking.totalQuote)}
                    </p>
                    <p className="text-xs text-cream-muted">
                      {formatDate(booking.createdAt)}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setSelectedBooking(null)}
            />
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg bg-navy-dark border-l border-gold/10 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-h3 font-semibold text-cream">Booking Details</h2>
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="p-2 rounded-lg text-cream-muted hover:text-cream hover:bg-gold/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Client Info */}
                <Card className="p-4 mb-4">
                  <h3 className="text-sm font-medium text-gold mb-3">Client Information</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-cream font-medium">{selectedBooking.clientName}</p>
                    {selectedBooking.companyName && (
                      <p className="text-cream-muted">{selectedBooking.companyName}</p>
                    )}
                    <p className="flex items-center gap-2 text-cream-muted">
                      <Mail className="w-4 h-4" />
                      {selectedBooking.clientEmail}
                    </p>
                    {selectedBooking.clientPhone && (
                      <p className="flex items-center gap-2 text-cream-muted">
                        <Phone className="w-4 h-4" />
                        {selectedBooking.clientPhone}
                      </p>
                    )}
                  </div>
                </Card>

                {/* Location */}
                <Card className="p-4 mb-4">
                  <h3 className="text-sm font-medium text-gold mb-3">Location</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-cream">{selectedBooking.propertyAddress}</p>
                    {selectedBooking.propertyCity && (
                      <p className="text-cream-muted">{selectedBooking.propertyCity}</p>
                    )}
                    {selectedBooking.estimatedDistance && (
                      <p className="text-cream-muted">
                        Distance: ~{selectedBooking.estimatedDistance} km
                      </p>
                    )}
                  </div>
                </Card>

                {/* Dates */}
                <Card className="p-4 mb-4">
                  <h3 className="text-sm font-medium text-gold mb-3">Scheduling</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-cream-muted">Preferred Date</p>
                      <p className="text-cream">{formatDate(selectedBooking.preferredDate)}</p>
                    </div>
                    <div>
                      <p className="text-cream-muted">Alternate Date</p>
                      <p className="text-cream">{formatDate(selectedBooking.alternateDate)}</p>
                    </div>
                    {selectedBooking.deadlineDate && (
                      <div>
                        <p className="text-cream-muted">Deadline (Urgent)</p>
                        <p className="text-cream flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 text-orange-400" />
                          {formatDate(selectedBooking.deadlineDate)}
                        </p>
                      </div>
                    )}
                    {selectedBooking.confirmedDate && (
                      <div>
                        <p className="text-cream-muted">Confirmed Date</p>
                        <p className="text-cream text-green-400">{formatDate(selectedBooking.confirmedDate)}</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Quote */}
                <Card className="p-4 mb-4">
                  <h3 className="text-sm font-medium text-gold mb-3">Quote Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-cream-muted">Base Price</span>
                      <span className="text-cream">{formatCurrency(selectedBooking.basePrice)}</span>
                    </div>
                    {selectedBooking.urgencySurcharge && selectedBooking.urgencySurcharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-cream-muted">Urgency Surcharge</span>
                        <span className="text-orange-400">+{formatCurrency(selectedBooking.urgencySurcharge)}</span>
                      </div>
                    )}
                    {selectedBooking.travelFee && selectedBooking.travelFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-cream-muted">Travel Fee</span>
                        <span className="text-cream">+{formatCurrency(selectedBooking.travelFee)}</span>
                      </div>
                    )}
                    {selectedBooking.bundleDiscount && selectedBooking.bundleDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-cream-muted">Bundle Discount</span>
                        <span className="text-green-400">-{formatCurrency(selectedBooking.bundleDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gold/10">
                      <span className="text-cream font-medium">Total</span>
                      <span className="text-gold font-bold">{formatCurrency(selectedBooking.totalQuote)}</span>
                    </div>
                    {selectedBooking.depositAmount && (
                      <div className="flex justify-between items-center">
                        <span className="text-cream-muted">Deposit Required</span>
                        <span className="text-cream">
                          {formatCurrency(selectedBooking.depositAmount)}
                          {selectedBooking.depositPaid && (
                            <span className="ml-2 text-green-400 text-xs">PAID</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Project Details */}
                {(selectedBooking.projectDescription || selectedBooking.specialRequests) && (
                  <Card className="p-4 mb-4">
                    <h3 className="text-sm font-medium text-gold mb-3">Project Details</h3>
                    {selectedBooking.projectDescription && (
                      <div className="mb-3">
                        <p className="text-xs text-cream-muted mb-1">Description</p>
                        <p className="text-sm text-cream">{selectedBooking.projectDescription}</p>
                      </div>
                    )}
                    {selectedBooking.specialRequests && (
                      <div>
                        <p className="text-xs text-cream-muted mb-1">Special Requests</p>
                        <p className="text-sm text-cream">{selectedBooking.specialRequests}</p>
                      </div>
                    )}
                  </Card>
                )}

                {/* Status Actions */}
                <Card className="p-4 mb-4">
                  <h3 className="text-sm font-medium text-gold mb-3">Status</h3>
                  <div className="mb-3">
                    <span className={`text-sm px-3 py-1 rounded ${statusColors[selectedBooking.status]}`}>
                      {statusLabels[selectedBooking.status]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedBooking.status === 'quote_requested' && (
                      <Button size="sm" onClick={() => handleStatusChange(selectedBooking.id, 'quote_sent')}>
                        Mark Quote Sent
                      </Button>
                    )}
                    {selectedBooking.status === 'quote_sent' && (
                      <Button size="sm" onClick={() => handleStatusChange(selectedBooking.id, 'confirmed')}>
                        Confirm Booking
                      </Button>
                    )}
                    {selectedBooking.status === 'confirmed' && (
                      <Button size="sm" onClick={() => handleStatusChange(selectedBooking.id, 'scheduled')}>
                        Mark Scheduled
                      </Button>
                    )}
                    {selectedBooking.status === 'scheduled' && (
                      <Button size="sm" onClick={() => handleStatusChange(selectedBooking.id, 'in_progress')}>
                        Start Work
                      </Button>
                    )}
                    {selectedBooking.status === 'in_progress' && (
                      <Button size="sm" onClick={() => handleStatusChange(selectedBooking.id, 'completed')}>
                        Mark Complete
                      </Button>
                    )}
                    {!['completed', 'cancelled'].includes(selectedBooking.status) && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatusChange(selectedBooking.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </Card>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => window.open(`mailto:${selectedBooking.clientEmail}`)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email Client
                  </Button>
                  <Button
                    variant="secondary"
                    className="text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDelete(selectedBooking.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
