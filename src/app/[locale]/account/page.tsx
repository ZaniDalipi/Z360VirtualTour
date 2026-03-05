'use client'

import { useState, useEffect, useMemo } from 'react'
import { Link, useRouter } from '@/i18n/routing'
import {
  User,
  Calendar,
  Clock,
  MapPin,
  FileText,
  LogOut,
  Plus,
  ChevronRight,
  CheckCircle,
  XCircle,
  Hourglass,
  Mail,
  Phone,
  Building2,
  Edit3,
  Eye,
  CreditCard,
  TrendingUp,
  Star,
  Camera,
} from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { PublicHeader, Footer } from '@/components/layout'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'

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

type BookingCategory = 'active' | 'completed' | 'cancelled'

export default function AccountPage() {
  const router = useRouter()
  const t = useTranslations('account')
  const { isAuthenticated, isInitialized, logout } = useAuth()

  const [user, setUser] = useState<UserData | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<BookingCategory>('active')

  // Categorize bookings
  const categorizedBookings = useMemo(() => {
    const active: Booking[] = []
    const completed: Booking[] = []
    const cancelled: Booking[] = []

    bookings.forEach(booking => {
      if (booking.status === 'completed') {
        completed.push(booking)
      } else if (booking.status === 'cancelled') {
        cancelled.push(booking)
      } else {
        // All other statuses (quote_requested, quote_sent, confirmed, scheduled, in_progress)
        active.push(booking)
      }
    })

    return { active, completed, cancelled }
  }, [bookings])

  const filteredBookings = categorizedBookings[activeCategory]

  // Calculate stats
  const stats = useMemo(() => {
    const totalSpent = bookings
      .filter(b => b.status === 'completed' && b.totalQuote)
      .reduce((sum, b) => sum + (b.totalQuote || 0), 0)

    const pendingQuotes = bookings.filter(b =>
      b.status === 'quote_requested' || b.status === 'quote_sent'
    ).length

    return {
      totalBookings: bookings.length,
      completedProjects: categorizedBookings.completed.length,
      activeProjects: categorizedBookings.active.length,
      pendingQuotes,
      totalSpent,
    }
  }, [bookings, categorizedBookings])

  // Calculate profile completion
  const profileCompletion = useMemo(() => {
    if (!user) return 0
    let completed = 0
    const fields = ['name', 'email', 'phone', 'company']
    fields.forEach(field => {
      if (user[field as keyof UserData]) completed++
    })
    return Math.round((completed / fields.length) * 100)
  }, [user])

  // Redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/account/login')
    }
  }, [isAuthenticated, isInitialized, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!isInitialized || !isAuthenticated) return

      try {
        // Fetch user data (with additional fields like createdAt)
        const userRes = await fetch('/api/user/me')
        if (!userRes.ok) {
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
  }, [router, isAuthenticated, isInitialized])

  const handleLogout = async () => {
    await logout()
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

  // Show loading while checking auth or fetching data to prevent flicker
  if (!isInitialized || isLoading || !isAuthenticated) {
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 sm:mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-cream">
                {t('welcomeUser', { name: user.name.split(' ')[0] })}
              </h1>
              <p className="text-sm sm:text-base text-cream-muted mt-1">{t('manageBookings')}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/contact">
                <Button className="text-sm sm:text-base touch-manipulation">
                  <Plus className="w-4 h-4 mr-1.5 sm:mr-2" />
                  {t('newBooking')}
                </Button>
              </Link>
              <Button variant="secondary" onClick={handleLogout} className="text-sm sm:text-base touch-manipulation">
                <LogOut className="w-4 h-4 mr-1.5 sm:mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-6"
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-cream">{stats.totalBookings}</p>
                <p className="text-xs text-cream-muted">{t('totalBookings', { defaultValue: 'Total Bookings' })}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-cream">{stats.completedProjects}</p>
                <p className="text-xs text-cream-muted">{t('completedProjects', { defaultValue: 'Completed' })}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Hourglass className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-cream">{stats.activeProjects}</p>
                <p className="text-xs text-cream-muted">{t('activeProjects', { defaultValue: 'In Progress' })}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gold">€{stats.totalSpent.toFixed(0)}</p>
                <p className="text-xs text-cream-muted">{t('totalSpent', { defaultValue: 'Total Spent' })}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <Card className="p-6">
              {/* Avatar and Name */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-soft flex items-center justify-center text-navy text-xl font-bold">
                      {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-navy flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-cream">{user.name}</h2>
                    <p className="text-sm text-cream-muted">{t('memberSince', { defaultValue: 'Member since' })} {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>

              {/* Profile Completion */}
              <div className="mb-4 p-3 rounded-lg bg-navy-medium border border-gold/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-cream-muted">{t('profileCompletion', { defaultValue: 'Profile Completion' })}</span>
                  <span className="text-xs font-medium text-gold">{profileCompletion}%</span>
                </div>
                <div className="w-full h-2 bg-navy rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold to-gold-soft transition-all duration-500"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                {profileCompletion < 100 && (
                  <p className="text-[10px] text-cream-muted mt-1.5">
                    {!user.phone && t('addPhone', { defaultValue: 'Add phone number' })}
                    {!user.phone && !user.company && ' • '}
                    {!user.company && t('addCompany', { defaultValue: 'Add company name' })}
                  </p>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-gold" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-cream-muted uppercase tracking-wide">{t('email', { defaultValue: 'Email' })}</p>
                    <p className="text-cream truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-gold" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-cream-muted uppercase tracking-wide">{t('phone', { defaultValue: 'Phone' })}</p>
                    <p className={user.phone ? 'text-cream' : 'text-cream-muted italic'}>
                      {user.phone || t('notProvided', { defaultValue: 'Not provided' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-gold" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-cream-muted uppercase tracking-wide">{t('company', { defaultValue: 'Company' })}</p>
                    <p className={user.company ? 'text-cream' : 'text-cream-muted italic'}>
                      {user.company || t('notProvided', { defaultValue: 'Not provided' })}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-4">
              <h3 className="text-sm font-medium text-cream mb-3">{t('quickActions', { defaultValue: 'Quick Actions' })}</h3>
              <div className="space-y-1">
                <Link href="/contact" className="flex items-center gap-3 p-3 min-h-[48px] rounded-xl hover:bg-gold/10 active:bg-gold/15 active:scale-[0.98] transition-all duration-150 group touch-manipulation">
                  <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-gold" />
                  </div>
                  <span className="text-sm text-cream group-hover:text-gold transition-colors">{t('requestNewQuote', { defaultValue: 'Request New Quote' })}</span>
                  <ChevronRight className="w-4 h-4 text-cream-muted ml-auto" />
                </Link>
                <Link href="/tours" className="flex items-center gap-3 p-3 min-h-[48px] rounded-xl hover:bg-gold/10 active:bg-gold/15 active:scale-[0.98] transition-all duration-150 group touch-manipulation">
                  <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-gold" />
                  </div>
                  <span className="text-sm text-cream group-hover:text-gold transition-colors">{t('browseTours', { defaultValue: 'Browse Tours' })}</span>
                  <ChevronRight className="w-4 h-4 text-cream-muted ml-auto" />
                </Link>
                <Link href="/schedule" className="flex items-center gap-3 p-3 min-h-[48px] rounded-xl hover:bg-gold/10 active:bg-gold/15 active:scale-[0.98] transition-all duration-150 group touch-manipulation">
                  <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-gold" />
                  </div>
                  <span className="text-sm text-cream group-hover:text-gold transition-colors">{t('viewSchedule', { defaultValue: 'View Schedule' })}</span>
                  <ChevronRight className="w-4 h-4 text-cream-muted ml-auto" />
                </Link>
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
              <h2 className="text-xl font-semibold text-cream mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gold" />
                {t('yourBookings')}
              </h2>

              {/* Category Tabs */}
              <div className="flex gap-2 mb-4 sm:mb-6 border-b border-gold/10 pb-3 overflow-x-auto scrollbar-hide scroll-momentum -mx-2 px-2">
                <button
                  onClick={() => setActiveCategory('active')}
                  className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap touch-manipulation active:scale-95 active:opacity-80 ${
                    activeCategory === 'active'
                      ? 'bg-gold/20 text-gold'
                      : 'text-cream-muted hover:text-cream hover:bg-gold/10'
                  }`}
                >
                  <Hourglass className="w-4 h-4" />
                  {t('categoryActive', { defaultValue: 'Active' })}
                  {categorizedBookings.active.length > 0 && (
                    <span className="bg-gold/30 text-gold text-xs px-1.5 py-0.5 rounded-full min-w-[22px] text-center">
                      {categorizedBookings.active.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveCategory('completed')}
                  className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap touch-manipulation active:scale-95 active:opacity-80 ${
                    activeCategory === 'completed'
                      ? 'bg-green-500/20 text-green-400'
                      : 'text-cream-muted hover:text-cream hover:bg-gold/10'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  {t('categoryCompleted', { defaultValue: 'Completed' })}
                  {categorizedBookings.completed.length > 0 && (
                    <span className="bg-green-500/30 text-green-400 text-xs px-1.5 py-0.5 rounded-full min-w-[22px] text-center">
                      {categorizedBookings.completed.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveCategory('cancelled')}
                  className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap touch-manipulation active:scale-95 active:opacity-80 ${
                    activeCategory === 'cancelled'
                      ? 'bg-red-500/20 text-red-400'
                      : 'text-cream-muted hover:text-cream hover:bg-gold/10'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  {t('categoryCancelled', { defaultValue: 'Cancelled' })}
                  {categorizedBookings.cancelled.length > 0 && (
                    <span className="bg-red-500/30 text-red-400 text-xs px-1.5 py-0.5 rounded-full min-w-[22px] text-center">
                      {categorizedBookings.cancelled.length}
                    </span>
                  )}
                </button>
              </div>

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
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-cream-muted/10 flex items-center justify-center mx-auto mb-4">
                    {activeCategory === 'active' && <Hourglass className="w-6 h-6 text-cream-muted" />}
                    {activeCategory === 'completed' && <CheckCircle className="w-6 h-6 text-cream-muted" />}
                    {activeCategory === 'cancelled' && <XCircle className="w-6 h-6 text-cream-muted" />}
                  </div>
                  <p className="text-cream-muted">
                    {activeCategory === 'active' && t('noActiveBookings', { defaultValue: 'No active bookings' })}
                    {activeCategory === 'completed' && t('noCompletedBookings', { defaultValue: 'No completed bookings yet' })}
                    {activeCategory === 'cancelled' && t('noCancelledBookings', { defaultValue: 'No cancelled bookings' })}
                  </p>
                  {activeCategory !== 'active' && (
                    <button
                      onClick={() => setActiveCategory('active')}
                      className="text-gold text-sm mt-2 hover:underline"
                    >
                      {t('viewActiveBookings', { defaultValue: 'View active bookings' })}
                    </button>
                  )}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {filteredBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-4 rounded-xl border border-gold/10 hover:border-gold/30 active:bg-navy-medium/50 transition-all duration-150 touch-manipulation"
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
                              className="inline-flex items-center gap-1 text-sm text-cream-muted hover:text-cream active:text-gold mt-2 py-1 touch-manipulation"
                            >
                              {t('viewDetails')}
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
