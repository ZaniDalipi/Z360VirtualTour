'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Percent,
  CheckCircle,
  XCircle,
  Info,
  Users,
  AlertTriangle,
  Zap,
} from 'lucide-react'
import { PublicHeader, Footer } from '@/components/layout'
import { Button, Card } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'

interface ScheduleDay {
  date: string
  cities: string[]
}

interface BlockedDate {
  date: string
  reason: string
}

interface Bundle {
  id: string
  name: string
  city: string
  region: string | null
  startDate: string
  endDate: string
  dates: string[]
  scheduledDate: string
  maxParticipants: number
  currentCount: number
  spotsRemaining: number
  isFull: boolean
  discountPercent: number
  perPersonTravelFee: number | null
  description: string | null
  registrationDeadline: string | null
  status: string
}

interface SelectedDay {
  date: Date
  dateStr: string
  cities: string[]
  isBlocked: boolean
  blockReason?: string
  bundles: Bundle[]
}

const formatDateStr = (year: number, month: number, day: number): string => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const getTodayStr = (): string => {
  const now = new Date()
  return formatDateStr(now.getFullYear(), now.getMonth(), now.getDate())
}

export default function SchedulePage() {
  const t = useTranslations('schedule')

  const DAYS = [
    t('days.sun'), t('days.mon'), t('days.tue'), t('days.wed'),
    t('days.thu'), t('days.fri'), t('days.sat')
  ]

  const MONTHS = [
    t('months.january'), t('months.february'), t('months.march'),
    t('months.april'), t('months.may'), t('months.june'),
    t('months.july'), t('months.august'), t('months.september'),
    t('months.october'), t('months.november'), t('months.december')
  ]

  const [currentDate, setCurrentDate] = useState(new Date())
  const [schedule, setSchedule] = useState<ScheduleDay[]>([])
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sameCityDiscountPercent, setSameCityDiscountPercent] = useState(15)

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()
  const todayStr = getTodayStr()

  useEffect(() => {
    fetchSchedule()
  }, [currentMonth, currentYear])

  const fetchSchedule = async () => {
    setIsLoading(true)
    try {
      const startDate = new Date(currentYear, currentMonth, 1)
      const endDate = new Date(currentYear, currentMonth + 2, 0)

      const res = await fetch(
        `/api/public/schedule?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      )
      if (res.ok) {
        const data = await res.json()
        setSchedule(data.schedule || [])
        setBlockedDates(data.blockedDates || [])
        setBundles(data.bundles || [])
        if (data.settings?.sameCityDiscountPercent) {
          setSameCityDiscountPercent(data.settings.sameCityDiscountPercent)
        }
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
    setSelectedDay(null)
  }

  const getDateInfo = (day: number) => {
    const dateStr = formatDateStr(currentYear, currentMonth, day)
    const scheduleDay = schedule.find((s) => s.date === dateStr)
    const blockedDay = blockedDates.find((b) => b.date === dateStr)
    const dayBundles = bundles.filter((b) => b.dates.includes(dateStr))

    return {
      dateStr,
      hasSchedule: !!scheduleDay,
      cities: scheduleDay?.cities || [],
      isBlocked: !!blockedDay,
      blockReason: blockedDay?.reason,
      bundles: dayBundles,
      hasBundle: dayBundles.length > 0,
    }
  }

  const handleDayClick = (day: number) => {
    const info = getDateInfo(day)
    const date = new Date(currentYear, currentMonth, day)

    if (info.dateStr < todayStr) return

    setSelectedDay({
      date,
      dateStr: info.dateStr,
      cities: info.cities,
      isBlocked: info.isBlocked,
      blockReason: info.blockReason,
      bundles: info.bundles,
    })
  }

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 sm:h-16 md:h-20" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const info = getDateInfo(day)
      const isPast = info.dateStr < todayStr
      const isToday = info.dateStr === todayStr
      const isSelected = selectedDay?.dateStr === info.dateStr

      days.push(
        <motion.button
          key={day}
          onClick={() => handleDayClick(day)}
          disabled={isPast}
          whileHover={!isPast ? { scale: 1.05 } : undefined}
          whileTap={!isPast ? { scale: 0.95 } : undefined}
          className={`
            relative h-12 sm:h-16 md:h-20 rounded-xl border transition-all duration-200
            flex flex-col items-center justify-center gap-0.5 sm:gap-1
            ${isPast ? 'opacity-40 cursor-not-allowed bg-navy-dark/50 border-transparent' : 'cursor-pointer'}
            ${isToday ? 'ring-2 ring-gold ring-offset-2 ring-offset-navy' : ''}
            ${isSelected ? 'bg-gold text-navy border-gold' : ''}
            ${!isSelected && !isPast && info.isBlocked ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50' : ''}
            ${!isSelected && !isPast && info.hasBundle ? 'bg-purple-500/10 border-purple-500/30 hover:border-purple-500/50' : ''}
            ${!isSelected && !isPast && info.hasSchedule && !info.isBlocked && !info.hasBundle ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50' : ''}
            ${!isSelected && !isPast && !info.hasSchedule && !info.isBlocked && !info.hasBundle ? 'bg-navy-dark/30 border-gold/10 hover:border-gold/30 hover:bg-navy-dark/50' : ''}
          `}
        >
          <span className={`text-sm sm:text-base font-semibold ${isSelected ? 'text-navy' : 'text-cream'}`}>
            {day}
          </span>
          {info.hasBundle && !info.isBlocked && (
            <div className="flex items-center gap-0.5">
              <Users className={`w-3 h-3 ${isSelected ? 'text-navy' : 'text-purple-400'}`} />
              <span className={`text-[10px] sm:text-xs ${isSelected ? 'text-navy' : 'text-purple-400'} hidden sm:inline`}>
                {t('bundle')}
              </span>
            </div>
          )}
          {info.hasSchedule && !info.isBlocked && !info.hasBundle && (
            <div className="flex items-center gap-0.5">
              <MapPin className={`w-3 h-3 ${isSelected ? 'text-navy' : 'text-green-400'}`} />
              <span className={`text-[10px] sm:text-xs ${isSelected ? 'text-navy' : 'text-green-400'} hidden sm:inline`}>
                {info.cities.length} {info.cities.length === 1 ? t('city') : t('cities')}
              </span>
            </div>
          )}
          {info.isBlocked && (
            <XCircle className={`w-3 h-3 ${isSelected ? 'text-navy' : 'text-red-400'}`} />
          )}
        </motion.button>
      )
    }

    return days
  }

  return (
    <div className="min-h-screen bg-navy">
      <PublicHeader />

      {/* Hero Section */}
      <section className="bg-navy-dark py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold mb-6">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">{t('badge')}</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-cream mb-4">
              {t('title')}
            </h1>
            <p className="text-lg text-cream-muted max-w-2xl mx-auto mb-6">
              {t('description')}
            </p>

            {/* Discount Banner */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Percent className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-green-400 font-semibold">{t('sameCityDiscount', { percent: sameCityDiscountPercent })}</p>
                <p className="text-green-400/70 text-sm">{t('bookInArea')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Legend */}
      <section className="py-6 border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500/20 border border-purple-500/30" />
              <span className="text-sm text-cream-muted">{t('legend.groupBundle')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30" />
              <span className="text-sm text-cream-muted">{t('legend.scheduledWork')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/30" />
              <span className="text-sm text-cream-muted">{t('legend.unavailable')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-navy-dark/50 border border-gold/10" />
              <span className="text-sm text-cream-muted">{t('legend.available')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded ring-2 ring-gold ring-offset-1 ring-offset-navy" />
              <span className="text-sm text-cream-muted">{t('legend.today')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Card className="p-4 sm:p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 rounded-lg bg-navy hover:bg-gold/10 text-cream-muted hover:text-gold transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl sm:text-2xl font-bold text-cream">
                    {MONTHS[currentMonth]} {currentYear}
                  </h2>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 rounded-lg bg-navy hover:bg-gold/10 text-cream-muted hover:text-gold transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="h-8 flex items-center justify-center text-xs sm:text-sm font-medium text-cream-muted"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                {isLoading ? (
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-12 sm:h-16 md:h-20 rounded-xl bg-navy-dark/30 animate-pulse"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {renderCalendarDays()}
                  </div>
                )}
              </Card>
            </div>

            {/* Selected Day Info */}
            <div className="lg:col-span-1">
              <AnimatePresence mode="wait">
                {selectedDay ? (
                  <motion.div
                    key={selectedDay.dateStr}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Card className="p-6 sticky top-24">
                      <h3 className="text-lg font-semibold text-cream mb-2">
                        {formatSelectedDate(selectedDay.date)}
                      </h3>

                      {selectedDay.isBlocked ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                            <XCircle className="w-6 h-6 text-red-400" />
                            <div>
                              <p className="text-red-400 font-medium">{t('unavailableTitle')}</p>
                              <p className="text-red-400/70 text-sm">{selectedDay.blockReason}</p>
                            </div>
                          </div>
                          <p className="text-cream-muted text-sm">
                            {t('unavailableDesc')}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Bundles Section */}
                          {selectedDay.bundles.length > 0 && (
                            <div className="space-y-3">
                              {selectedDay.bundles.map((bundle) => (
                                <div
                                  key={bundle.id}
                                  className={`p-4 rounded-xl border ${
                                    bundle.isFull
                                      ? 'bg-orange-500/10 border-orange-500/30'
                                      : 'bg-purple-500/10 border-purple-500/30'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Users className={`w-5 h-5 ${bundle.isFull ? 'text-orange-400' : 'text-purple-400'}`} />
                                      <span className={`font-semibold ${bundle.isFull ? 'text-orange-400' : 'text-purple-400'}`}>
                                        {bundle.name}
                                      </span>
                                    </div>
                                    {bundle.isFull ? (
                                      <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">
                                        {t('full')}
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                                        {bundle.discountPercent}% {t('off')}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2 text-sm text-cream-muted mb-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{bundle.city}{bundle.region ? `, ${bundle.region}` : ''}</span>
                                  </div>

                                  <div className="flex items-center gap-2 text-sm text-cream-muted mb-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      {bundle.startDate === bundle.endDate
                                        ? bundle.startDate
                                        : `${bundle.startDate} to ${bundle.endDate}`}
                                    </span>
                                  </div>

                                  {bundle.description && (
                                    <p className="text-sm text-cream-muted mb-3">{bundle.description}</p>
                                  )}

                                  <div className="flex items-center justify-between text-sm mb-3">
                                    <span className="text-cream-muted">
                                      {bundle.isFull ? t('noSpotsAvailable') : t('spotsLeft', { count: bundle.spotsRemaining })}
                                    </span>
                                    {bundle.perPersonTravelFee && (
                                      <span className="text-cream">
                                        {t('travelPerPerson', { amount: bundle.perPersonTravelFee })}
                                      </span>
                                    )}
                                  </div>

                                  {bundle.isFull ? (
                                    <div className="space-y-2">
                                      <div className="flex items-start gap-2 p-2 rounded-lg bg-orange-500/10">
                                        <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-orange-300">
                                          {t('bundleFull', { halfPercent: bundle.discountPercent / 2, fullPercent: bundle.discountPercent })}
                                        </p>
                                      </div>
                                      <Link href={`/contact?date=${selectedDay.dateStr}&cities=${bundle.city}&bundleId=${bundle.id}&emergency=true&discountPercent=${bundle.discountPercent / 2}`}>
                                        <Button variant="secondary" className="w-full" size="sm">
                                          <Zap className="w-4 h-4 mr-2" />
                                          {t('emergencyRequest', { percent: bundle.discountPercent / 2 })}
                                        </Button>
                                      </Link>
                                    </div>
                                  ) : (
                                    <Link href={`/contact?date=${selectedDay.dateStr}&cities=${bundle.city}&bundleId=${bundle.id}&discountPercent=${bundle.discountPercent}`}>
                                      <Button className="w-full" size="sm">
                                        {t('joinBundle', { percent: bundle.discountPercent })}
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Scheduled Cities Section */}
                          {selectedDay.cities.length > 0 && (
                            <>
                              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                <div className="flex items-center gap-2 mb-3">
                                  <MapPin className="w-5 h-5 text-green-400" />
                                  <span className="text-green-400 font-medium">
                                    {t('scheduledIn')}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {selectedDay.cities.map((city) => (
                                    <span
                                      key={city}
                                      className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 text-sm font-medium"
                                    >
                                      {city}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Discount Info */}
                              <div className="p-4 rounded-xl bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/20">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                                    <Percent className="w-5 h-5 text-gold" />
                                  </div>
                                  <div>
                                    <p className="text-gold font-semibold">{t('discountAvailable', { percent: sameCityDiscountPercent })}</p>
                                    <p className="text-cream-muted text-sm mt-1">
                                      {t('discountDesc', { cities: selectedDay.cities.join(' or '), percent: sameCityDiscountPercent })}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <Link href={`/contact?date=${selectedDay.dateStr}&cities=${selectedDay.cities.join(',')}&discountPercent=${sameCityDiscountPercent}`}>
                                <Button className="w-full">
                                  {t('bookThisDate')}
                                </Button>
                              </Link>
                            </>
                          )}

                          {/* Available Day (no schedule, no bundles) */}
                          {selectedDay.cities.length === 0 && selectedDay.bundles.length === 0 && (
                            <>
                              <div className="flex items-center gap-3 p-4 rounded-xl bg-navy border border-gold/20">
                                <CheckCircle className="w-6 h-6 text-gold" />
                                <div>
                                  <p className="text-cream font-medium">{t('availableTitle')}</p>
                                  <p className="text-cream-muted text-sm">{t('availableDesc')}</p>
                                </div>
                              </div>

                              <Link href={`/contact?date=${selectedDay.dateStr}`}>
                                <Button className="w-full">
                                  {t('requestThisDate')}
                                </Button>
                              </Link>
                            </>
                          )}
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Card className="p-6">
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                          <Calendar className="w-8 h-8 text-gold" />
                        </div>
                        <h3 className="text-lg font-semibold text-cream mb-2">
                          {t('selectDate')}
                        </h3>
                        <p className="text-cream-muted text-sm">
                          {t('selectDateDesc')}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upcoming Bundles List */}
              {bundles.length > 0 && (
                <Card className="p-4 mt-4">
                  <h4 className="text-sm font-semibold text-cream mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    {t('upcomingBundles')}
                  </h4>
                  <div className="space-y-2">
                    {bundles.slice(0, 3).map((bundle) => (
                      <div
                        key={bundle.id}
                        className={`p-3 rounded-lg ${
                          bundle.isFull ? 'bg-orange-500/10' : 'bg-purple-500/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-cream">{bundle.city}</span>
                          {bundle.isFull ? (
                            <span className="text-xs text-orange-400">{t('full')}</span>
                          ) : (
                            <span className="text-xs text-purple-400">{bundle.discountPercent}% {t('off')}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-cream-muted">
                          <span>
                            {bundle.startDate === bundle.endDate
                              ? bundle.startDate
                              : `${bundle.startDate} - ${bundle.endDate}`}
                          </span>
                          <span>{bundle.isFull ? t('emergencyOnly') : `${bundle.spotsRemaining} ${t('spots')}`}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Info Box */}
              <Card className="p-4 mt-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-cream-muted">
                    <p className="font-medium text-cream mb-1">{t('howItWorks')}</p>
                    <ul className="space-y-1">
                      <li>• {t('howItWorksItems.purple')}</li>
                      <li>• {t('howItWorksItems.green')}</li>
                      <li>• {t('howItWorksItems.discount', { percent: sameCityDiscountPercent })}</li>
                      <li>• {t('howItWorksItems.emergency')}</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-navy-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-cream mb-4">
            {t('dontSeeDate')}
          </h2>
          <p className="text-cream-muted mb-8">
            {t('dontSeeDateDesc')}
          </p>
          <Link href="/contact">
            <Button size="lg">{t('getInTouch')}</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
