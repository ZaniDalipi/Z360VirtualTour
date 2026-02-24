'use client'

import { useState, useEffect } from 'react'
import {
  CalendarCheck, Mail, Phone, MapPin, Clock, DollarSign,
  Check, X, AlertCircle, Calendar, ChevronDown, ChevronUp,
  Trash2, Building2, FileText, Route, Users, Tag, Plus,
  Download, Play, Pause, Send, CreditCard, Package, Star,
  MessageSquare, Percent
} from 'lucide-react'
import { Card, Button, Input } from '@/components/ui'
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
  preferredTime: string | null
  alternateDate: string | null
  alternateTime: string | null
  deadlineDate: string | null
  confirmedDate: string | null
  confirmedTime: string | null
  basePrice: number | null
  urgencySurcharge: number | null
  travelFee: number | null
  bundleDiscount: number | null
  sameCityDiscount: number | null
  totalQuote: number | null
  depositAmount: number | null
  depositPaid: boolean
  // Payment fields
  paymentStatus: string
  paidAmount: number | null
  paidAt: string | null
  balanceAmount: number | null
  paymentMethod: string | null
  status: string
  isRead: boolean
  createdAt: string
  internalNotes: string | null
  communicationLog: string | null
  deliveredAt: string | null
  deliverables: string | null
  clientFeedback: string | null
  rating: number | null
  workStartedAt: string | null
  workEndedAt: string | null
  workDurationMinutes: number | null
  // Change request fields
  changeRequestType: string | null
  changeRequestMessage: string | null
  changeRequestDate: string | null
  changeRequestStatus: string | null
  requestedNewDate: string | null
  requestedNewTime: string | null
  // Related data
  pricingPlanName?: string | null
  urgencyTierName?: string | null
  travelBundleName?: string | null
}

// Available time slots for booking
const timeSlots = [
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
]

const statusColors: Record<string, string> = {
  quote_requested: 'bg-blue-500/20 text-blue-400',
  quote_sent: 'bg-yellow-500/20 text-yellow-400',
  negotiating: 'bg-amber-500/20 text-amber-400',
  pending_deposit: 'bg-orange-500/20 text-orange-400',
  confirmed: 'bg-green-500/20 text-green-400',
  scheduled: 'bg-purple-500/20 text-purple-400',
  in_progress: 'bg-indigo-500/20 text-indigo-400',
  editing: 'bg-cyan-500/20 text-cyan-400',
  delivered: 'bg-teal-500/20 text-teal-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

const statusLabels: Record<string, string> = {
  quote_requested: 'Quote Requested',
  quote_sent: 'Quote Sent',
  negotiating: 'Negotiating',
  pending_deposit: 'Awaiting Deposit',
  confirmed: 'Confirmed',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  editing: 'Editing',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const statusIcons: Record<string, React.ReactNode> = {
  quote_requested: <FileText className="w-4 h-4" />,
  quote_sent: <Send className="w-4 h-4" />,
  negotiating: <MessageSquare className="w-4 h-4" />,
  pending_deposit: <CreditCard className="w-4 h-4" />,
  confirmed: <Check className="w-4 h-4" />,
  scheduled: <Calendar className="w-4 h-4" />,
  in_progress: <Play className="w-4 h-4" />,
  editing: <Package className="w-4 h-4" />,
  delivered: <Download className="w-4 h-4" />,
  completed: <Star className="w-4 h-4" />,
  cancelled: <X className="w-4 h-4" />,
}

// Workflow stages in order
const workflowStages = [
  'quote_requested',
  'quote_sent',
  'negotiating',
  'pending_deposit',
  'confirmed',
  'scheduled',
  'in_progress',
  'editing',
  'delivered',
  'completed',
]

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [unreadCount, setUnreadCount] = useState(0)
  const [confirmingDate, setConfirmingDate] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)
  const [changeRequestResponse, setChangeRequestResponse] = useState('')
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    companyName: '',
    propertyAddress: '',
    propertyCity: '',
    projectDescription: '',
    preferredDate: '',
    totalQuote: '',
    internalNotes: '',
    status: 'quote_requested',
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalQuote: formData.totalQuote ? parseFloat(formData.totalQuote) : null,
        }),
      })

      if (res.ok) {
        fetchBookings()
        resetForm()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Failed to create booking:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      companyName: '',
      propertyAddress: '',
      propertyCity: '',
      projectDescription: '',
      preferredDate: '',
      totalQuote: '',
      internalNotes: '',
      status: 'quote_requested',
    })
    setShowForm(false)
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
          confirmedDate: selectedDate,
          confirmedTime: selectedTime || null
        }),
      })

      if (res.ok) {
        fetchBookings()
        setConfirmingDate(null)
        setSelectedDate('')
        setSelectedTime('')
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

  const handleRecordPayment = async (booking: Booking, paymentType: 'deposit' | 'balance' | 'full') => {
    if (!confirm(`Record ${paymentType} payment for ${booking.clientName}? This will send a confirmation email.`)) {
      return
    }

    try {
      const totalQuote = booking.totalQuote || 0
      const depositAmount = booking.depositAmount || 0
      const currentPaid = booking.paidAmount || 0

      let paidAmount: number
      let newDepositPaid = booking.depositPaid
      let newPaymentStatus: string
      let newBalanceAmount: number

      if (paymentType === 'deposit') {
        paidAmount = depositAmount
        newDepositPaid = true
        newPaymentStatus = depositAmount >= totalQuote ? 'paid' : 'partial'
        newBalanceAmount = totalQuote - depositAmount
      } else if (paymentType === 'balance') {
        paidAmount = currentPaid + (booking.balanceAmount || 0)
        newDepositPaid = true
        newPaymentStatus = 'paid'
        newBalanceAmount = 0
      } else {
        // Full payment
        paidAmount = totalQuote
        newDepositPaid = true
        newPaymentStatus = 'paid'
        newBalanceAmount = 0
      }

      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          depositPaid: newDepositPaid,
          paidAmount,
          paidAt: new Date().toISOString(),
          paymentStatus: newPaymentStatus,
          paymentMethod: 'bank_transfer_or_cash',
          balanceAmount: newBalanceAmount,
          recordPayment: true,
          paymentType,
        }),
      })

      if (res.ok) {
        fetchBookings()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to record payment')
      }
    } catch (error) {
      console.error('Failed to record payment:', error)
      alert('Failed to record payment')
    }
  }

  const handleChangeRequest = async (id: string, action: 'approve' | 'reject', booking: Booking) => {
    setProcessingRequest(id)
    try {
      const res = await fetch(`/api/admin/bookings/${id}/change-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          adminResponse: changeRequestResponse,
          // If approving a date change, include the new date
          ...(action === 'approve' && booking.changeRequestType === 'date_change' && {
            newConfirmedDate: booking.requestedNewDate,
            newConfirmedTime: booking.requestedNewTime,
          }),
        }),
      })

      if (res.ok) {
        fetchBookings()
        setChangeRequestResponse('')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to process request')
      }
    } catch (error) {
      console.error('Failed to process change request:', error)
    } finally {
      setProcessingRequest(null)
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

  // European date format (DD/MM/YYYY)
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Booking
        </Button>
      </div>

      {/* Add Booking Form Modal */}
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
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-h3 font-semibold text-cream">Add Booking</h2>
                    <button
                      onClick={resetForm}
                      className="p-2 rounded-lg text-cream-muted hover:text-cream hover:bg-gold/10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Client Info */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-cream mb-2">
                          Client Name *
                        </label>
                        <Input
                          value={formData.clientName}
                          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                          placeholder="John Smith"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cream mb-2">
                          Email *
                        </label>
                        <Input
                          type="email"
                          value={formData.clientEmail}
                          onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-cream mb-2">
                          Phone
                        </label>
                        <Input
                          value={formData.clientPhone}
                          onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                          placeholder="+1 234 567 890"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cream mb-2">
                          Company
                        </label>
                        <Input
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          placeholder="Company Name"
                        />
                      </div>
                    </div>

                    {/* Property Info */}
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Property Address *
                      </label>
                      <Input
                        value={formData.propertyAddress}
                        onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                        placeholder="123 Main St, City"
                        required
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-cream mb-2">
                          City
                        </label>
                        <Input
                          value={formData.propertyCity}
                          onChange={(e) => setFormData({ ...formData, propertyCity: e.target.value })}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cream mb-2">
                          Preferred Date
                        </label>
                        <Input
                          type="date"
                          value={formData.preferredDate}
                          onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Quote */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-cream mb-2">
                          Total Quote (€)
                        </label>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.totalQuote}
                          onChange={(e) => setFormData({ ...formData, totalQuote: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cream mb-2">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-navy border border-gold/20 text-cream
                                     focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50"
                        >
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Project Description
                      </label>
                      <textarea
                        value={formData.projectDescription}
                        onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                        placeholder="Details about the project..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-navy border border-gold/20 text-cream
                                   placeholder:text-cream-muted focus:outline-none focus:ring-2
                                   focus:ring-gold/50 focus:border-gold/50 resize-none"
                      />
                    </div>

                    {/* Internal Notes */}
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Internal Notes
                      </label>
                      <textarea
                        value={formData.internalNotes}
                        onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                        placeholder="Notes for internal use only..."
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl bg-navy border border-gold/20 text-cream
                                   placeholder:text-cream-muted focus:outline-none focus:ring-2
                                   focus:ring-gold/50 focus:border-gold/50 resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1">
                        Create Booking
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
                          {booking.changeRequestType && booking.changeRequestStatus === 'pending' && (
                            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
                              booking.changeRequestType === 'cancellation'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-orange-500/20 text-orange-400'
                            }`}>
                              <AlertCircle className="w-3 h-3" />
                              {booking.changeRequestType === 'cancellation' ? 'Cancel Request' :
                               booking.changeRequestType === 'date_change' ? 'Date Change' : 'Change Request'}
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
                          {new Date(booking.createdAt).toLocaleDateString('en-GB')}
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

                          {/* Change Request Alert */}
                          {booking.changeRequestType && booking.changeRequestStatus === 'pending' && (
                            <div className={`p-4 rounded-xl border ${
                              booking.changeRequestType === 'cancellation'
                                ? 'bg-red-500/10 border-red-500/30'
                                : booking.changeRequestType === 'date_change'
                                ? 'bg-orange-500/10 border-orange-500/30'
                                : 'bg-blue-500/10 border-blue-500/30'
                            }`}>
                              <div className="flex items-start gap-3 mb-3">
                                <AlertCircle className={`w-5 h-5 mt-0.5 ${
                                  booking.changeRequestType === 'cancellation' ? 'text-red-400' :
                                  booking.changeRequestType === 'date_change' ? 'text-orange-400' : 'text-blue-400'
                                }`} />
                                <div className="flex-1">
                                  <h4 className={`font-semibold ${
                                    booking.changeRequestType === 'cancellation' ? 'text-red-400' :
                                    booking.changeRequestType === 'date_change' ? 'text-orange-400' : 'text-blue-400'
                                  }`}>
                                    {booking.changeRequestType === 'cancellation' ? 'Cancellation Request' :
                                     booking.changeRequestType === 'date_change' ? 'Date Change Request' : 'Change Request'}
                                  </h4>
                                  <p className="text-cream-muted text-sm">
                                    Submitted {booking.changeRequestDate && formatDateTime(booking.changeRequestDate)}
                                  </p>
                                </div>
                              </div>

                              {/* Request Details */}
                              {booking.changeRequestType === 'date_change' && booking.requestedNewDate && (
                                <div className="mb-3 p-3 rounded-lg bg-navy">
                                  <p className="text-sm text-cream-muted mb-1">Requested New Date:</p>
                                  <p className="text-cream font-medium">
                                    {formatDate(booking.requestedNewDate)}
                                    {booking.requestedNewTime && (
                                      <span className="text-gold ml-2">at {booking.requestedNewTime}</span>
                                    )}
                                  </p>
                                </div>
                              )}

                              {booking.changeRequestMessage && (
                                <div className="mb-4 p-3 rounded-lg bg-navy">
                                  <p className="text-sm text-cream-muted mb-1">Client's Message:</p>
                                  <p className="text-cream italic">"{booking.changeRequestMessage}"</p>
                                </div>
                              )}

                              {/* Admin Response */}
                              <div className="mb-3">
                                <label className="block text-sm text-cream-muted mb-2">
                                  Response to Client (optional):
                                </label>
                                <textarea
                                  value={changeRequestResponse}
                                  onChange={(e) => setChangeRequestResponse(e.target.value)}
                                  placeholder="Add a message for the client..."
                                  rows={2}
                                  className="w-full px-3 py-2 rounded-lg bg-navy border border-gold/20 text-cream placeholder:text-cream-dim text-sm resize-none focus:outline-none focus:border-gold/50"
                                />
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                {booking.changeRequestType === 'cancellation' ? (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleChangeRequest(booking.id, 'approve', booking)}
                                      disabled={processingRequest === booking.id}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      {processingRequest === booking.id ? (
                                        <Clock className="w-4 h-4 mr-1 animate-spin" />
                                      ) : (
                                        <Check className="w-4 h-4 mr-1" />
                                      )}
                                      Approve Cancellation
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => handleChangeRequest(booking.id, 'reject', booking)}
                                      disabled={processingRequest === booking.id}
                                    >
                                      <X className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleChangeRequest(booking.id, 'approve', booking)}
                                      disabled={processingRequest === booking.id}
                                    >
                                      {processingRequest === booking.id ? (
                                        <Clock className="w-4 h-4 mr-1 animate-spin" />
                                      ) : (
                                        <Check className="w-4 h-4 mr-1" />
                                      )}
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => handleChangeRequest(booking.id, 'reject', booking)}
                                      disabled={processingRequest === booking.id}
                                    >
                                      <X className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Past Change Request (already processed) */}
                          {booking.changeRequestType && booking.changeRequestStatus && booking.changeRequestStatus !== 'pending' && (
                            <div className={`p-3 rounded-lg ${
                              booking.changeRequestStatus === 'approved' ? 'bg-green-500/10' : 'bg-gray-500/10'
                            }`}>
                              <p className="text-sm">
                                <span className={booking.changeRequestStatus === 'approved' ? 'text-green-400' : 'text-gray-400'}>
                                  {booking.changeRequestType === 'cancellation' ? 'Cancellation' :
                                   booking.changeRequestType === 'date_change' ? 'Date Change' : 'Change'} Request {booking.changeRequestStatus}
                                </span>
                                {booking.changeRequestDate && (
                                  <span className="text-cream-dim ml-2">
                                    ({formatDate(booking.changeRequestDate)})
                                  </span>
                                )}
                              </p>
                            </div>
                          )}

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
                                    <span className="text-cream-muted">Preferred Date & Time</span>
                                    <span className="text-cream">
                                      {formatDate(booking.preferredDate)}
                                      {booking.preferredTime && (
                                        <span className="text-gold ml-2">at {booking.preferredTime}</span>
                                      )}
                                    </span>
                                  </div>
                                )}
                                {booking.alternateDate && (
                                  <div className="flex justify-between">
                                    <span className="text-cream-muted">Alternate Date & Time</span>
                                    <span className="text-cream">
                                      {formatDate(booking.alternateDate)}
                                      {booking.alternateTime && (
                                        <span className="text-gold ml-2">at {booking.alternateTime}</span>
                                      )}
                                    </span>
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
                                    <span className="text-cream-muted">Confirmed Date & Time</span>
                                    <span className="text-green-400 font-medium">
                                      {formatDate(booking.confirmedDate)}
                                      {booking.confirmedTime && (
                                        <span className="ml-2">at {booking.confirmedTime}</span>
                                      )}
                                    </span>
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
                                {booking.sameCityDiscount && booking.sameCityDiscount > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-cream-muted flex items-center gap-1">
                                      <Percent className="w-3 h-3" />
                                      Same-City Discount
                                    </span>
                                    <span className="text-green-400">-{formatCurrency(booking.sameCityDiscount)}</span>
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
                                {booking.paidAmount !== null && booking.paidAmount > 0 && (
                                  <div className="flex justify-between text-xs pt-2 border-t border-gold/10">
                                    <span className="text-cream-muted">Amount Paid</span>
                                    <span className="text-green-400 font-medium">{formatCurrency(booking.paidAmount)}</span>
                                  </div>
                                )}
                                {booking.balanceAmount !== null && booking.balanceAmount > 0 && (
                                  <div className="flex justify-between text-xs">
                                    <span className="text-cream-muted">Balance Due</span>
                                    <span className="text-amber-400">{formatCurrency(booking.balanceAmount)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Payment Management */}
                          {booking.totalQuote && booking.totalQuote > 0 && (
                            <div className="p-4 rounded-xl bg-navy border border-gold/20">
                              <h4 className="text-sm font-medium text-gold mb-3 flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                Payment Management
                              </h4>
                              <div className="space-y-3">
                                {/* Payment Status */}
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm text-cream-muted">Status:</span>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    booking.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                                    booking.paymentStatus === 'partial' ? 'bg-amber-500/20 text-amber-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  }`}>
                                    {booking.paymentStatus === 'paid' ? 'Fully Paid' :
                                     booking.paymentStatus === 'partial' ? 'Partial Payment' :
                                     'Pending'}
                                  </span>
                                  {booking.paidAt && (
                                    <span className="text-xs text-cream-dim">
                                      Last payment: {formatDateTime(booking.paidAt)}
                                    </span>
                                  )}
                                </div>

                                {/* Record Payment Button */}
                                {booking.paymentStatus !== 'paid' && (
                                  <div className="flex flex-wrap gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleRecordPayment(booking, 'deposit')}
                                      disabled={booking.depositPaid}
                                      className={booking.depositPaid ? 'opacity-50 cursor-not-allowed' : ''}
                                    >
                                      <Check className="w-4 h-4 mr-1" />
                                      {booking.depositPaid ? 'Deposit Received' : `Record Deposit (${formatCurrency(booking.depositAmount)})`}
                                    </Button>
                                    {booking.depositPaid && booking.balanceAmount && booking.balanceAmount > 0 && (
                                      <Button
                                        size="sm"
                                        onClick={() => handleRecordPayment(booking, 'balance')}
                                      >
                                        <Check className="w-4 h-4 mr-1" />
                                        Record Balance ({formatCurrency(booking.balanceAmount)})
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => handleRecordPayment(booking, 'full')}
                                    >
                                      <Check className="w-4 h-4 mr-1" />
                                      Record Full Payment
                                    </Button>
                                  </div>
                                )}

                                {/* Payment Info */}
                                <p className="text-xs text-cream-dim">
                                  Payment methods: Bank Transfer / Cash
                                </p>
                              </div>
                            </div>
                          )}

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

                          {/* Date & Time Confirmation Flow */}
                          {confirmingDate === booking.id && booking.status === 'pending_deposit' && (
                            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                              <p className="text-sm text-cream mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-green-400" />
                                Confirm date and time for this booking:
                              </p>
                              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                                <div>
                                  <label className="block text-xs text-cream-muted mb-1">Date *</label>
                                  <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-navy border border-gold/20 text-cream text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-cream-muted mb-1">Time</label>
                                  <select
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-navy border border-gold/20 text-cream text-sm"
                                  >
                                    <option value="">Select time...</option>
                                    {timeSlots.map((slot) => (
                                      <option key={slot.value} value={slot.value}>
                                        {slot.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              {booking.preferredTime && (
                                <p className="text-xs text-cream-muted mb-3">
                                  Client's preferred time: <span className="text-gold">{booking.preferredTime}</span>
                                </p>
                              )}
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleConfirmBooking(booking.id)}
                                  disabled={!selectedDate}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Confirm Booking
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => {
                                    setConfirmingDate(null)
                                    setSelectedDate('')
                                    setSelectedTime('')
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
                                <Send className="w-4 h-4 mr-1" />
                                Mark Quote Sent
                              </Button>
                            )}
                            {booking.status === 'quote_sent' && (
                              <>
                                <Button size="sm" onClick={() => handleStatusChange(booking.id, 'negotiating')}>
                                  <MessageSquare className="w-4 h-4 mr-1" />
                                  Negotiating
                                </Button>
                                <Button size="sm" onClick={() => handleStatusChange(booking.id, 'pending_deposit')}>
                                  <CreditCard className="w-4 h-4 mr-1" />
                                  Awaiting Deposit
                                </Button>
                              </>
                            )}
                            {booking.status === 'negotiating' && (
                              <Button size="sm" onClick={() => handleStatusChange(booking.id, 'pending_deposit')}>
                                <CreditCard className="w-4 h-4 mr-1" />
                                Awaiting Deposit
                              </Button>
                            )}
                            {booking.status === 'pending_deposit' && confirmingDate !== booking.id && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setConfirmingDate(booking.id)
                                  if (booking.preferredDate) {
                                    setSelectedDate(booking.preferredDate.split('T')[0])
                                  }
                                  if (booking.preferredTime) {
                                    setSelectedTime(booking.preferredTime)
                                  }
                                }}
                              >
                                <Calendar className="w-4 h-4 mr-1" />
                                Confirm & Schedule
                              </Button>
                            )}
                            {booking.status === 'confirmed' && (
                              <Button size="sm" onClick={() => handleStatusChange(booking.id, 'scheduled')}>
                                <Calendar className="w-4 h-4 mr-1" />
                                Mark Scheduled
                              </Button>
                            )}
                            {booking.status === 'scheduled' && (
                              <Button size="sm" onClick={() => handleStatusChange(booking.id, 'in_progress')}>
                                <Play className="w-4 h-4 mr-1" />
                                Start Work
                              </Button>
                            )}
                            {booking.status === 'in_progress' && (
                              <Button size="sm" onClick={() => handleStatusChange(booking.id, 'editing')}>
                                <Package className="w-4 h-4 mr-1" />
                                Move to Editing
                              </Button>
                            )}
                            {booking.status === 'editing' && (
                              <Button size="sm" onClick={() => handleStatusChange(booking.id, 'delivered')}>
                                <Download className="w-4 h-4 mr-1" />
                                Mark Delivered
                              </Button>
                            )}
                            {booking.status === 'delivered' && (
                              <Button size="sm" onClick={() => handleStatusChange(booking.id, 'completed')}>
                                <Star className="w-4 h-4 mr-1" />
                                Mark Complete
                              </Button>
                            )}
                            {['delivered', 'completed'].includes(booking.status) && (
                              <a
                                href={`/api/admin/bookings/${booking.id}/receipt?format=html`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button size="sm" variant="secondary">
                                  <Download className="w-4 h-4 mr-1" />
                                  Download Receipt
                                </Button>
                              </a>
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
