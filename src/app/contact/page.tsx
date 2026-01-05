'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  MapPin, Phone, Mail, Clock, Send, CheckCircle, Calendar, Users, AlertCircle,
  ChevronRight, Download, Facebook, Instagram, Linkedin, Youtube, Twitter,
  FileText, Share2, ExternalLink, Percent, Sparkles, CreditCard
} from 'lucide-react'
import { PublicHeader, Footer } from '@/components/layout'
import { Button, Card, Input } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'

const socialLinks = [
  {
    name: 'Facebook',
    icon: Facebook,
    url: 'https://facebook.com/z360virtualtours',
    color: 'hover:bg-blue-600/20 text-blue-400',
  },
  {
    name: 'Instagram',
    icon: Instagram,
    url: 'https://instagram.com/z360virtualtours',
    color: 'hover:bg-pink-600/20 text-pink-400',
  },
  {
    name: 'LinkedIn',
    icon: Linkedin,
    url: 'https://linkedin.com/company/z360virtualtours',
    color: 'hover:bg-blue-700/20 text-blue-500',
  },
  {
    name: 'YouTube',
    icon: Youtube,
    url: 'https://youtube.com/@z360virtualtours',
    color: 'hover:bg-red-600/20 text-red-500',
  },
]

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
  startDate: string
  endDate: string
  scheduledDate: string
  spotsRemaining: number
  perPersonTravelFee: number | null
  discountPercent: number
  registrationDeadline: string | null
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
  total: number
  depositAmount: number | null
}

interface BookingResponse {
  bookingId: string
  quote: {
    basePrice: number
    urgencySurcharge: number
    travelFee: number
    bundleDiscount: number
    total: number
    depositAmount: number | null
  }
}

function ContactPageContent() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [urgencyTiers, setUrgencyTiers] = useState<UrgencyTier[]>([])
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [quote, setQuote] = useState<QuoteResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null)
  const [sameCityDiscountPercent, setSameCityDiscountPercent] = useState(15)
  const confirmationRef = useRef<HTMLDivElement>(null)

  // Get URL params for schedule booking (date and cities where photographer will be)
  const scheduledDate = searchParams.get('date')
  const scheduledCitiesParam = searchParams.get('cities')
  const scheduledCities = scheduledCitiesParam ? scheduledCitiesParam.split(',') : []
  const urlDiscountPercent = searchParams.get('discountPercent')
  const bundleIdParam = searchParams.get('bundleId')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    propertyAddress: '',
    propertyCity: '',
    pricingPlanId: '',
    urgencyTierId: '',
    preferredDate: scheduledDate || '',
    preferredTime: '',
    alternateDate: '',
    alternateTime: '',
    deadlineDate: '',
    isUrgent: false,
    bundleId: '',
    message: '',
  })

  // Update preferred date if URL param changes
  useEffect(() => {
    if (scheduledDate && !formData.preferredDate) {
      setFormData(prev => ({ ...prev, preferredDate: scheduledDate }))
    }
  }, [scheduledDate])

  // Update discount from URL param (from bundle or same-city discount)
  useEffect(() => {
    if (urlDiscountPercent) {
      const discount = parseFloat(urlDiscountPercent)
      if (!isNaN(discount) && discount > 0) {
        setSameCityDiscountPercent(discount)
      }
    }
  }, [urlDiscountPercent])

  // Set bundleId from URL if provided
  useEffect(() => {
    if (bundleIdParam && !formData.bundleId) {
      setFormData(prev => ({ ...prev, bundleId: bundleIdParam }))
    }
  }, [bundleIdParam])

  // Pre-fill form with user data if logged in
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/user/auth/me')
        if (res.ok) {
          const data = await res.json()
          const user = data.user
          setFormData(prev => ({
            ...prev,
            name: prev.name || user.name || '',
            email: prev.email || user.email || '',
            phone: prev.phone || user.phone || '',
            company: prev.company || user.company || '',
          }))
        }
      } catch {
        // Not logged in, ignore
      }
    }
    fetchUserData()
  }, [])

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isPaymentLoading, setIsPaymentLoading] = useState(false)

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
          if (data.settings?.sameCityDiscountPercent) {
            setSameCityDiscountPercent(data.settings.sameCityDiscountPercent)
          }
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
            scheduledCities: scheduledCities.length > 0 ? scheduledCities : undefined,
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
  }, [formData.pricingPlanId, formData.urgencyTierId, formData.propertyCity, formData.bundleId, scheduledCitiesParam])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target

    // Validate date against selected bundle
    if (name === 'preferredDate' && value && formData.bundleId) {
      const selectedBundle = availableBundles.find(b => b.id === formData.bundleId)
      if (selectedBundle) {
        const selectedDate = new Date(value)
        const bundleStart = new Date(selectedBundle.startDate)
        const bundleEnd = new Date(selectedBundle.endDate)
        // Reset time to compare dates only
        selectedDate.setHours(0, 0, 0, 0)
        bundleStart.setHours(0, 0, 0, 0)
        bundleEnd.setHours(0, 0, 0, 0)

        if (selectedDate < bundleStart || selectedDate > bundleEnd) {
          const formatD = (d: Date) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
          alert(`Date must be between ${formatD(bundleStart)} and ${formatD(bundleEnd)} for "${selectedBundle.name}" bundle. Bundle has been deselected.`)
          setFormData((prev) => ({
            ...prev,
            [name]: value,
            bundleId: '', // Deselect bundle
          }))
          return
        }
      }
    }

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
          preferredTime: formData.preferredTime || null,
          alternateDate: formData.alternateDate || null,
          alternateTime: formData.alternateTime || null,
          deadlineDate: formData.isUrgent ? formData.deadlineDate : null,
          travelBundleId: formData.bundleId || null,
          projectDescription: formData.message,
          // Same-city discount info
          sameCityDiscount: quote?.sameCityDiscount || 0,
          sameCityDiscountPercent: quote?.sameCityDiscountPercent || 0,
          matchedScheduledCity: quote?.matchedScheduledCity || null,
          scheduledCities: scheduledCities.length > 0 ? scheduledCities : null,
        }),
      })

      if (res.ok) {
        const responseData = await res.json()
        setBookingResponse(responseData)
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

  // Generate and download confirmation document
  const handleDownloadConfirmation = () => {
    const selectedPlanName = pricingPlans.find(p => p.id === formData.pricingPlanId)?.name || 'Custom'
    const selectedTierName = urgencyTiers.find(t => t.id === formData.urgencyTierId)?.displayName || 'Standard'
    const bookingId = bookingResponse?.bookingId || 'N/A'
    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Z360 Virtual Tours - Booking Confirmation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #0D1B2A;
      color: #F5F1E6;
      padding: 40px;
      line-height: 1.6;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #1B2838;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header {
      background: linear-gradient(135deg, #C9A962 0%, #A88B4A 100%);
      color: #0D1B2A;
      padding: 40px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.8;
    }
    .content { padding: 40px; }
    .booking-id {
      background: #0D1B2A;
      border: 2px solid #C9A962;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin-bottom: 30px;
    }
    .booking-id label {
      font-size: 12px;
      color: #C9A962;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .booking-id .id {
      font-size: 24px;
      font-weight: 700;
      color: #C9A962;
      font-family: monospace;
      margin-top: 8px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #C9A962;
      border-bottom: 1px solid #C9A96233;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .info-item {
      background: #0D1B2A;
      padding: 15px;
      border-radius: 8px;
    }
    .info-item label {
      font-size: 11px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-item p {
      font-size: 14px;
      color: #F5F1E6;
      margin-top: 4px;
    }
    .quote-box {
      background: #0D1B2A;
      border-radius: 12px;
      padding: 25px;
    }
    .quote-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #1B2838;
    }
    .quote-row:last-child { border-bottom: none; }
    .quote-row.total {
      border-top: 2px solid #C9A962;
      margin-top: 10px;
      padding-top: 15px;
    }
    .quote-row.total span:last-child {
      font-size: 24px;
      font-weight: 700;
      color: #C9A962;
    }
    .contact-section {
      background: linear-gradient(135deg, #0D1B2A 0%, #1B2838 100%);
      border: 1px solid #C9A96233;
      border-radius: 12px;
      padding: 25px;
      margin-top: 30px;
    }
    .contact-section h3 {
      color: #C9A962;
      margin-bottom: 20px;
      font-size: 16px;
    }
    .contact-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 12px 0;
      border-bottom: 1px solid #C9A96222;
    }
    .contact-item:last-child { border-bottom: none; }
    .contact-icon {
      width: 40px;
      height: 40px;
      background: #C9A96222;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #C9A962;
    }
    .social-section {
      text-align: center;
      padding: 30px;
      background: #0D1B2A;
      margin-top: 30px;
      border-radius: 12px;
    }
    .social-section h3 {
      color: #F5F1E6;
      margin-bottom: 15px;
      font-size: 16px;
    }
    .social-links {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 15px;
    }
    .social-link {
      color: #C9A962;
      text-decoration: none;
      font-size: 13px;
    }
    .footer {
      text-align: center;
      padding: 30px;
      background: #0D1B2A;
      font-size: 12px;
      color: #666;
    }
    .footer p { margin: 5px 0; }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Z360 Virtual Tours</h1>
      <p>Booking Request Confirmation</p>
    </div>

    <div class="content">
      <div class="booking-id">
        <label>Reference Number</label>
        <div class="id">#${bookingId.slice(-8).toUpperCase()}</div>
        <p style="font-size: 12px; color: #888; margin-top: 10px;">Submitted on ${currentDate}</p>
      </div>

      <div class="section">
        <div class="section-title">Client Information</div>
        <div class="info-grid">
          <div class="info-item">
            <label>Name</label>
            <p>${formData.name}</p>
          </div>
          <div class="info-item">
            <label>Email</label>
            <p>${formData.email}</p>
          </div>
          <div class="info-item">
            <label>Phone</label>
            <p>${formData.phone || 'Not provided'}</p>
          </div>
          <div class="info-item">
            <label>Company</label>
            <p>${formData.company || 'Not provided'}</p>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Property Details</div>
        <div class="info-grid">
          <div class="info-item" style="grid-column: span 2;">
            <label>Address</label>
            <p>${formData.propertyAddress}</p>
          </div>
          <div class="info-item">
            <label>City</label>
            <p>${formData.propertyCity}</p>
          </div>
          <div class="info-item">
            <label>Service Package</label>
            <p>${selectedPlanName}</p>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Scheduling</div>
        <div class="info-grid">
          <div class="info-item">
            <label>Delivery Speed</label>
            <p>${selectedTierName}</p>
          </div>
          <div class="info-item">
            <label>Preferred Date & Time</label>
            <p>${formData.preferredDate ? (() => { const d = new Date(formData.preferredDate); return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`; })() : 'Flexible'}${formData.preferredTime ? ` at ${formData.preferredTime}` : ''}</p>
          </div>
          ${formData.alternateDate ? `
          <div class="info-item">
            <label>Alternate Date & Time</label>
            <p>${(() => { const d = new Date(formData.alternateDate); return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`; })()}${formData.alternateTime ? ` at ${formData.alternateTime}` : ''}</p>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Quote Estimate</div>
        <div class="quote-box">
          <div class="quote-row">
            <span>Base Price</span>
            <span>€${quote?.basePrice.toFixed(2) || '0.00'}</span>
          </div>
          ${quote?.urgencySurchargeAmount ? `
          <div class="quote-row">
            <span>Urgency Surcharge</span>
            <span style="color: #f97316;">+€${quote.urgencySurchargeAmount.toFixed(2)}</span>
          </div>` : ''}
          ${quote?.travelFee ? `
          <div class="quote-row">
            <span>Travel Fee</span>
            <span>+€${quote.travelFee.toFixed(2)}</span>
          </div>` : ''}
          ${quote?.bundleDiscount ? `
          <div class="quote-row">
            <span>Bundle Discount</span>
            <span style="color: #22c55e;">-€${quote.bundleDiscount.toFixed(2)}</span>
          </div>` : ''}
          ${quote?.sameCityDiscount ? `
          <div class="quote-row">
            <span>Same-City Discount (${quote.sameCityDiscountPercent}%)</span>
            <span style="color: #22c55e;">-€${quote.sameCityDiscount.toFixed(2)}</span>
          </div>` : ''}
          <div class="quote-row total">
            <span>Estimated Total</span>
            <span>€${quote?.total.toFixed(2) || '0.00'}</span>
          </div>
          ${quote?.depositAmount ? `
          <div class="quote-row">
            <span style="color: #888;">Deposit Required</span>
            <span style="color: #888;">€${quote.depositAmount.toFixed(2)}</span>
          </div>` : ''}
        </div>
        <p style="font-size: 11px; color: #666; margin-top: 15px; text-align: center;">
          * Final price will be confirmed after review of your request
        </p>
      </div>

      <div class="contact-section">
        <h3>📞 Contact Us</h3>
        <div class="contact-item">
          <div class="contact-icon">📧</div>
          <div>
            <p style="font-size: 14px;">z360virtualtours@gmail.com</p>
            <p style="font-size: 11px; color: #888;">We reply within 24 hours</p>
          </div>
        </div>
        <div class="contact-item">
          <div class="contact-icon">📱</div>
          <div>
            <p style="font-size: 14px;">+389 71 967 915</p>
            <p style="font-size: 11px; color: #888;">Mon-Fri 9am-6pm</p>
          </div>
        </div>
        <div class="contact-item">
          <div class="contact-icon">📍</div>
          <div>
            <p style="font-size: 14px;">Balkans Region</p>
            <p style="font-size: 11px; color: #888;">Available for on-site visits</p>
          </div>
        </div>
      </div>

      <div class="social-section">
        <h3>Follow Us for Updates & Exclusive Content</h3>
        <p style="font-size: 13px; color: #888;">See our latest virtual tours and behind-the-scenes content</p>
        <div class="social-links">
          <a class="social-link" href="https://facebook.com/z360virtualtours">Facebook</a>
          <a class="social-link" href="https://instagram.com/z360virtualtours">Instagram</a>
          <a class="social-link" href="https://linkedin.com/company/z360virtualtours">LinkedIn</a>
          <a class="social-link" href="https://youtube.com/@z360virtualtours">YouTube</a>
        </div>
      </div>
    </div>

    <div class="footer">
      <p><strong>Z360 Virtual Tours</strong></p>
      <p>Professional 360° Virtual Tour Services</p>
      <p style="margin-top: 15px;">Thank you for choosing us! We'll be in touch soon.</p>
    </div>
  </div>
</body>
</html>
    `

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Z360-Booking-${bookingId.slice(-8).toUpperCase()}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const selectedPlan = pricingPlans.find(p => p.id === formData.pricingPlanId)
  const selectedTier = urgencyTiers.find(t => t.id === formData.urgencyTierId)
  const selectedBundle = bundles.find(b => b.id === formData.bundleId)

  // Handle Stripe payment
  const handlePayDeposit = async () => {
    if (!bookingResponse?.bookingId) return

    setIsPaymentLoading(true)
    try {
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bookingResponse.bookingId,
          paymentType: 'deposit',
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Failed to create payment session. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Failed to initiate payment. Please try again.')
    } finally {
      setIsPaymentLoading(false)
    }
  }

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
              {/* Same-City Discount Banner - shown when coming from schedule page */}
              {scheduledCities.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-4 border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <Percent className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-4 h-4 text-green-400" />
                          <p className="text-green-400 font-semibold">{sameCityDiscountPercent}% Same-City Discount Available!</p>
                        </div>
                        <p className="text-cream-muted text-sm">
                          I'll be in <span className="text-green-300 font-medium">{scheduledCities.join(', ')}</span> on{' '}
                          <span className="text-green-300 font-medium">
                            {scheduledDate ? new Date(scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'this date'}
                          </span>.
                          If your property is nearby, you'll automatically get {sameCityDiscountPercent}% off!
                        </p>
                        {quote?.matchedScheduledCity && (
                          <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/20 w-fit">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-green-300 text-sm font-medium">
                              Discount applied! Your city matches {quote.matchedScheduledCity}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Selected Bundle Banner - shown when coming from schedule page with a bundle */}
              {selectedBundle && bundleIdParam && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-4 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-indigo-500/5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-purple-400 font-semibold">Group Bundle Selected!</p>
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs font-medium rounded">
                            {selectedBundle.discountPercent}% off
                          </span>
                        </div>
                        <p className="text-cream font-medium mb-1">{selectedBundle.name}</p>
                        <p className="text-cream-muted text-sm">
                          <span className="text-purple-300">{selectedBundle.city}</span> • {' '}
                          {new Date(selectedBundle.scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-cream-muted">
                            {selectedBundle.spotsRemaining} spots remaining
                          </span>
                          {selectedBundle.perPersonTravelFee && (
                            <span className="text-cream-muted">
                              €{selectedBundle.perPersonTravelFee}/person travel fee
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

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

                    {quote.sameCityDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-cream-muted">
                          Same-City Discount ({quote.sameCityDiscountPercent}%)
                        </span>
                        <span className="text-green-400">-€{quote.sameCityDiscount.toFixed(2)}</span>
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
                        onClick={() => {
                          // If selecting bundle, validate date if already entered
                          if (formData.bundleId !== bundle.id && formData.preferredDate) {
                            const selectedDate = new Date(formData.preferredDate)
                            const bundleStart = new Date(bundle.startDate)
                            const bundleEnd = new Date(bundle.endDate)
                            // Reset time to compare dates only
                            selectedDate.setHours(0, 0, 0, 0)
                            bundleStart.setHours(0, 0, 0, 0)
                            bundleEnd.setHours(0, 0, 0, 0)

                            if (selectedDate < bundleStart || selectedDate > bundleEnd) {
                              alert(`Your selected date must be between ${(() => {
                                const d = bundleStart
                                return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
                              })()} and ${(() => {
                                const d = bundleEnd
                                return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
                              })()} to join this bundle.`)
                              return
                            }
                          }
                          setFormData({ ...formData, bundleId: formData.bundleId === bundle.id ? '' : bundle.id })
                        }}
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
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-cream-muted">
                              📅 {(() => {
                                const start = new Date(bundle.startDate)
                                const end = new Date(bundle.endDate)
                                const formatD = (d: Date) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
                                if (start.toDateString() === end.toDateString()) {
                                  return formatD(start)
                                }
                                return `${formatD(start)} - ${formatD(end)}`
                              })()}
                            </span>
                            <span className="text-xs text-cream-muted">
                              {bundle.spotsRemaining} spots left
                            </span>
                          </div>
                          {bundle.registrationDeadline && (
                            <p className="text-xs text-orange-400">
                              ⏰ Register by: {(() => {
                                const d = new Date(bundle.registrationDeadline)
                                return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
                              })()}
                            </p>
                          )}
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
                    className="py-8"
                  >
                    {/* Success Header */}
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="text-h3 font-bold text-cream mb-2">
                        Booking Request Sent!
                      </h3>
                      <p className="text-body text-cream-muted">
                        Thank you for your request. We'll review your details and send you a
                        confirmed quote within 24 hours.
                      </p>
                    </div>

                    {/* Reference & Quote */}
                    <div className="bg-navy rounded-xl p-6 mb-6">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gold/20">
                        <div>
                          <p className="text-xs text-cream-muted uppercase tracking-wide">Reference Number</p>
                          <p className="text-lg font-mono font-bold text-gold">
                            #{bookingResponse?.bookingId?.slice(-8).toUpperCase() || 'N/A'}
                          </p>
                        </div>
                        {quote && (
                          <div className="text-right">
                            <p className="text-xs text-cream-muted">Estimated Total</p>
                            <p className="text-2xl font-bold text-gold">€{quote.total.toFixed(2)}</p>
                          </div>
                        )}
                      </div>

                      {/* Pay Deposit Button */}
                      {quote?.depositAmount && quote.depositAmount > 0 && (
                        <Button
                          onClick={handlePayDeposit}
                          className="w-full group mb-3"
                          size="lg"
                          disabled={isPaymentLoading}
                        >
                          {isPaymentLoading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin mr-2" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5 mr-2" />
                              Pay Deposit Now - €{quote.depositAmount.toFixed(2)}
                            </>
                          )}
                        </Button>
                      )}

                      {/* Download Button */}
                      <Button
                        onClick={handleDownloadConfirmation}
                        variant="secondary"
                        className="w-full group"
                        size="lg"
                      >
                        <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                        Download Confirmation
                      </Button>
                      <p className="text-xs text-cream-muted text-center mt-3">
                        {quote?.depositAmount ? 'Pay your deposit to confirm your booking, or save this document for your records.' : 'Save this document for your records. You can print it or open it in your browser.'}
                      </p>
                    </div>

                    {/* Contact Info Summary */}
                    <div className="bg-navy rounded-xl p-6 mb-6">
                      <h4 className="text-sm font-semibold text-gold mb-4 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Need to reach us?
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <a
                          href="mailto:z360virtualtours@gmail.com"
                          className="flex items-center gap-3 p-3 rounded-lg bg-navy-dark hover:bg-gold/10 transition-colors"
                        >
                          <Mail className="w-5 h-5 text-gold" />
                          <div>
                            <p className="text-sm text-cream">z360virtualtours@gmail.com</p>
                            <p className="text-xs text-cream-muted">We reply within 24 hours</p>
                          </div>
                        </a>
                        <a
                          href="tel:+38971967915"
                          className="flex items-center gap-3 p-3 rounded-lg bg-navy-dark hover:bg-gold/10 transition-colors"
                        >
                          <Phone className="w-5 h-5 text-gold" />
                          <div>
                            <p className="text-sm text-cream">+389 71 967 915</p>
                            <p className="text-xs text-cream-muted">Mon-Fri 9am-6pm</p>
                          </div>
                        </a>
                      </div>
                    </div>

                    {/* Social Media Section */}
                    <div className="bg-gradient-to-br from-gold/10 to-gold/5 rounded-xl p-6 border border-gold/20">
                      <h4 className="text-lg font-semibold text-cream text-center mb-2">
                        Follow Us for Updates!
                      </h4>
                      <p className="text-sm text-cream-muted text-center mb-6">
                        See our latest virtual tours, behind-the-scenes content, and exclusive offers
                      </p>
                      <div className="grid grid-cols-4 gap-3">
                        {socialLinks.map((social) => {
                          const Icon = social.icon
                          return (
                            <a
                              key={social.name}
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-navy border border-gold/10 ${social.color} transition-all hover:border-gold/30 hover:scale-105`}
                            >
                              <Icon className="w-6 h-6" />
                              <span className="text-xs text-cream-muted hidden sm:block">{social.name}</span>
                            </a>
                          )
                        })}
                      </div>
                      <p className="text-xs text-center text-cream-muted mt-4">
                        Tag us in your posts once your tour is live! 🎉
                      </p>
                    </div>

                    {/* Submit Another */}
                    <div className="mt-6 text-center">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setIsSubmitted(false)
                          setBookingResponse(null)
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
                        Submit Another Request
                      </Button>
                    </div>
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

                      {/* Preferred Date & Time */}
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-navy border border-gold/10">
                          <label className="block text-sm font-medium text-cream mb-3">
                            Preferred Date & Time
                          </label>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <Input
                              type="date"
                              name="preferredDate"
                              value={formData.preferredDate}
                              onChange={handleChange}
                            />
                            <select
                              name="preferredTime"
                              value={formData.preferredTime}
                              onChange={handleChange}
                              className="w-full px-4 py-3 rounded-xl bg-navy-dark border border-gold/20 text-cream
                                       focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50"
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

                        <div className="p-4 rounded-xl bg-navy border border-gold/10">
                          <label className="block text-sm font-medium text-cream mb-3">
                            Alternate Date & Time (Optional)
                          </label>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <Input
                              type="date"
                              name="alternateDate"
                              value={formData.alternateDate}
                              onChange={handleChange}
                            />
                            <select
                              name="alternateTime"
                              value={formData.alternateTime}
                              onChange={handleChange}
                              className="w-full px-4 py-3 rounded-xl bg-navy-dark border border-gold/20 text-cream
                                       focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50"
                            >
                              <option value="">Select time...</option>
                              {timeSlots.map((slot) => (
                                <option key={slot.value} value={slot.value}>
                                  {slot.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <p className="text-xs text-cream-muted mt-2">
                            Providing a backup option helps us schedule faster
                          </p>
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

// Loading fallback
function ContactLoading() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-cream-muted">Loading booking form...</p>
      </div>
    </div>
  )
}

// Default export with Suspense wrapper for useSearchParams
export default function ContactPage() {
  return (
    <Suspense fallback={<ContactLoading />}>
      <ContactPageContent />
    </Suspense>
  )
}
