'use client'

import { useState, useEffect } from 'react'
import { CalendarDays, Phone, Mail, MapPin, Clock, Check, ChevronRight, User, Building2, AlertCircle } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'

interface ScheduledBooking {
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string | null
  companyName: string | null
  propertyAddress: string
  propertyCity: string | null
  estimatedDistance: number | null
  preferredDate: string | null
  alternateDate: string | null
  deadlineDate: string | null
  confirmedDate: string | null
  totalQuote: number | null
  status: string
  projectDescription: string | null
  createdAt: string
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
  scheduled: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  in_progress: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
}

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmed',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
}

export default function SchedulePage() {
  const [bookings, setBookings] = useState<ScheduledBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchScheduledBookings()
  }, [])

  const fetchScheduledBookings = async () => {
    try {
      // Fetch confirmed, scheduled, and in_progress bookings
      const [confirmedRes, scheduledRes, inProgressRes] = await Promise.all([
        fetch('/api/admin/bookings?status=confirmed'),
        fetch('/api/admin/bookings?status=scheduled'),
        fetch('/api/admin/bookings?status=in_progress'),
      ])

      const allBookings: ScheduledBooking[] = []

      if (confirmedRes.ok) {
        const data = await confirmedRes.json()
        allBookings.push(...data.bookings)
      }
      if (scheduledRes.ok) {
        const data = await scheduledRes.json()
        allBookings.push(...data.bookings)
      }
      if (inProgressRes.ok) {
        const data = await inProgressRes.json()
        allBookings.push(...data.bookings)
      }

      // Sort by confirmed date or preferred date
      allBookings.sort((a, b) => {
        const dateA = a.confirmedDate || a.preferredDate || a.createdAt
        const dateB = b.confirmedDate || b.preferredDate || b.createdAt
        return new Date(dateA).getTime() - new Date(dateB).getTime()
      })

      setBookings(allBookings)
    } catch (error) {
      console.error('Failed to fetch scheduled bookings:', error)
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
        fetchScheduledBookings()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatFullDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const isUrgent = (booking: ScheduledBooking) => {
    if (!booking.deadlineDate) return false
    const deadline = new Date(booking.deadlineDate)
    const today = new Date()
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 3
  }

  // Group bookings by date
  const groupedBookings = bookings.reduce((groups, booking) => {
    const date = booking.confirmedDate || booking.preferredDate || 'Unscheduled'
    const dateKey = date === 'Unscheduled' ? date : new Date(date).toISOString().split('T')[0]
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(booking)
    return groups
  }, {} as Record<string, ScheduledBooking[]>)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gold/10 rounded animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gold/10 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h2 font-bold text-cream flex items-center gap-2">
          <CalendarDays className="w-8 h-8 text-gold" />
          My Schedule
        </h1>
        <p className="text-body text-cream-muted">
          Confirmed bookings and upcoming work - {bookings.length} jobs to complete
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {bookings.filter(b => b.status === 'confirmed').length}
          </p>
          <p className="text-sm text-cream-muted">Confirmed</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">
            {bookings.filter(b => b.status === 'scheduled').length}
          </p>
          <p className="text-sm text-cream-muted">Scheduled</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-indigo-400">
            {bookings.filter(b => b.status === 'in_progress').length}
          </p>
          <p className="text-sm text-cream-muted">In Progress</p>
        </Card>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarDays className="w-12 h-12 text-cream-muted mx-auto mb-4" />
          <p className="text-cream-muted">No confirmed bookings yet</p>
          <p className="text-sm text-cream-dim mt-2">
            Bookings will appear here once confirmed with clients
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedBookings).map(([dateKey, dateBookings]) => (
            <div key={dateKey}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-cream">
                    {dateKey === 'Unscheduled' ? 'Date TBD' : formatFullDate(dateKey)}
                  </h2>
                  <p className="text-sm text-cream-muted">
                    {dateBookings.length} booking{dateBookings.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Bookings for this date */}
              <div className="space-y-3 ml-6 border-l-2 border-gold/20 pl-6">
                {dateBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card
                      className={`overflow-hidden transition-all ${
                        isUrgent(booking) ? 'border-orange-500/50' : ''
                      }`}
                    >
                      {/* Main Info */}
                      <div
                        className="p-4 cursor-pointer"
                        onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {isUrgent(booking) && (
                                <AlertCircle className="w-4 h-4 text-orange-400" />
                              )}
                              <h3 className="font-semibold text-cream truncate">
                                {booking.clientName}
                              </h3>
                              <span className={`text-xs px-2 py-0.5 rounded border ${statusColors[booking.status]}`}>
                                {statusLabels[booking.status]}
                              </span>
                            </div>

                            {/* Quick contact */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              {booking.clientPhone && (
                                <a
                                  href={`tel:${booking.clientPhone}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1 text-gold hover:text-gold/80 font-medium"
                                >
                                  <Phone className="w-4 h-4" />
                                  {booking.clientPhone}
                                </a>
                              )}
                              <span className="flex items-center gap-1 text-cream-muted">
                                <MapPin className="w-4 h-4" />
                                {booking.propertyCity || booking.propertyAddress}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {booking.totalQuote && (
                              <span className="text-gold font-semibold">
                                €{booking.totalQuote.toFixed(0)}
                              </span>
                            )}
                            <ChevronRight className={`w-5 h-5 text-cream-muted transition-transform ${
                              expandedId === booking.id ? 'rotate-90' : ''
                            }`} />
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {expandedId === booking.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 border-t border-gold/10 pt-4 space-y-4">
                              {/* Client Info */}
                              <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-cream-muted mb-1">Client</p>
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-cream-muted" />
                                    <span className="text-cream">{booking.clientName}</span>
                                  </div>
                                  {booking.companyName && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <Building2 className="w-4 h-4 text-cream-muted" />
                                      <span className="text-cream-muted text-sm">{booking.companyName}</span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs text-cream-muted mb-1">Location</p>
                                  <p className="text-cream text-sm">{booking.propertyAddress}</p>
                                  {booking.propertyCity && (
                                    <p className="text-cream-muted text-sm">{booking.propertyCity}</p>
                                  )}
                                  {booking.estimatedDistance && (
                                    <p className="text-cream-dim text-xs mt-1">
                                      ~{booking.estimatedDistance} km from base
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Dates */}
                              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                                {booking.confirmedDate && (
                                  <div>
                                    <p className="text-xs text-cream-muted mb-1">Confirmed Date</p>
                                    <p className="text-green-400 font-medium">{formatDate(booking.confirmedDate)}</p>
                                  </div>
                                )}
                                {booking.preferredDate && (
                                  <div>
                                    <p className="text-xs text-cream-muted mb-1">Preferred</p>
                                    <p className="text-cream">{formatDate(booking.preferredDate)}</p>
                                  </div>
                                )}
                                {booking.deadlineDate && (
                                  <div>
                                    <p className="text-xs text-cream-muted mb-1">Deadline</p>
                                    <p className={`font-medium ${isUrgent(booking) ? 'text-orange-400' : 'text-cream'}`}>
                                      {formatDate(booking.deadlineDate)}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Notes */}
                              {booking.projectDescription && (
                                <div>
                                  <p className="text-xs text-cream-muted mb-1">Project Notes</p>
                                  <p className="text-cream text-sm bg-navy/50 rounded-lg p-3">
                                    {booking.projectDescription}
                                  </p>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex flex-wrap gap-2 pt-2">
                                {booking.clientPhone && (
                                  <Button
                                    size="sm"
                                    onClick={() => window.open(`tel:${booking.clientPhone}`)}
                                  >
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => window.open(`mailto:${booking.clientEmail}`)}
                                >
                                  <Mail className="w-4 h-4 mr-2" />
                                  Email
                                </Button>

                                {booking.status === 'confirmed' && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleStatusChange(booking.id, 'scheduled')}
                                  >
                                    Mark Scheduled
                                  </Button>
                                )}
                                {booking.status === 'scheduled' && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleStatusChange(booking.id, 'in_progress')}
                                  >
                                    Start Work
                                  </Button>
                                )}
                                {booking.status === 'in_progress' && (
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleStatusChange(booking.id, 'completed')}
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Complete
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
