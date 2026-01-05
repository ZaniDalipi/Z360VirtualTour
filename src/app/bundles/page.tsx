'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, Users, Percent, Clock, ChevronRight } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { motion } from 'framer-motion'

interface Bundle {
  id: string
  name: string
  city: string
  region: string | null
  startDate: string
  endDate: string
  scheduledDate: string
  spotsRemaining: number
  perPersonTravelFee: number | null
  discountPercent: number
  description: string | null
  registrationDeadline: string | null
}

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBundles()
  }, [])

  const fetchBundles = async () => {
    try {
      const res = await fetch('/api/bundles')
      if (res.ok) {
        setBundles(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch bundles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // European date format (DD/MM/YYYY)
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  // Short European date (6 Jan)
  const formatDateShort = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    })
  }

  // Format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Same day
    if (start.toDateString() === end.toDateString()) {
      return formatDate(startDate)
    }

    // Same month & year
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${start.getDate()} - ${end.getDate()}/${String(start.getMonth() + 1).padStart(2, '0')}/${start.getFullYear()}`
    }

    // Different months
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="min-h-screen bg-navy pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-gold/10 to-transparent pt-8 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-cream-muted hover:text-cream mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-cream mb-4">
              Travel <span className="text-gold">Bundles</span>
            </h1>
            <p className="text-cream-muted max-w-2xl mx-auto">
              Join a group trip and save on travel costs! When multiple clients book in the same area,
              everyone shares the travel expenses and gets a discount.
            </p>
          </motion.div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 mb-12">
        <Card className="p-6 bg-gold/5 border-gold/20">
          <h2 className="text-lg font-semibold text-gold mb-4">How Bundles Work</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                <span className="text-gold font-bold">1</span>
              </div>
              <div>
                <h3 className="font-medium text-cream mb-1">Join a Bundle</h3>
                <p className="text-sm text-cream-muted">Select a bundle for your area and date</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                <span className="text-gold font-bold">2</span>
              </div>
              <div>
                <h3 className="font-medium text-cream mb-1">Share Travel Costs</h3>
                <p className="text-sm text-cream-muted">Travel expenses are divided among participants</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                <span className="text-gold font-bold">3</span>
              </div>
              <div>
                <h3 className="font-medium text-cream mb-1">Get a Discount</h3>
                <p className="text-sm text-cream-muted">Bundle participants receive special pricing</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bundles List */}
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-xl font-semibold text-cream mb-6">
          Available Bundles
        </h2>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-6 w-48 bg-gold/10 rounded mb-4" />
                <div className="h-4 w-32 bg-gold/10 rounded mb-3" />
                <div className="h-4 w-full bg-gold/10 rounded" />
              </Card>
            ))}
          </div>
        ) : bundles.length === 0 ? (
          <Card className="p-12 text-center">
            <MapPin className="w-12 h-12 text-cream-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-cream mb-2">No Bundles Available</h3>
            <p className="text-cream-muted mb-6 max-w-md mx-auto">
              There are no travel bundles open for registration right now.
              Check back soon or contact us to request a bundle for your area.
            </p>
            <Link href="/contact">
              <Button>Request a Bundle</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {bundles.map((bundle, index) => {
              const daysUntil = getDaysUntil(bundle.scheduledDate)
              const isUrgent = daysUntil <= 7 && daysUntil > 0
              const deadlineDays = bundle.registrationDeadline
                ? getDaysUntil(bundle.registrationDeadline)
                : null

              return (
                <motion.div
                  key={bundle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`p-6 hover:border-gold/40 transition-colors ${
                    bundle.spotsRemaining <= 2 ? 'border-orange-500/30' : ''
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Main Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-6 h-6 text-gold" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-cream">{bundle.name}</h3>
                            <div className="flex items-center gap-2 text-cream-muted text-sm">
                              <span>{bundle.city}</span>
                              {bundle.region && (
                                <>
                                  <span>•</span>
                                  <span>{bundle.region}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {bundle.description && (
                          <p className="text-cream-muted text-sm mb-4 line-clamp-2">
                            {bundle.description}
                          </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-cream-muted">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDateRange(bundle.startDate, bundle.endDate)}</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${
                            bundle.spotsRemaining <= 2 ? 'text-orange-400' : 'text-cream-muted'
                          }`}>
                            <Users className="w-4 h-4" />
                            <span>
                              {bundle.spotsRemaining === 0
                                ? 'Full'
                                : `${bundle.spotsRemaining} spots left`}
                            </span>
                          </div>
                          {bundle.discountPercent > 0 && (
                            <div className="flex items-center gap-1.5 text-green-400">
                              <Percent className="w-4 h-4" />
                              <span>{bundle.discountPercent}% off</span>
                            </div>
                          )}
                        </div>

                        {/* Deadline Warning */}
                        {deadlineDays !== null && deadlineDays <= 5 && deadlineDays > 0 && (
                          <div className="mt-3 flex items-center gap-2 text-orange-400 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>Registration closes in {deadlineDays} day{deadlineDays !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Side */}
                      <div className="flex flex-col items-end gap-3 md:min-w-[160px]">
                        {bundle.perPersonTravelFee !== null && (
                          <div className="text-right">
                            <p className="text-xs text-cream-muted">Travel fee</p>
                            <p className="text-xl font-bold text-gold">
                              €{bundle.perPersonTravelFee.toFixed(2)}
                            </p>
                            <p className="text-xs text-cream-dim">per person</p>
                          </div>
                        )}

                        <Link href={`/contact?bundle=${bundle.id}`} className="w-full md:w-auto">
                          <Button
                            className="w-full"
                            disabled={bundle.spotsRemaining === 0}
                          >
                            {bundle.spotsRemaining === 0 ? 'Full' : 'Join Bundle'}
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Near-Date Contact Option */}
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-sm text-cream-muted mb-2">
                        <span className="text-blue-400 font-medium">Need a different date?</span>
                        {' '}If you need a shoot within ±2 days of this bundle&apos;s dates, contact us directly and we may be able to accommodate you.
                      </p>
                      <a
                        href={`mailto:z360virtualtours@gmail.com?subject=Bundle%20Date%20Request%20-%20${encodeURIComponent(bundle.name)}&body=Hi%2C%0A%0AI%27m%20interested%20in%20the%20${encodeURIComponent(bundle.name)}%20bundle%20(${formatDateRange(bundle.startDate, bundle.endDate)})%20but%20need%20a%20slightly%20different%20date.%0A%0AMy%20preferred%20date%3A%20%5BPlease%20specify%5D%0ACity%3A%20${encodeURIComponent(bundle.city)}%0A%0AThank%20you!`}
                        className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Contact for ±2 day flexibility
                        <ChevronRight className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Progress Bar */}
                    {bundle.spotsRemaining > 0 && (
                      <div className="mt-4 pt-4 border-t border-gold/10">
                        <div className="flex items-center justify-between text-xs text-cream-muted mb-2">
                          <span>Spots filled</span>
                          <span>{Math.round((1 - bundle.spotsRemaining / 10) * 100)}%</span>
                        </div>
                        <div className="w-full bg-navy-medium rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              bundle.spotsRemaining <= 2 ? 'bg-orange-400' : 'bg-gold'
                            }`}
                            style={{ width: `${Math.round((1 - bundle.spotsRemaining / 10) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-cream mb-3">Why Join a Bundle?</h3>
            <ul className="space-y-2 text-sm text-cream-muted">
              <li className="flex items-start gap-2">
                <span className="text-gold mt-1">✓</span>
                <span>Save up to 70% on travel costs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-1">✓</span>
                <span>Get exclusive bundle discounts on services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-1">✓</span>
                <span>Guaranteed scheduled shoot date</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-1">✓</span>
                <span>Priority booking for limited spots</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-cream mb-3">Don't See Your Area?</h3>
            <p className="text-sm text-cream-muted mb-4">
              If there's no bundle for your city or preferred date, contact us!
              We can create a new bundle for your area when there's enough interest.
            </p>
            <Link href="/contact">
              <Button variant="secondary" size="sm">
                Request a Bundle
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
