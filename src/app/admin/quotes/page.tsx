'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  Search,
  Filter,
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Bell,
  Building2,
  RefreshCw,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout'
import { useToast } from '@/components/ui/Toast'

interface Quote {
  id: string
  quoteNumber: string
  clientName: string
  clientEmail: string
  clientPhone: string
  company: string | null
  propertyAddress: string
  propertyCity: string | null
  propertyType: string | null
  propertySize: string | null
  preferredCallTime: string | null
  preferredCallDate: string | null
  callbackScheduled: string | null
  status: string
  estimatedPrice: number | null
  finalPrice: number | null
  isRead: boolean
  createdAt: string
  hasAccount: boolean
}

interface Stats {
  total: number
  unread: number
  byStatus: Record<string, number>
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  callback_scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  quoted: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  accepted: 'bg-green-500/10 text-green-400 border-green-500/30',
  declined: 'bg-red-500/10 text-red-400 border-red-500/30',
  expired: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  callback_scheduled: 'Callback Scheduled',
  quoted: 'Quoted',
  accepted: 'Accepted',
  declined: 'Declined',
  expired: 'Expired',
}

const callTimeLabels: Record<string, string> = {
  morning: '9AM - 12PM',
  afternoon: '12PM - 5PM',
  evening: '5PM - 8PM',
}

export default function AdminQuotesPage() {
  const router = useRouter()
  const { success, error } = useToast()

  const [quotes, setQuotes] = useState<Quote[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const fetchQuotes = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/admin/quotes?${params}`)

      if (res.status === 401) {
        router.push('/admin')
        return
      }

      if (!res.ok) throw new Error('Failed to fetch quotes')

      const data = await res.json()
      setQuotes(data.quotes)
      setStats(data.stats)
    } catch (err) {
      error('Error', 'Failed to load quotes')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, searchQuery, router, error])

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  const handleScheduleCallback = async (quoteId: string, datetime: string) => {
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'callback_scheduled',
          callbackScheduled: datetime,
        }),
      })

      if (!res.ok) throw new Error('Failed to schedule callback')

      success('Callback Scheduled', 'Client will be notified by email')
      fetchQuotes()
      setSelectedQuote(null)
    } catch (err) {
      error('Error', 'Failed to schedule callback')
      console.error(err)
    }
  }

  const handleUpdateStatus = async (quoteId: string, newStatus: string, additionalData?: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, ...additionalData }),
      })

      if (!res.ok) throw new Error('Failed to update status')

      success('Status Updated', `Quote marked as ${statusLabels[newStatus]}`)
      fetchQuotes()
    } catch (err) {
      error('Error', 'Failed to update status')
      console.error(err)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-navy">
      <Header />

      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-cream">Quote Requests</h1>
              <p className="text-cream-muted text-sm mt-1">
                Manage client quote requests and schedule callbacks
              </p>
            </div>

            <button
              onClick={() => fetchQuotes()}
              className="flex items-center gap-2 px-4 py-2 bg-navy-light text-cream rounded-lg hover:bg-navy-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-navy-medium border border-cream/10 rounded-xl p-4">
                <p className="text-cream-muted text-sm">Total Quotes</p>
                <p className="text-2xl font-bold text-cream">{stats.total}</p>
              </div>
              <div className="bg-navy-medium border border-cream/10 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <p className="text-cream-muted text-sm">Unread</p>
                  {stats.unread > 0 && (
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
                <p className="text-2xl font-bold text-cream">{stats.unread}</p>
              </div>
              <div className="bg-navy-medium border border-cream/10 rounded-xl p-4">
                <p className="text-cream-muted text-sm">Pending</p>
                <p className="text-2xl font-bold text-amber-400">
                  {stats.byStatus.pending || 0}
                </p>
              </div>
              <div className="bg-navy-medium border border-cream/10 rounded-xl p-4">
                <p className="text-cream-muted text-sm">Accepted</p>
                <p className="text-2xl font-bold text-green-400">
                  {stats.byStatus.accepted || 0}
                </p>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-navy-medium border border-cream/10 rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search quotes..."
                  className="w-full pl-10 pr-4 py-2 bg-navy-light border border-cream/10 rounded-lg text-cream placeholder-cream-muted focus:outline-none focus:border-gold"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters
                    ? 'bg-gold text-navy-dark'
                    : 'bg-navy-light text-cream hover:bg-navy'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-cream/10"
                >
                  <div className="flex flex-wrap gap-2">
                    {['all', 'pending', 'callback_scheduled', 'quoted', 'accepted', 'declined', 'expired'].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            statusFilter === status
                              ? 'bg-gold text-navy-dark'
                              : 'bg-navy-light text-cream-muted hover:text-cream'
                          }`}
                        >
                          {status === 'all' ? 'All' : statusLabels[status]}
                        </button>
                      )
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quotes List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-12 bg-navy-medium border border-cream/10 rounded-xl">
              <Bell className="w-12 h-12 text-cream-muted mx-auto mb-4" />
              <p className="text-cream font-medium">No quotes found</p>
              <p className="text-cream-muted text-sm mt-1">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Quote requests will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <motion.div
                  key={quote.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-navy-medium border rounded-xl overflow-hidden transition-all hover:border-gold/30 ${
                    quote.isRead ? 'border-cream/10' : 'border-gold/50'
                  }`}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Quote Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {!quote.isRead && (
                            <span className="w-2 h-2 bg-gold rounded-full flex-shrink-0" />
                          )}
                          <span className="text-gold font-mono text-sm">
                            {quote.quoteNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                              statusColors[quote.status]
                            }`}
                          >
                            {statusLabels[quote.status]}
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-cream mb-1">
                          {quote.clientName}
                        </h3>

                        <div className="flex flex-wrap gap-4 text-sm text-cream-muted">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {quote.clientEmail}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {quote.clientPhone}
                          </span>
                          {quote.company && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {quote.company}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-4 text-sm">
                          <span className="flex items-center gap-1 text-cream-muted">
                            <MapPin className="w-4 h-4" />
                            {quote.propertyAddress}
                            {quote.propertyCity && `, ${quote.propertyCity}`}
                          </span>
                          {quote.preferredCallTime && (
                            <span className="flex items-center gap-1 text-cream-muted">
                              <Clock className="w-4 h-4" />
                              Prefers: {callTimeLabels[quote.preferredCallTime]}
                            </span>
                          )}
                        </div>

                        {quote.callbackScheduled && (
                          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-sm">
                            <Calendar className="w-4 h-4" />
                            Callback: {formatDateTime(quote.callbackScheduled)}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 sm:items-end">
                        <p className="text-cream-dim text-xs">
                          {formatDate(quote.createdAt)}
                        </p>

                        <div className="flex gap-2">
                          {quote.status === 'pending' && (
                            <button
                              onClick={() => setSelectedQuote(quote)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition-colors"
                            >
                              <Phone className="w-4 h-4" />
                              Schedule Call
                            </button>
                          )}

                          {quote.status === 'callback_scheduled' && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(quote.id, 'quoted', {
                                  finalPrice: 0,
                                  quoteValidUntil: new Date(
                                    Date.now() + 14 * 24 * 60 * 60 * 1000
                                  ).toISOString(),
                                })
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-500/20 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Mark Quoted
                            </button>
                          )}

                          <Link
                            href={`/admin/quotes/${quote.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-light text-cream rounded-lg text-sm font-medium hover:bg-navy transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Schedule Callback Modal */}
      <AnimatePresence>
        {selectedQuote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/80 backdrop-blur-sm"
            onClick={() => setSelectedQuote(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-navy-medium border border-cream/10 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-cream mb-4">Schedule Callback</h2>

              <div className="mb-4 p-4 bg-navy-light rounded-lg">
                <p className="text-cream font-medium">{selectedQuote.clientName}</p>
                <p className="text-cream-muted text-sm">{selectedQuote.clientPhone}</p>
                {selectedQuote.preferredCallTime && (
                  <p className="text-gold text-sm mt-2">
                    Prefers: {callTimeLabels[selectedQuote.preferredCallTime]}
                  </p>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  const datetime = formData.get('datetime') as string
                  if (datetime) {
                    handleScheduleCallback(selectedQuote.id, datetime)
                  }
                }}
              >
                <label className="block text-cream text-sm font-medium mb-2">
                  Callback Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="datetime"
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream focus:outline-none focus:border-gold"
                />

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedQuote(null)}
                    className="flex-1 px-4 py-2 bg-navy-light text-cream rounded-lg hover:bg-navy transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gold text-navy-dark rounded-lg font-medium hover:bg-gold-soft transition-colors"
                  >
                    Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
