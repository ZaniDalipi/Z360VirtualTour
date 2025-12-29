'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Clock, CheckCircle, Calendar, MapPin,
  ChevronRight, Loader2, Filter, X
} from 'lucide-react'
import { Navbar } from '@/components/layout'
import { Card, Button } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'

interface Booking {
  id: string
  clientName: string
  propertyAddress: string
  propertyCity: string | null
  serviceType: string | null
  status: string
  totalQuote: number | null
  confirmedDate: string | null
  preferredDate: string | null
  createdAt: string
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  quote_requested: { label: 'Quote Requested', color: 'bg-blue-500/20 text-blue-400', icon: Clock },
  quote_sent: { label: 'Quote Sent', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  pending_confirmation: { label: 'Pending Confirmation', color: 'bg-orange-500/20 text-orange-400', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  scheduled: { label: 'Scheduled', color: 'bg-purple-500/20 text-purple-400', icon: Calendar },
  in_progress: { label: 'In Progress', color: 'bg-indigo-500/20 text-indigo-400', icon: Clock },
  completed: { label: 'Completed', color: 'bg-gold/20 text-gold', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400', icon: X },
}

const filterOptions = [
  { value: 'all', label: 'All Tours' },
  { value: 'pending', label: 'Pending' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
]

function MyToursContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialFilter = searchParams.get('filter') || 'all'

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(initialFilter)
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  useEffect(() => {
    async function loadBookings() {
      try {
        const res = await fetch('/api/user/bookings')
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login')
            return
          }
          throw new Error('Failed to fetch bookings')
        }

        const data = await res.json()
        setBookings(data.bookings || [])
      } catch (error) {
        console.error('Failed to load bookings:', error)
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    loadBookings()
  }, [router])

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true
    if (filter === 'pending') {
      return ['quote_requested', 'quote_sent', 'pending_confirmation'].includes(booking.status)
    }
    if (filter === 'scheduled') {
      return ['confirmed', 'scheduled', 'in_progress'].includes(booking.status)
    }
    if (filter === 'completed') {
      return booking.status === 'completed'
    }
    return true
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy pb-20">
      <header className="sticky top-0 z-40 bg-navy/95 backdrop-blur-lg border-b border-gold/10">
        <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Button variant="icon" size="sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-h4 font-semibold text-cream">My Tours</h1>
          </div>
          <div className="relative">
            <Button
              variant="icon"
              size="sm"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            >
              <Filter className="w-5 h-5" />
            </Button>

            <AnimatePresence>
              {showFilterMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-navy-light border border-gold/20 rounded-lg shadow-lg overflow-hidden z-50"
                >
                  {filterOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilter(option.value)
                        setShowFilterMenu(false)
                      }}
                      className={`w-full px-4 py-3 text-left text-body-sm transition-colors ${
                        filter === option.value
                          ? 'bg-gold/20 text-gold'
                          : 'text-cream hover:bg-gold/10'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filter Pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-full text-body-sm whitespace-nowrap transition-colors ${
                filter === option.value
                  ? 'bg-gold text-navy font-medium'
                  : 'bg-navy-light text-cream-muted hover:text-cream'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-cream-muted mb-4">
              {filter === 'all'
                ? "You haven't booked any tours yet"
                : `No ${filter} tours found`}
            </p>
            <Link href="/contact">
              <Button>Book a Tour</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => {
              const status = statusConfig[booking.status] || statusConfig.quote_requested
              const StatusIcon = status.icon

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/profile/tours/${booking.id}`}>
                    <Card className="p-4 hover:border-gold/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-caption ${status.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </div>

                          <h3 className="text-body font-medium text-cream mb-1 truncate">
                            {booking.serviceType || 'Virtual Tour'}
                          </h3>

                          <div className="flex items-center gap-1 text-body-sm text-cream-muted mb-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                              {booking.propertyCity || booking.propertyAddress}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-caption text-cream-dim">
                            {booking.confirmedDate ? (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(booking.confirmedDate)}
                              </span>
                            ) : booking.preferredDate ? (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Preferred: {formatDate(booking.preferredDate)}
                              </span>
                            ) : (
                              <span>Requested: {formatDate(booking.createdAt)}</span>
                            )}

                            {booking.totalQuote && (
                              <span className="text-gold font-medium">
                                €{booking.totalQuote.toFixed(0)}
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight className="w-5 h-5 text-cream-muted flex-shrink-0" />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Book New Tour CTA */}
        {filteredBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Link href="/contact">
              <Button variant="secondary" className="w-full">
                Book Another Tour
              </Button>
            </Link>
          </motion.div>
        )}
      </main>

      <Navbar />
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-gold animate-spin" />
    </div>
  )
}

export default function MyToursPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MyToursContent />
    </Suspense>
  )
}
