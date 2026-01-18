'use client'

import { useState, useEffect, useCallback } from 'react'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Calendar, Users, AlertCircle, ChevronRight, Info } from 'lucide-react'
import { PublicHeader, Footer } from '@/components/layout'
import { Button, Card, Input } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

interface PricingPlan {
  id: string
  name: string
  price: number
  description: string
}

interface UrgencyTier {
  id: string
  name: string
  displayName: string
  description: string | null
  minLeadDays: number
  surchargePercent: number
}

interface Bundle {
  id: string
  name: string
  city: string
  startDate: string
  endDate: string
  scheduledDate: string
  spotsRemaining: number
  perPersonTravelFee: number | null
  discountPercent: number
}

interface UserData {
  id: string
  email: string
  name: string
  phone: string | null
  company: string | null
  city: string | null
}

interface QuoteResult {
  basePrice: number
  urgencyTierName: string
  urgencySurchargePercent: number
  urgencySurchargeAmount: number
  travelZoneName: string | null
  travelFee: number
  bundleName: string | null
  bundleDiscount: number
  sameCityDiscount: number
  sameCityDiscountPercent: number
  matchedScheduledCity: string | null
  subtotal: number
  total: number
  depositAmount: number | null
}

export default function ContactPage() {
  const t = useTranslations('contact')
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [urgencyTiers, setUrgencyTiers] = useState<UrgencyTier[]>([])
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [quote, setQuote] = useState<QuoteResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [currentUser, setCurrentUser] = useState<UserData | null>(null)
  const [isUserLoaded, setIsUserLoaded] = useState(false)

  const contactInfo = [
    {
      icon: MapPin,
      label: t('info.location'),
      value: t('info.locationValue'),
      subtext: t('info.locationSubtext'),
    },
    {
      icon: Phone,
      label: t('info.phone'),
      value: '+389 71 967 915',
      subtext: t('info.phoneSubtext'),
    },
    {
      icon: Mail,
      label: t('info.email'),
      value: 'z360virtualtours@gmail.com',
      subtext: t('info.emailSubtext'),
    },
    {
      icon: Clock,
      label: t('info.responseTime'),
      value: t('info.responseTimeValue'),
      subtext: t('info.responseTimeSubtext'),
    },
  ]

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    propertyAddress: '',
    propertyCity: '',
    pricingPlanId: '',
    urgencyTierId: '',
    preferredDate: '',
    preferredTime: '',
    alternateDate: '',
    alternateTime: '',
    deadlineDate: '',
    isUrgent: false,
    bundleId: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Fetch logged-in user data to pre-fill the form
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/me')
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setCurrentUser(data.user)
            // Pre-fill form with user data
            setFormData(prev => ({
              ...prev,
              name: data.user.name || prev.name,
              email: data.user.email || prev.email,
              phone: data.user.phone || prev.phone,
              company: data.user.company || prev.company,
              propertyCity: data.user.city || prev.propertyCity,
            }))
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setIsUserLoaded(true)
      }
    }

    fetchUser()
  }, [])

  // Handle URL parameters for auto-fill from schedule selection
  useEffect(() => {
    if (!isUserLoaded) return  // Wait for user data to load first

    const bundleId = searchParams.get('bundleId')
    const city = searchParams.get('city')
    const date = searchParams.get('date')

    if (bundleId || city || date) {
      setFormData(prev => ({
        ...prev,
        bundleId: bundleId || prev.bundleId,
        propertyCity: city || prev.propertyCity,
        preferredDate: date || prev.preferredDate,
      }))
    }
  }, [searchParams, isUserLoaded])

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pricingRes, availabilityRes, bundlesRes] = await Promise.all([
          fetch('/api/pricing'),
          fetch('/api/availability'),
          fetch('/api/bundles'),
        ])

        if (pricingRes.ok) {
          const data = await pricingRes.json()
          setPricingPlans(data)
        }

        if (availabilityRes.ok) {
          const data = await availabilityRes.json()
          setUrgencyTiers(data.urgencyTiers || [])
        }

        if (bundlesRes.ok) {
          const data = await bundlesRes.json()
          setBundles(data)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }

    fetchData()
  }, [])

  // Calculate quote when relevant fields change
  useEffect(() => {
    const calculateQuote = async () => {
      if (!formData.pricingPlanId) {
        setQuote(null)
        return
      }

      setIsCalculating(true)
      try {
        const res = await fetch('/api/quote/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pricingPlanId: formData.pricingPlanId,
            urgencyTierId: formData.urgencyTierId,
            city: formData.propertyCity,
            bundleId: formData.bundleId,
            preferredDate: formData.preferredDate,  // For bundle date validation
          }),
        })

        if (res.ok) {
          setQuote(await res.json())
        }
      } catch (error) {
        console.error('Failed to calculate quote:', error)
      } finally {
        setIsCalculating(false)
      }
    }

    const debounce = setTimeout(calculateQuote, 500)
    return () => clearTimeout(debounce)
  }, [formData.pricingPlanId, formData.urgencyTierId, formData.propertyCity, formData.bundleId, formData.preferredDate])

  // Auto-fill city and date when bundle is selected
  const handleBundleSelect = (bundle: Bundle) => {
    const isSelected = formData.bundleId === bundle.id
    if (isSelected) {
      // Deselect bundle
      setFormData(prev => ({ ...prev, bundleId: '' }))
    } else {
      // Select bundle and auto-fill city + date
      const bundleDate = bundle.startDate || bundle.scheduledDate
      setFormData(prev => ({
        ...prev,
        bundleId: bundle.id,
        propertyCity: prev.propertyCity || bundle.city,  // Only fill if empty
        preferredDate: prev.preferredDate || bundleDate.split('T')[0],  // Only fill if empty
      }))
    }
  }

  // Check if bundle discount is valid based on city and date
  const isBundleDiscountValid = useCallback((bundle: Bundle) => {
    if (!formData.bundleId || formData.bundleId !== bundle.id) return true

    // Check city match
    const userCity = formData.propertyCity.toLowerCase().trim()
    const bundleCity = bundle.city.toLowerCase().trim()
    const isCityMatch = userCity === bundleCity ||
      userCity.includes(bundleCity) ||
      bundleCity.includes(userCity)

    // Check date match
    let isDateMatch = true
    if (formData.preferredDate) {
      const preferred = new Date(formData.preferredDate)
      const start = new Date(bundle.startDate || bundle.scheduledDate)
      const end = new Date(bundle.endDate || bundle.scheduledDate)
      preferred.setHours(0, 0, 0, 0)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      isDateMatch = preferred >= start && preferred <= end
    }

    return isCityMatch && isDateMatch
  }, [formData.bundleId, formData.propertyCity, formData.preferredDate])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate email
    if (!isValidEmail(formData.email)) {
      alert(t('form.invalidEmail', { defaultValue: 'Please enter a valid email address' }))
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.name,
          clientEmail: formData.email,
          clientPhone: formData.phone,
          companyName: formData.company,
          propertyAddress: formData.propertyAddress,
          propertyCity: formData.propertyCity,
          pricingPlanId: formData.pricingPlanId || null,
          urgencyTierId: formData.urgencyTierId || null,
          preferredDate: formData.preferredDate || null,
          preferredTime: formData.preferredTime || null,
          alternateDate: formData.alternateDate || null,
          alternateTime: formData.alternateTime || null,
          deadlineDate: formData.isUrgent ? formData.deadlineDate : null,
          travelBundleId: formData.bundleId || null,
          projectDescription: formData.message,
        }),
      })

      if (res.ok) {
        setIsSubmitted(true)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to submit booking. Please try again.')
      }
    } catch (error) {
      console.error('Failed to submit form:', error)
      alert('Failed to submit booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedPlan = pricingPlans.find(p => p.id === formData.pricingPlanId)
  const selectedTier = urgencyTiers.find(t => t.id === formData.urgencyTierId)
  const selectedBundle = bundles.find(b => b.id === formData.bundleId)

  // Filter bundles by city if one is selected
  const availableBundles = formData.propertyCity
    ? bundles.filter(b => b.city.toLowerCase().includes(formData.propertyCity.toLowerCase()))
    : bundles

  return (
    <div className="min-h-screen bg-navy">
      <PublicHeader />

      {/* Hero */}
      <section className="relative py-6 landscape:py-4 sm:py-10 md:py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-xl landscape:text-lg sm:text-2xl md:text-3xl lg:text-display font-bold text-cream mb-2 landscape:mb-1 sm:mb-4 md:mb-6">
              {t('heroTitle')} <span className="text-gold">{t('heroTitleHighlight')}</span>
            </h1>
            <p className="text-xs landscape:text-xs sm:text-sm md:text-base text-cream-muted max-w-2xl mx-auto px-2 landscape:hidden sm:landscape:block">
              {t('description')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Booking Form & Info */}
      <section className="py-4 landscape:py-2 sm:py-6 pb-8 landscape:pb-4 sm:pb-12 md:pb-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid landscape:grid-cols-2 md:grid-cols-1 lg:grid-cols-5 gap-4 landscape:gap-3 sm:gap-6 lg:gap-12">
            {/* Contact Info & Quote Preview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-4 landscape:space-y-2 sm:space-y-6 landscape:max-h-[calc(100vh-120px)] landscape:overflow-y-auto landscape:pr-2"
            >
              {/* Quote Preview */}
              {quote && (
                <Card className="p-3 landscape:p-2 sm:p-4 md:p-6 border-gold/30">
                  <h3 className="text-sm landscape:text-xs sm:text-base md:text-lg font-semibold text-gold mb-2 landscape:mb-1 sm:mb-3">{t('quote.title')}</h3>
                  <div className="space-y-2 landscape:space-y-1 sm:space-y-3 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-cream-muted">{t('quote.basePrice')} ({selectedPlan?.name})</span>
                      <span className="text-cream">€{quote.basePrice.toFixed(2)}</span>
                    </div>

                    {quote.urgencySurchargeAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-cream-muted">
                          {quote.urgencyTierName} (+{quote.urgencySurchargePercent}%)
                        </span>
                        <span className="text-orange-400">+€{quote.urgencySurchargeAmount.toFixed(2)}</span>
                      </div>
                    )}

                    {quote.travelFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-cream-muted">{t('quote.travel')} ({quote.travelZoneName})</span>
                        <span className="text-cream">+€{quote.travelFee.toFixed(2)}</span>
                      </div>
                    )}

                    {quote.bundleDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-cream-muted">{t('quote.bundleDiscount')}</span>
                        <span className="text-green-400">-€{quote.bundleDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    {quote.sameCityDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-cream-muted">
                          {t('quote.sameCityDiscount', { defaultValue: 'Same City Discount' })} ({quote.sameCityDiscountPercent}%)
                        </span>
                        <span className="text-green-400">-€{quote.sameCityDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    {quote.travelZoneName === 'Same City (Free)' && (
                      <div className="flex justify-between">
                        <span className="text-cream-muted">{t('quote.travel', { defaultValue: 'Travel' })}</span>
                        <span className="text-green-400">{t('quote.free', { defaultValue: 'Free' })}</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-2 landscape:pt-1 sm:pt-3 border-t border-gold/20">
                      <span className="text-cream font-medium text-xs sm:text-sm">{t('quote.estimatedTotal')}</span>
                      <span className="text-gold text-base landscape:text-sm sm:text-xl font-bold">€{quote.total.toFixed(2)}</span>
                    </div>

                    {quote.depositAmount && (
                      <div className="flex justify-between text-cream-muted text-xs">
                        <span>{t('quote.depositRequired')}</span>
                        <span>€{quote.depositAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-cream-muted mt-2 landscape:mt-1 sm:mt-4 landscape:hidden sm:landscape:block">
                    {t('quote.finalPriceNote')}
                  </p>
                </Card>
              )}

              {/* Available Bundles */}
              {availableBundles.length > 0 && (
                <Card className="p-3 landscape:p-2 sm:p-4 md:p-6">
                  <h3 className="text-sm landscape:text-xs sm:text-base md:text-lg font-semibold text-cream mb-2 landscape:mb-1 sm:mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gold flex-shrink-0" />
                    {t('bundles.title')}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-cream-muted mb-2 landscape:mb-1 sm:mb-3 landscape:hidden sm:landscape:block">
                    {t('bundles.description')}
                  </p>
                  <div className="space-y-2 landscape:space-y-1 sm:space-y-3">
                    {availableBundles.slice(0, 3).map((bundle) => {
                      const isSelected = formData.bundleId === bundle.id
                      const isValid = isBundleDiscountValid(bundle)
                      return (
                        <div key={bundle.id}>
                          <button
                            type="button"
                            onClick={() => handleBundleSelect(bundle)}
                            className={`w-full p-2.5 landscape:p-2 sm:p-3 rounded-lg text-left transition-all min-h-[44px] active:scale-[0.98] ${
                              isSelected
                                ? isValid
                                  ? 'bg-gold/20 border border-gold'
                                  : 'bg-orange-500/10 border border-orange-500/50'
                                : 'bg-navy-medium border border-gold/10 hover:border-gold/30 active:bg-gold/10'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-cream text-xs sm:text-sm truncate">{bundle.name}</p>
                                <p className="text-[10px] sm:text-xs text-cream-muted">{bundle.city}</p>
                              </div>
                              <span className={`text-[10px] sm:text-xs font-medium ml-2 flex-shrink-0 ${isSelected && !isValid ? 'text-orange-400 line-through' : 'text-green-400'}`}>
                                {bundle.discountPercent}% {t('bundles.off')}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mt-1 sm:mt-2">
                              <span className="text-[10px] sm:text-xs text-cream-muted">
                                {new Date(bundle.startDate || bundle.scheduledDate).toLocaleDateString()}
                                {bundle.endDate && bundle.endDate !== bundle.startDate && (
                                  <> - {new Date(bundle.endDate).toLocaleDateString()}</>
                                )}
                              </span>
                              <span className="text-[10px] sm:text-xs text-cream-muted">
                                {bundle.spotsRemaining} {t('bundles.spotsLeft')}
                              </span>
                            </div>
                          </button>
                          {/* Validation warning for selected bundle */}
                          {isSelected && !isValid && (
                            <div className="mt-1.5 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-start gap-1.5">
                              <Info className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                              <p className="text-[10px] sm:text-xs text-orange-400">
                                {t('bundles.discountNotValid', { defaultValue: 'Discount not applicable: City or date doesn\'t match the bundle. You still get shared travel pricing.' })}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )}

              {/* Contact Info - Hidden in landscape on small screens to save space */}
              <div className="space-y-2 sm:space-y-3 landscape:hidden sm:landscape:block">
                <h3 className="text-sm sm:text-base font-semibold text-cream">{t('contactInfo')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3">
                  {contactInfo.map((info) => {
                    const Icon = info.icon
                    return (
                      <Card key={info.label} className="p-2.5 sm:p-3 md:p-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] sm:text-[10px] text-cream-muted">{info.label}</p>
                            <p className="text-[10px] sm:text-xs font-semibold text-cream break-words leading-tight">{info.value}</p>
                            <p className="text-[9px] sm:text-[10px] text-cream-muted hidden sm:block">{info.subtext}</p>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </motion.div>

            {/* Booking Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3 landscape:max-h-[calc(100vh-120px)] landscape:overflow-y-auto"
            >
              <Card className="p-3 landscape:p-3 sm:p-5 md:p-6 lg:p-8">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-h3 font-bold text-cream mb-2">
                      {t('success.title')}
                    </h3>
                    <p className="text-body text-cream-muted mb-6">
                      {t('success.message')}
                    </p>
                    {quote && (
                      <p className="text-gold font-semibold mb-6">
                        {t('success.estimatedTotal')}: €{quote.total.toFixed(2)}
                      </p>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsSubmitted(false)
                        setFormData({
                          name: '',
                          email: '',
                          phone: '',
                          company: '',
                          propertyAddress: '',
                          propertyCity: '',
                          pricingPlanId: '',
                          urgencyTierId: '',
                          preferredDate: '',
                          preferredTime: '',
                          alternateDate: '',
                          alternateTime: '',
                          deadlineDate: '',
                          isUrgent: false,
                          bundleId: '',
                          message: '',
                        })
                        setQuote(null)
                      }}
                    >
                      {t('success.submitAnother')}
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3 landscape:space-y-2 sm:space-y-4 md:space-y-6">
                    {/* Contact Info */}
                    <div>
                      <h3 className="text-sm landscape:text-xs sm:text-base font-semibold text-cream mb-2 landscape:mb-1.5 sm:mb-3">{t('form.yourInfo')}</h3>
                      <div className="grid grid-cols-2 gap-2 landscape:gap-1.5 sm:gap-3">
                        <div>
                          <label className="block text-xs landscape:text-[10px] sm:text-sm font-medium text-cream mb-1 sm:mb-1.5">
                            {t('form.name')} *
                          </label>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t('form.namePlaceholder')}
                            required
                            className="text-sm landscape:text-xs h-10 landscape:h-9 sm:h-11"
                          />
                        </div>
                        <div>
                          <label className="block text-xs landscape:text-[10px] sm:text-sm font-medium text-cream mb-1 sm:mb-1.5">
                            {t('form.email')} *
                          </label>
                          <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t('form.emailPlaceholder')}
                            required
                            className="text-sm landscape:text-xs h-10 landscape:h-9 sm:h-11"
                          />
                        </div>
                        <div>
                          <label className="block text-xs landscape:text-[10px] sm:text-sm font-medium text-cream mb-1 sm:mb-1.5">
                            {t('form.phone')} *
                          </label>
                          <Input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder={t('form.phonePlaceholder')}
                            required
                            className="text-sm landscape:text-xs h-10 landscape:h-9 sm:h-11"
                          />
                          <p className="text-[10px] sm:text-xs text-cream-muted mt-0.5 hidden sm:block">
                            {t('form.phoneNote')}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs landscape:text-[10px] sm:text-sm font-medium text-cream mb-1 sm:mb-1.5">
                            {t('form.company')}
                          </label>
                          <Input
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder={t('form.companyPlaceholder')}
                            className="text-sm landscape:text-xs h-10 landscape:h-9 sm:h-11"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Property Location */}
                    <div>
                      <h3 className="text-sm landscape:text-xs sm:text-base font-semibold text-cream mb-2 landscape:mb-1.5 sm:mb-3">{t('form.propertyLocation')}</h3>
                      <div className="grid grid-cols-2 gap-2 landscape:gap-1.5 sm:gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs landscape:text-[10px] sm:text-sm font-medium text-cream mb-1 sm:mb-1.5">
                            {t('form.propertyAddress')} *
                          </label>
                          <Input
                            name="propertyAddress"
                            value={formData.propertyAddress}
                            onChange={handleChange}
                            placeholder={t('form.addressPlaceholder')}
                            required
                            className="text-sm landscape:text-xs h-10 landscape:h-9 sm:h-11"
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-xs landscape:text-[10px] sm:text-sm font-medium text-cream mb-1 sm:mb-1.5">
                            {t('form.city')} *
                          </label>
                          <Input
                            name="propertyCity"
                            value={formData.propertyCity}
                            onChange={handleChange}
                            placeholder={t('form.cityPlaceholder')}
                            required
                            className="text-sm landscape:text-xs h-10 landscape:h-9 sm:h-11"
                          />
                          <p className="text-[10px] sm:text-xs text-cream-muted mt-0.5 hidden sm:block">
                            {t('form.cityNote')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Service Selection */}
                    <div>
                      <h3 className="text-sm landscape:text-xs sm:text-base font-semibold text-cream mb-2 landscape:mb-1.5 sm:mb-3">{t('form.servicePackage')}</h3>
                      {/* Horizontal scroll on mobile, grid on larger screens */}
                      <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0 sm:gap-3">
                        {pricingPlans.map((plan) => (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, pricingPlanId: plan.id })}
                            className={`flex-shrink-0 w-[140px] landscape:w-[120px] sm:w-auto p-2.5 landscape:p-2 sm:p-3 rounded-lg text-left transition-all snap-start min-h-[60px] active:scale-[0.98] ${
                              formData.pricingPlanId === plan.id
                                ? 'bg-gold/20 border-2 border-gold'
                                : 'bg-navy-medium border border-gold/10 hover:border-gold/30 active:bg-gold/10'
                            }`}
                          >
                            <p className="text-xs landscape:text-[11px] sm:text-sm font-semibold text-cream truncate">{plan.name}</p>
                            <p className="text-gold text-sm landscape:text-xs sm:text-base font-bold">€{plan.price}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scheduling */}
                    <div>
                      <h3 className="text-sm landscape:text-xs sm:text-base font-semibold text-cream mb-2 landscape:mb-1.5 sm:mb-3">{t('form.scheduling')}</h3>

                      {/* Urgency Selection - Horizontal scroll on mobile */}
                      <div className="mb-2 landscape:mb-1.5 sm:mb-3">
                        <label className="block text-xs landscape:text-[10px] sm:text-sm font-medium text-cream mb-1.5 sm:mb-2">
                          {t('form.deliverySpeed')}
                        </label>
                        <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0 sm:gap-3">
                          {urgencyTiers.map((tier) => (
                            <button
                              key={tier.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, urgencyTierId: tier.id })}
                              className={`flex-shrink-0 w-[150px] landscape:w-[130px] sm:w-auto p-2 landscape:p-1.5 sm:p-3 rounded-lg text-left transition-all snap-start min-h-[50px] active:scale-[0.98] ${
                                formData.urgencyTierId === tier.id
                                  ? 'bg-gold/20 border-2 border-gold'
                                  : 'bg-navy-medium border border-gold/10 hover:border-gold/30 active:bg-gold/10'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-1">
                                <p className="font-medium text-cream text-[11px] landscape:text-[10px] sm:text-sm">{tier.displayName}</p>
                                {tier.surchargePercent > 0 && (
                                  <span className="text-orange-400 text-[9px] sm:text-xs flex-shrink-0">+{tier.surchargePercent}%</span>
                                )}
                              </div>
                              <p className="text-[9px] landscape:text-[8px] sm:text-xs text-cream-muted mt-0.5 line-clamp-2">{tier.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Dates and Times */}
                      <div className="grid grid-cols-2 gap-2 landscape:gap-1.5 sm:gap-3">
                        <div>
                          <label className="block text-xs landscape:text-[10px] sm:text-sm font-medium text-cream mb-1 sm:mb-1.5">
                            {t('form.preferredDate')}
                          </label>
                          <div className="flex flex-col landscape:flex-row sm:flex-row gap-1.5 sm:gap-2">
                            <Input
                              type="date"
                              name="preferredDate"
                              value={formData.preferredDate}
                              onChange={handleChange}
                              className="text-xs sm:text-sm h-9 landscape:h-8 sm:h-10 flex-1"
                            />
                            <Input
                              type="time"
                              name="preferredTime"
                              value={formData.preferredTime}
                              onChange={handleChange}
                              placeholder={t('form.time', { defaultValue: 'Time' })}
                              className="text-xs sm:text-sm h-9 landscape:h-8 sm:h-10 landscape:w-20 sm:w-auto"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs landscape:text-[10px] sm:text-sm font-medium text-cream mb-1 sm:mb-1.5">
                            {t('form.alternateDate')}
                          </label>
                          <div className="flex flex-col landscape:flex-row sm:flex-row gap-1.5 sm:gap-2">
                            <Input
                              type="date"
                              name="alternateDate"
                              value={formData.alternateDate}
                              onChange={handleChange}
                              className="text-xs sm:text-sm h-9 landscape:h-8 sm:h-10 flex-1"
                            />
                            <Input
                              type="time"
                              name="alternateTime"
                              value={formData.alternateTime}
                              onChange={handleChange}
                              placeholder={t('form.time', { defaultValue: 'Time' })}
                              className="text-xs sm:text-sm h-9 landscape:h-8 sm:h-10 landscape:w-20 sm:w-auto"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Urgent Checkbox */}
                      <div className="mt-2 landscape:mt-1.5 sm:mt-3">
                        <label className="flex items-center gap-2 cursor-pointer min-h-[44px] sm:min-h-0">
                          <input
                            type="checkbox"
                            name="isUrgent"
                            checked={formData.isUrgent}
                            onChange={handleChange}
                            className="w-5 h-5 sm:w-4 sm:h-4 rounded border-gold/20 bg-navy text-gold focus:ring-gold/50"
                          />
                          <span className="text-xs sm:text-sm text-cream">
                            {t('form.deadlineCheckbox')}
                          </span>
                        </label>

                        <AnimatePresence>
                          {formData.isUrgent && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2"
                            >
                              <div className="flex items-start gap-2 p-2 sm:p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm text-cream">
                                    {t('form.rushWarning')}
                                  </p>
                                  <div className="mt-1.5 sm:mt-2">
                                    <label className="block text-[10px] sm:text-xs text-cream-muted mb-1">
                                      {t('form.mustCompleteBy')}
                                    </label>
                                    <Input
                                      type="date"
                                      name="deadlineDate"
                                      value={formData.deadlineDate}
                                      onChange={handleChange}
                                      className="max-w-[180px] sm:max-w-[200px] h-9 sm:h-10 text-xs sm:text-sm"
                                    />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div>
                      <label className="block text-xs landscape:text-[10px] sm:text-sm font-medium text-cream mb-1 sm:mb-2">
                        {t('form.projectDetails')}
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder={t('form.projectPlaceholder')}
                        rows={3}
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl bg-navy border border-gold/20 text-cream text-xs sm:text-sm
                                   placeholder:text-cream-muted focus:outline-none focus:ring-2
                                   focus:ring-gold/50 focus:border-gold/50 resize-none landscape:rows-2"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full min-h-[48px] landscape:min-h-[40px] sm:min-h-[52px] text-sm sm:text-base active:scale-[0.98]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-navy border-t-transparent rounded-full animate-spin mr-2" />
                          {t('form.submitting')}
                        </>
                      ) : (
                        <>
                          {t('form.submit')}
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-[10px] sm:text-sm text-cream-muted text-center">
                      {t('form.quoteNote')}
                    </p>
                  </form>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
