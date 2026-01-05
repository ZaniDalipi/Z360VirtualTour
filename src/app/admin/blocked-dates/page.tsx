'use client'

import { useState, useEffect } from 'react'
import { CalendarX, Plus, X, Trash2, Calendar } from 'lucide-react'
import { Card, Button, Input } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'

interface BlockedDate {
  id: string
  date: string
  reason: string | null
  isAllDay: boolean
  createdAt: string
}

const reasonOptions = [
  'Holiday',
  'Personal Day',
  'Fully Booked',
  'Maintenance',
  'Vacation',
  'Other',
]

export default function BlockedDatesPage() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    reason: 'Personal Day',
    customReason: '',
    isAllDay: true,
  })

  useEffect(() => {
    fetchBlockedDates()
  }, [])

  const fetchBlockedDates = async () => {
    try {
      const res = await fetch('/api/admin/blocked-dates')
      if (res.ok) {
        const data = await res.json()
        setBlockedDates(data)
      }
    } catch (error) {
      console.error('Failed to fetch blocked dates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const reason = formData.reason === 'Other' ? formData.customReason : formData.reason

      const res = await fetch('/api/admin/blocked-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData.date,
          reason,
          isAllDay: formData.isAllDay,
        }),
      })

      if (res.ok) {
        fetchBlockedDates()
        resetForm()
      }
    } catch (error) {
      console.error('Failed to create blocked date:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to unblock this date?')) return

    try {
      const res = await fetch(`/api/admin/blocked-dates/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setBlockedDates((prev) => prev.filter((d) => d.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete blocked date:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      date: '',
      reason: 'Personal Day',
      customReason: '',
      isAllDay: true,
    })
    setShowForm(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const isUpcoming = (dateStr: string) => {
    return new Date(dateStr) >= new Date(new Date().toDateString())
  }

  // Group by upcoming vs past
  const upcomingDates = blockedDates
    .filter((d) => isUpcoming(d.date))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const pastDates = blockedDates
    .filter((d) => !isUpcoming(d.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gold/10 rounded animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gold/10 rounded-xl animate-pulse" />
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
            <CalendarX className="w-8 h-8 text-gold" />
            Blocked Dates
          </h1>
          <p className="text-body text-cream-muted">
            Manage dates when you're unavailable for bookings
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Block Date
        </Button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={resetForm}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md pointer-events-auto"
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-h3 font-semibold text-cream">Block a Date</h2>
                    <button
                      onClick={resetForm}
                      className="p-2 rounded-lg text-cream-muted hover:text-cream hover:bg-gold/10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Date *
                      </label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Reason
                      </label>
                      <select
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-navy border border-gold/20 text-cream
                                   focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50"
                      >
                        {reasonOptions.map((reason) => (
                          <option key={reason} value={reason}>
                            {reason}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.reason === 'Other' && (
                      <div>
                        <label className="block text-sm font-medium text-cream mb-2">
                          Custom Reason
                        </label>
                        <Input
                          value={formData.customReason}
                          onChange={(e) => setFormData({ ...formData, customReason: e.target.value })}
                          placeholder="Enter reason..."
                        />
                      </div>
                    )}

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isAllDay}
                        onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                        className="w-4 h-4 rounded border-gold/20 bg-navy text-gold focus:ring-gold/50"
                      />
                      <span className="text-sm text-cream">All day</span>
                    </label>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1">
                        Block Date
                      </Button>
                      <Button type="button" variant="secondary" onClick={resetForm}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gold">{upcomingDates.length}</p>
          <p className="text-sm text-cream-muted">Upcoming Blocked</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-cream-muted">{pastDates.length}</p>
          <p className="text-sm text-cream-muted">Past Blocked</p>
        </Card>
      </div>

      {/* Blocked Dates List */}
      {blockedDates.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="w-12 h-12 text-cream-muted mx-auto mb-4" />
          <p className="text-cream-muted mb-4">No blocked dates</p>
          <p className="text-sm text-cream-dim mb-6">
            Block dates when you're unavailable for bookings
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Block Your First Date
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Upcoming */}
          {upcomingDates.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-cream mb-4">Upcoming Blocked Dates</h2>
              <div className="space-y-3">
                {upcomingDates.map((blockedDate) => (
                  <motion.div
                    key={blockedDate.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <CalendarX className="w-6 h-6 text-red-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-cream">
                              {formatDate(blockedDate.date)}
                            </p>
                            <p className="text-sm text-cream-muted">
                              {blockedDate.reason || 'No reason specified'}
                              {blockedDate.isAllDay && ' • All day'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(blockedDate.id)}
                          className="p-2 rounded-lg text-cream-muted hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {pastDates.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-cream-muted mb-4">Past Blocked Dates</h2>
              <div className="space-y-3 opacity-60">
                {pastDates.slice(0, 5).map((blockedDate) => (
                  <Card key={blockedDate.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-cream/10 flex items-center justify-center">
                          <CalendarX className="w-6 h-6 text-cream-muted" />
                        </div>
                        <div>
                          <p className="font-semibold text-cream-muted">
                            {formatDate(blockedDate.date)}
                          </p>
                          <p className="text-sm text-cream-dim">
                            {blockedDate.reason || 'No reason specified'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(blockedDate.id)}
                        className="p-2 rounded-lg text-cream-muted hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </Card>
                ))}
                {pastDates.length > 5 && (
                  <p className="text-sm text-cream-dim text-center">
                    +{pastDates.length - 5} more past dates
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
