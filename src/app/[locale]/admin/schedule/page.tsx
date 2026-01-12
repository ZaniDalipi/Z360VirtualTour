'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  CalendarDays, Phone, Mail, MapPin, Clock, Check, ChevronRight,
  User, Building2, AlertCircle, Play, Square, ArrowLeft, Timer,
  RefreshCw, Download, FileText, Share2, X, CheckCircle2, Clipboard,
  Printer
} from 'lucide-react'
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
  preferredTime: string | null
  alternateDate: string | null
  alternateTime: string | null
  deadlineDate: string | null
  confirmedDate: string | null
  confirmedTime: string | null
  totalQuote: number | null
  status: string
  projectDescription: string | null
  createdAt: string
  workStartedAt: string | null
  workEndedAt: string | null
  workDurationMinutes: number | null
}

interface ReceiptData {
  receiptNumber: string
  generatedAt: string
  clientName: string
  clientEmail: string
  clientPhone: string | null
  companyName: string | null
  propertyAddress: string
  propertyCity: string | null
  serviceType: string | null
  workDate: string
  workStartTime: string
  workEndTime: string
  workDurationMinutes: number
  workDurationFormatted: string
  basePrice: number | null
  totalAmount: number | null
  depositAmount: number | null
  depositPaid: boolean
  balanceDue: number | null
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

// Status flow for navigation
const statusFlow = ['confirmed', 'scheduled', 'in_progress', 'completed']

// European date format helper
const formatDateEU = (dateStr: string | null) => {
  if (!dateStr) return null
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const formatFullDateEU = (dateStr: string | null) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const formatTime = (timeStr: string | null) => {
  if (!timeStr) return ''
  return timeStr
}

// Timer component for active work
function WorkTimer({ startTime }: { startTime: string }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = new Date(startTime).getTime()

    const updateElapsed = () => {
      const now = Date.now()
      setElapsed(Math.floor((now - start) / 1000))
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  const hours = Math.floor(elapsed / 3600)
  const minutes = Math.floor((elapsed % 3600) / 60)
  const seconds = elapsed % 60

  return (
    <div className="flex items-center gap-2 text-indigo-400 font-mono text-lg">
      <Timer className="w-5 h-5 animate-pulse" />
      <span>
        {hours.toString().padStart(2, '0')}:
        {minutes.toString().padStart(2, '0')}:
        {seconds.toString().padStart(2, '0')}
      </span>
    </div>
  )
}

// Confirmation Dialog
function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
}: {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'default' | 'warning' | 'success'
}) {
  if (!isOpen) return null

  const variantStyles = {
    default: 'bg-gold hover:bg-gold/90',
    warning: 'bg-orange-500 hover:bg-orange-600',
    success: 'bg-green-600 hover:bg-green-700',
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onCancel}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md pointer-events-auto"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-cream mb-2">{title}</h3>
            <p className="text-cream-muted mb-6">{message}</p>
            <div className="flex gap-3">
              <Button
                className={`flex-1 ${variantStyles[variant]} text-navy`}
                onClick={onConfirm}
              >
                {confirmText}
              </Button>
              <Button variant="secondary" onClick={onCancel}>
                {cancelText}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </>
  )
}

// Work Completion Modal
function WorkCompletionModal({
  isOpen,
  booking,
  onClose,
  onComplete,
}: {
  isOpen: boolean
  booking: ScheduledBooking | null
  onClose: () => void
  onComplete: () => void
}) {
  const [workNotes, setWorkNotes] = useState('')
  const [isCompleting, setIsCompleting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)
  const [copied, setCopied] = useState(false)
  const [currentDuration, setCurrentDuration] = useState(0)
  const receiptRef = useRef<HTMLDivElement>(null)

  // Live duration tracker
  useEffect(() => {
    if (!isOpen || !booking?.workStartedAt) return

    const updateDuration = () => {
      const start = new Date(booking.workStartedAt!).getTime()
      const now = Date.now()
      setCurrentDuration(Math.floor((now - start) / 1000))
    }

    updateDuration()
    const interval = setInterval(updateDuration, 1000)
    return () => clearInterval(interval)
  }, [isOpen, booking?.workStartedAt])

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setWorkNotes('')
      setIsCompleted(false)
      setReceipt(null)
    }
  }, [isOpen])

  if (!isOpen || !booking) return null

  const formatLiveDuration = () => {
    const hours = Math.floor(currentDuration / 3600)
    const minutes = Math.floor((currentDuration % 3600) / 60)
    const seconds = currentDuration % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const formatDurationText = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0) return `${h} hour${h !== 1 ? 's' : ''} ${m} minute${m !== 1 ? 's' : ''}`
    return `${m} minute${m !== 1 ? 's' : ''}`
  }

  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workNotes }),
      })

      if (res.ok) {
        const data = await res.json()
        setReceipt(data.receipt)
        setIsCompleted(true)
      }
    } catch (error) {
      console.error('Failed to complete work:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleDownload = async (format: 'html' | 'text' | 'csv') => {
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/receipt?format=${format}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${receipt?.receiptNumber || 'receipt'}.${format === 'html' ? 'html' : format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download:', error)
    }
  }

  const handlePrint = async () => {
    const res = await fetch(`/api/admin/bookings/${booking.id}/receipt?format=html`)
    const html = await res.text()
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }

  const handleCopyLink = () => {
    const link = `${window.location.origin}/api/admin/bookings/${booking.id}/receipt?format=html`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share && receipt) {
      try {
        await navigator.share({
          title: `Work Report - ${receipt.receiptNumber}`,
          text: `Work completed for ${booking.clientName} at ${booking.propertyAddress}. Duration: ${receipt.workDurationFormatted}`,
          url: `${window.location.origin}/api/admin/bookings/${booking.id}/receipt?format=html`,
        })
      } catch {
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleClose = () => {
    if (isCompleted) {
      onComplete()
    }
    onClose()
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg pointer-events-auto my-8"
        >
          <Card className="overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-navy-light to-navy p-6 text-center">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-cream-muted hover:text-cream"
              >
                <X className="w-5 h-5" />
              </button>

              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </motion.div>
              ) : (
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/20 mb-4">
                  <Timer className="w-10 h-10 text-indigo-400 animate-pulse" />
                </div>
              )}

              <h2 className="text-xl font-bold text-cream">
                {isCompleted ? 'Work Completed!' : 'Complete Work Session'}
              </h2>
              <p className="text-cream-muted text-sm mt-1">
                {booking.clientName} - {booking.propertyCity || booking.propertyAddress}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5" ref={receiptRef}>
              {!isCompleted ? (
                <>
                  {/* Live Timer Display */}
                  <div className="text-center py-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-xs uppercase tracking-wider text-indigo-400 mb-2">Current Duration</p>
                    <p className="text-4xl font-mono font-bold text-indigo-400">
                      {formatLiveDuration()}
                    </p>
                  </div>

                  {/* Job Summary */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-cream-muted">Client</span>
                      <span className="text-cream font-medium">{booking.clientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-cream-muted">Location</span>
                      <span className="text-cream">{booking.propertyCity || booking.propertyAddress}</span>
                    </div>
                    {booking.totalQuote && (
                      <div className="flex justify-between">
                        <span className="text-cream-muted">Quote</span>
                        <span className="text-gold font-semibold">€{booking.totalQuote.toFixed(0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Work Notes */}
                  <div>
                    <label className="block text-sm text-cream-muted mb-2">
                      Work Notes (optional)
                    </label>
                    <textarea
                      value={workNotes}
                      onChange={(e) => setWorkNotes(e.target.value)}
                      placeholder="Add notes about the work completed, any issues, or special details for the receipt..."
                      className="w-full h-24 px-4 py-3 rounded-lg bg-navy/50 border border-gold/20 text-cream placeholder:text-cream-dim resize-none focus:outline-none focus:border-gold/50"
                    />
                  </div>

                  {/* Complete Button */}
                  <Button
                    onClick={handleComplete}
                    disabled={isCompleting}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                  >
                    {isCompleting ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Completing...
                      </>
                    ) : (
                      <>
                        <Square className="w-5 h-5 mr-2" />
                        Stop Timer & Complete Work
                      </>
                    )}
                  </Button>
                </>
              ) : receipt && (
                <>
                  {/* Receipt Summary */}
                  <div className="space-y-4">
                    <div className="text-center p-4 rounded-xl bg-gold/10 border border-gold/20">
                      <p className="text-xs text-gold uppercase tracking-wider mb-1">Receipt Number</p>
                      <p className="text-lg font-mono font-bold text-gold">{receipt.receiptNumber}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-navy/50">
                        <p className="text-xs text-cream-muted uppercase mb-1">Duration</p>
                        <p className="text-lg font-semibold text-cream">{receipt.workDurationFormatted}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-navy/50">
                        <p className="text-xs text-cream-muted uppercase mb-1">Total Amount</p>
                        <p className="text-lg font-semibold text-gold">€{(receipt.totalAmount || 0).toFixed(2)}</p>
                      </div>
                    </div>

                    {receipt.depositAmount && receipt.depositAmount > 0 && (
                      <div className="flex justify-between items-center p-3 rounded-lg bg-navy/30">
                        <div>
                          <span className="text-cream-muted text-sm">Balance Due</span>
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded ${receipt.depositPaid ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                            Deposit {receipt.depositPaid ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                        <span className="text-cream font-semibold">€{(receipt.balanceDue || 0).toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Download & Share Options */}
                  <div className="border-t border-gold/10 pt-5">
                    <p className="text-sm text-cream-muted mb-3">Download & Share Report</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => handleDownload('html')}
                        className="flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        HTML Report
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleDownload('csv')}
                        className="flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        CSV Export
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handlePrint}
                        className="flex items-center justify-center gap-2"
                      >
                        <Printer className="w-4 h-4" />
                        Print
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleShare}
                        className="flex items-center justify-center gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4" />
                            Share
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Done Button */}
                  <Button
                    onClick={handleClose}
                    className="w-full bg-gold hover:bg-gold/90 text-navy py-3"
                  >
                    Done
                  </Button>
                </>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </>
  )
}

export default function SchedulePage() {
  const [bookings, setBookings] = useState<ScheduledBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    bookingId: string
    newStatus: string
    title: string
    message: string
    variant: 'default' | 'warning' | 'success'
  } | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [completionModal, setCompletionModal] = useState<{
    isOpen: boolean
    booking: ScheduledBooking | null
  }>({ isOpen: false, booking: null })

  const fetchScheduledBookings = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    fetchScheduledBookings()
  }, [fetchScheduledBookings])

  const getPreviousStatus = (currentStatus: string): string | null => {
    const currentIndex = statusFlow.indexOf(currentStatus)
    if (currentIndex > 0) {
      return statusFlow[currentIndex - 1]
    }
    return null
  }

  const showStatusConfirmation = (
    bookingId: string,
    newStatus: string,
    isGoingBack = false
  ) => {
    let title = ''
    let message = ''
    let variant: 'default' | 'warning' | 'success' = 'default'

    if (isGoingBack) {
      title = 'Go Back?'
      message = `Are you sure you want to change the status back to "${statusLabels[newStatus] || newStatus}"?`
      variant = 'warning'
    } else {
      switch (newStatus) {
        case 'scheduled':
          title = 'Mark as Scheduled?'
          message = 'This will mark the booking as scheduled and ready for work.'
          break
        case 'in_progress':
          title = 'Start Work?'
          message = 'This will start the work timer. Make sure you are ready to begin.'
          variant = 'warning'
          break
        case 'completed':
          title = 'Complete Work?'
          message = 'This will stop the timer and mark this job as completed. The income will be recorded in finances.'
          variant = 'success'
          break
        default:
          title = 'Change Status?'
          message = `Change status to "${newStatus}"?`
      }
    }

    setConfirmDialog({
      isOpen: true,
      bookingId,
      newStatus,
      title,
      message,
      variant,
    })
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

  const confirmStatusChange = () => {
    if (confirmDialog) {
      handleStatusChange(confirmDialog.bookingId, confirmDialog.newStatus)
      setConfirmDialog(null)
    }
  }

  const syncBundles = async () => {
    setIsSyncing(true)
    try {
      const res = await fetch('/api/admin/bundles/sync', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        alert(`Synced ${data.updates.length} bundle(s)`)
      }
    } catch (error) {
      console.error('Failed to sync bundles:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const isUrgent = (booking: ScheduledBooking) => {
    if (!booking.deadlineDate) return false
    const deadline = new Date(booking.deadlineDate)
    const today = new Date()
    const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 3
  }

  const formatWorkDuration = (minutes: number | null) => {
    if (!minutes) return '-'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
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
      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog?.isOpen && (
          <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmText="Yes, Continue"
            onConfirm={confirmStatusChange}
            onCancel={() => setConfirmDialog(null)}
            variant={confirmDialog.variant}
          />
        )}
      </AnimatePresence>

      {/* Work Completion Modal */}
      <AnimatePresence>
        {completionModal.isOpen && (
          <WorkCompletionModal
            isOpen={completionModal.isOpen}
            booking={completionModal.booking}
            onClose={() => setCompletionModal({ isOpen: false, booking: null })}
            onComplete={() => {
              fetchScheduledBookings()
              setCompletionModal({ isOpen: false, booking: null })
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-h2 font-bold text-cream flex items-center gap-2">
            <CalendarDays className="w-8 h-8 text-gold" />
            My Schedule
          </h1>
          <p className="text-body text-cream-muted">
            Confirmed bookings and upcoming work - {bookings.length} jobs to complete
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={syncBundles}
          disabled={isSyncing}
          className="text-sm"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          Sync Bundles
        </Button>
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
                    {dateKey === 'Unscheduled' ? 'Date TBD' : formatFullDateEU(dateKey)}
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
                      } ${booking.status === 'in_progress' ? 'border-indigo-500/50 bg-indigo-500/5' : ''}`}
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

                            {/* Active timer for in_progress */}
                            {booking.status === 'in_progress' && booking.workStartedAt && (
                              <div className="mb-2">
                                <WorkTimer startTime={booking.workStartedAt} />
                              </div>
                            )}

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
                              {booking.confirmedTime && (
                                <span className="flex items-center gap-1 text-gold">
                                  <Clock className="w-4 h-4" />
                                  {formatTime(booking.confirmedTime)}
                                </span>
                              )}
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

                              {/* Dates - European format */}
                              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                                {booking.confirmedDate && (
                                  <div>
                                    <p className="text-xs text-cream-muted mb-1">Confirmed Date</p>
                                    <p className="text-green-400 font-medium">
                                      {formatDateEU(booking.confirmedDate)}
                                      {booking.confirmedTime && (
                                        <span className="ml-2">at {booking.confirmedTime}</span>
                                      )}
                                    </p>
                                  </div>
                                )}
                                {booking.preferredDate && (
                                  <div>
                                    <p className="text-xs text-cream-muted mb-1">Preferred</p>
                                    <p className="text-cream">
                                      {formatDateEU(booking.preferredDate)}
                                      {booking.preferredTime && (
                                        <span className="ml-2">at {booking.preferredTime}</span>
                                      )}
                                    </p>
                                  </div>
                                )}
                                {booking.deadlineDate && (
                                  <div>
                                    <p className="text-xs text-cream-muted mb-1">Deadline</p>
                                    <p className={`font-medium ${isUrgent(booking) ? 'text-orange-400' : 'text-cream'}`}>
                                      {formatDateEU(booking.deadlineDate)}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Work Duration (if completed previously or in progress) */}
                              {(booking.workDurationMinutes || booking.workStartedAt) && (
                                <div className="flex items-center gap-4 p-3 rounded-lg bg-indigo-500/10">
                                  <Timer className="w-5 h-5 text-indigo-400" />
                                  <div>
                                    <p className="text-xs text-cream-muted">Work Duration</p>
                                    <p className="text-indigo-400 font-medium">
                                      {booking.workDurationMinutes
                                        ? formatWorkDuration(booking.workDurationMinutes)
                                        : 'In progress...'}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Notes */}
                              {booking.projectDescription && (
                                <div>
                                  <p className="text-xs text-cream-muted mb-1">Project Notes</p>
                                  <p className="text-cream text-sm bg-navy/50 rounded-lg p-3">
                                    {booking.projectDescription}
                                  </p>
                                </div>
                              )}

                              {/* Actions with Go Back option */}
                              <div className="flex flex-wrap gap-2 pt-2">
                                {/* Go Back Button */}
                                {getPreviousStatus(booking.status) && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-cream-muted hover:text-cream"
                                    onClick={() =>
                                      showStatusConfirmation(
                                        booking.id,
                                        getPreviousStatus(booking.status)!,
                                        true
                                      )
                                    }
                                  >
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back to {statusLabels[getPreviousStatus(booking.status)!]}
                                  </Button>
                                )}

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

                                {/* Forward Status Buttons */}
                                {booking.status === 'confirmed' && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => showStatusConfirmation(booking.id, 'scheduled')}
                                  >
                                    Mark Scheduled
                                  </Button>
                                )}
                                {booking.status === 'scheduled' && (
                                  <Button
                                    size="sm"
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                    onClick={() => showStatusConfirmation(booking.id, 'in_progress')}
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    Start Work
                                  </Button>
                                )}
                                {booking.status === 'in_progress' && (
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => setCompletionModal({ isOpen: true, booking })}
                                  >
                                    <Square className="w-4 h-4 mr-2" />
                                    Stop & Complete
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
