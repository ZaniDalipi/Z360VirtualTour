'use client'

import { useState, useEffect } from 'react'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Calendar, Users, AlertCircle, ChevronRight } from 'lucide-react'
import { PublicHeader, Footer } from '@/components/layout'
import { Button, Card, Input } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'

const contactInfo = [
  {
    icon: MapPin,
    label: 'Location',
    value: 'Balkans',
    subtext: 'Available for on-site visits',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+389 71 967 915',
    subtext: 'Mon-Fri 9am-6pm',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'z360virtualtours@gmail.com',
    subtext: 'We reply within 24 hours',
  },
  {
    icon: Clock,
    label: 'Response Time',
    value: 'Within 24 Hours',
    subtext: 'Usually much faster',
  },
]

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
  scheduledDate: string
  spotsRemaining: number
  perPersonTravelFee: number | null
  discountPercent: number
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
  total: number
  depositAmount: number | null
}

export default function ContactPage() {
  const [step, setStep] = useState(1)
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [urgencyTiers, setUrgencyTiers] = useState<UrgencyTier[]>([])
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [quote, setQuote] = useState<QuoteResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

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
    alternateDate: '',
    deadlineDate: '',
    isUrgent: false,
    bundleId: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

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
  }, [formData.pricingPlanId, formData.urgencyTierId, formData.propertyCity, formData.bundleId])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
          alternateDate: formData.alternateDate || null,
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
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-display font-bold text-cream mb-6">
              Book Your <span className="text-gold">Virtual Tour</span>
            </h1>
            <p className="text-body-lg text-cream-muted max-w-2xl mx-auto">
              Get an instant quote and schedule your professional 360° virtual tour.
              Fill in the details below and we'll get back to you within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Booking Form & Info */}
      <section className="py-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Info & Quote Preview */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Quote Preview */}
              {quote && (
                <Card className="p-6 border-gold/30">
                  <h3 className="text-lg font-semibold text-gold mb-4">Quote Estimate</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-cream-muted">Base Price ({selectedPlan?.name})</span>
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
                        <span className="text-cream-muted">Travel ({quote.travelZoneName})</span>
                        <span className="text-cream">+€{quote.travelFee.toFixed(2)}</span>
                      </div>
                    )}

                    {quote.bundleDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-cream-muted">Bundle Discount</span>
                        <span className="text-green-400">-€{quote.bundleDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between pt-3 border-t border-gold/20">
                      <span className="text-cream font-medium">Estimated Total</span>
                      <span className="text-gold text-xl font-bold">€{quote.total.toFixed(2)}</span>
                    </div>

                    {quote.depositAmount && (
                      <div className="flex justify-between text-cream-muted">
                        <span>Deposit Required</span>
                        <span>€{quote.depositAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-cream-muted mt-4">
                    * Final price confirmed after review
                  </p>
                </Card>
              )}

              {/* Available Bundles */}
              {availableBundles.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-cream mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-gold" />
                    Save with Group Bookings
                  </h3>
                  <p className="text-sm text-cream-muted mb-4">
                    Join a scheduled trip and share travel costs with other clients!
                  </p>
                  <div className="space-y-3">
                    {availableBundles.slice(0, 3).map((bundle) => (
                      <button
                        key={bundle.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, bundleId: formData.bundleId === bundle.id ? '' : bundle.id })}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          formData.bundleId === bundle.id
                            ? 'bg-gold/20 border border-gold'
                            : 'bg-navy-medium border border-gold/10 hover:border-gold/30'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-cream text-sm">{bundle.name}</p>
                            <p className="text-xs text-cream-muted">{bundle.city}</p>
                          </div>
                          <span className="text-green-400 text-xs font-medium">
                            {bundle.discountPercent}% off
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-cream-muted">
                            {new Date(bundle.scheduledDate).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-cream-muted">
                            {bundle.spotsRemaining} spots left
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              )}

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cream">Contact Information</h3>
                {contactInfo.map((info) => {
                  const Icon = info.icon
                  return (
                    <Card key={info.label} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-gold" />
                        </div>
                        <div>
                          <p className="text-xs text-cream-muted">{info.label}</p>
                          <p className="text-sm font-semibold text-cream">{info.value}</p>
                          <p className="text-xs text-cream-muted">{info.subtext}</p>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </motion.div>

            {/* Booking Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3"
            >
              <Card className="p-8">
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
                      Booking Request Sent!
                    </h3>
                    <p className="text-body text-cream-muted mb-6">
                      Thank you for your request. We'll review your details and send you a
                      confirmed quote within 24 hours.
                    </p>
                    {quote && (
                      <p className="text-gold font-semibold mb-6">
                        Estimated Total: €{quote.total.toFixed(2)}
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
                          alternateDate: '',
                          deadlineDate: '',
                          isUrgent: false,
                          bundleId: '',
                          message: '',
                        })
                        setQuote(null)
                      }}
                    >
                      Submit Another Request
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Contact Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-cream mb-4">Your Information</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-cream mb-2">
                            Your Name *
                          </label>
                          <Input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Marko Petrovski"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-cream mb-2">
                            Email Address *
                          </label>
                          <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="marko@example.com"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-cream mb-2">
                            Phone Number *
                          </label>
                          <Input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+389 70 123 456"
                            required
                          />
                          <p className="text-xs text-cream-muted mt-1">
                            We'll contact you to confirm your booking
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-cream mb-2">
                            Company / Business Name
                          </label>
                          <Input
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                            placeholder="Hotel Skopje"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Property Location */}
                    <div>
                      <h3 className="text-lg font-semibold text-cream mb-4">Property Location</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-cream mb-2">
                            Property Address *
                          </label>
                          <Input
                            name="propertyAddress"
                            value={formData.propertyAddress}
                            onChange={handleChange}
                            placeholder="Street name and number"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-cream mb-2">
                            City *
                          </label>
                          <Input
                            name="propertyCity"
                            value={formData.propertyCity}
                            onChange={handleChange}
                            placeholder="Skopje, Ohrid, Bitola..."
                            required
                          />
                          <p className="text-xs text-cream-muted mt-1">
                            Travel fees calculated based on distance
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Service Selection */}
                    <div>
                      <h3 className="text-lg font-semibold text-cream mb-4">Service Package</h3>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {pricingPlans.map((plan) => (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, pricingPlanId: plan.id })}
                            className={`p-4 rounded-xl text-left transition-all ${
                              formData.pricingPlanId === plan.id
                                ? 'bg-gold/20 border-2 border-gold'
                                : 'bg-navy-medium border border-gold/10 hover:border-gold/30'
                            }`}
                          >
                            <p className="font-semibold text-cream">{plan.name}</p>
                            <p className="text-gold font-bold">€{plan.price}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scheduling */}
                    <div>
                      <h3 className="text-lg font-semibold text-cream mb-4">Scheduling</h3>

                      {/* Urgency Selection */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-cream mb-2">
                          Delivery Speed
                        </label>
                        <div className="grid sm:grid-cols-3 gap-3">
                          {urgencyTiers.map((tier) => (
                            <button
                              key={tier.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, urgencyTierId: tier.id })}
                              className={`p-3 rounded-xl text-left transition-all ${
                                formData.urgencyTierId === tier.id
                                  ? 'bg-gold/20 border-2 border-gold'
                                  : 'bg-navy-medium border border-gold/10 hover:border-gold/30'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <p className="font-medium text-cream text-sm">{tier.displayName}</p>
                                {tier.surchargePercent > 0 && (
                                  <span className="text-orange-400 text-xs">+{tier.surchargePercent}%</span>
                                )}
                              </div>
                              <p className="text-xs text-cream-muted mt-1">{tier.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-cream mb-2">
                            Preferred Date
                          </label>
                          <Input
                            type="date"
                            name="preferredDate"
                            value={formData.preferredDate}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-cream mb-2">
                            Alternate Date
                          </label>
                          <Input
                            type="date"
                            name="alternateDate"
                            value={formData.alternateDate}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      {/* Urgent Checkbox */}
                      <div className="mt-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="isUrgent"
                            checked={formData.isUrgent}
                            onChange={handleChange}
                            className="w-4 h-4 rounded border-gold/20 bg-navy text-gold focus:ring-gold/50"
                          />
                          <span className="text-sm text-cream">
                            I need this done by a specific deadline
                          </span>
                        </label>

                        <AnimatePresence>
                          {formData.isUrgent && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3"
                            >
                              <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                                <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm text-cream">
                                    Rush requests may incur additional fees based on availability.
                                  </p>
                                  <div className="mt-2">
                                    <label className="block text-xs text-cream-muted mb-1">
                                      Must be completed by:
                                    </label>
                                    <Input
                                      type="date"
                                      name="deadlineDate"
                                      value={formData.deadlineDate}
                                      onChange={handleChange}
                                      className="max-w-[200px]"
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
                      <label className="block text-sm font-medium text-cream mb-2">
                        Tell Us About Your Project
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Describe your space, number of rooms, any specific requirements..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl bg-navy border border-gold/20 text-cream
                                   placeholder:text-cream-muted focus:outline-none focus:ring-2
                                   focus:ring-gold/50 focus:border-gold/50 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Request Quote
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-sm text-cream-muted text-center">
                      You'll receive a confirmed quote within 24 hours.
                      No payment required until you approve.
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
