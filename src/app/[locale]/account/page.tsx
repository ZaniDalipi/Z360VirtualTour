'use client'

import { useState, useEffect } from 'react'
import { Link, useRouter } from '@/i18n/routing'
import {
  User,
  Calendar,
  Clock,
  MapPin,
  FileText,
  LogOut,
  Plus,
  Eye,
  ChevronRight,
} from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { PublicHeader, Footer } from '@/components/layout'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface UserData {
  id: string
  email: string
  name: string
  phone: string | null
  company: string | null
  createdAt: string
}

interface Booking {
  id: string
  propertyAddress: string
  propertyCity: string | null
  serviceType: string | null
  status: string
  totalQuote: number | null
  preferredDate: string | null
  createdAt: string
  pricingPlan?: {
    name: string
  }
}

export default function AccountPage() {
  const router = useRouter()
  const t = useTranslations('account')

  const [user, setUser] = useState<UserData | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userRes = await fetch('/api/user/me')
        if (!userRes.ok) {
          // Use i18n router which handles locale automatically
          router.replace('/account/login')
          return
        }
        const userData = await userRes.json()
        setUser(userData.user)

        // Fetch user's bookings
        const bookingsRes = await fetch('/api/user/bookings')
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json()
          setBookings(bookingsData.bookings || [])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        router.replace('/account/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/user/logout', { method: 'POST' })
    router.replace('/')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quote_requested':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'quote_sent':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'confirmed':
      case 'scheduled':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'in_progress':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'completed':
        return 'bg-gold/20 text-gold border-gold/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      quote_requested: t('statusQuoteRequested'),
      quote_sent: t('statusQuoteSent'),
      pending_confirmation: t('statusPendingConfirmation'),
      confirmed: t('statusConfirmed'),
      scheduled: t('statusScheduled'),
      in_progress: t('statusInProgress'),
      completed: t('statusCompleted'),
      cancelled: t('statusCancelled'),
    }
    return labels[status] || status
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy">
        <PublicHeader />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-navy">
      <PublicHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-cream">
                {t('welcomeUser', { name: user.name.split(' ')[0] })}
              </h1>
              <p className="text-cream-muted mt-1">{t('manageBookings')}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/contact">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('newBooking')}
                </Button>
              </Link>
              <Button variant="secondary" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
                  <User className="w-8 h-8 text-gold" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-cream">{user.name}</h2>
                  <p className="text-sm text-cream-muted">{user.email}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {user.phone && (
                  <div className="flex items-center gap-2 text-cream-muted">
                    <span className="font-medium text-cream">{t('phone')}:</span>
                    {user.phone}
                  </div>
                )}
                {user.company && (
                  <div className="flex items-center gap-2 text-cream-muted">
                    <span className="font-medium text-cream">{t('company')}:</span>
                    {user.company}
                  </div>
                )}
                <div className="flex items-center gap-2 text-cream-muted">
                  <span className="font-medium text-cream">{t('memberSince')}:</span>
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Bookings List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-cream mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gold" />
                {t('yourBookings')}
              </h2>

              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-cream-muted mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-cream mb-2">
                    {t('noBookingsYet')}
                  </h3>
                  <p className="text-cream-muted mb-6">
                    {t('noBookingsDescription')}
                  </p>
                  <Link href="/contact">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      {t('requestQuote')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 rounded-xl border border-gold/10 hover:border-gold/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {getStatusLabel(booking.status)}
                            </span>
                            {booking.pricingPlan && (
                              <span className="text-xs text-cream-muted">
                                {booking.pricingPlan.name}
                              </span>
                            )}
                          </div>
                          <h3 className="font-medium text-cream truncate">
                            {booking.propertyAddress}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-cream-muted">
                            {booking.propertyCity && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {booking.propertyCity}
                              </span>
                            )}
                            {booking.preferredDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(booking.preferredDate).toLocaleDateString()}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(booking.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          {booking.totalQuote && (
                            <p className="text-lg font-semibold text-gold">
                              €{booking.totalQuote.toFixed(2)}
                            </p>
                          )}
                          <Link
                            href={`/account/bookings/${booking.id}`}
                            className="inline-flex items-center gap-1 text-sm text-cream-muted hover:text-cream mt-2"
                          >
                            {t('viewDetails')}
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
