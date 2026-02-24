'use client'

import { useState, useEffect } from 'react'
import { Star, Send, CheckCircle, ExternalLink, MapPin, Quote } from 'lucide-react'
import { Card, Button, Input } from '@/components/ui'
import { PublicHeader, Footer } from '@/components/layout'
import { motion, AnimatePresence } from 'framer-motion'

interface Testimonial {
  id: string
  clientName: string
  clientTitle: string | null
  content: string
  rating: number
}

// Google Reviews placeholder - will be populated from Google API in the future
interface GoogleReview {
  id: string
  author: string
  rating: number
  text: string
  time: string
  profilePhoto?: string
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'google' | 'street'>('all')
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    clientTitle: '',
    content: '',
    rating: 5,
  })

  // Placeholder for Google Reviews - will be fetched from API
  const [googleReviews] = useState<GoogleReview[]>([])

  // Google Business Profile URL - update this with your actual Google Business URL
  const googleBusinessUrl = 'https://g.page/r/YOUR_GOOGLE_BUSINESS_ID/review'
  const googleMapsUrl = 'https://www.google.com/maps/contrib/YOUR_GOOGLE_CONTRIBUTOR_ID'

  useEffect(() => {
    fetchTestimonials()
    // TODO: Fetch Google Reviews when API is integrated
    // fetchGoogleReviews()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials')
      if (res.ok) {
        const data = await res.json()
        setTestimonials(data)
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setSubmitted(true)
        setFormData({
          clientName: '',
          email: '',
          clientTitle: '',
          content: '',
          rating: 5,
        })
      } else {
        setError(data.error || 'Failed to submit testimonial')
      }
    } catch {
      setError('Failed to submit testimonial. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy">
      <PublicHeader />

      <div className="pt-6 sm:pt-8 pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-h2 sm:text-h1 font-bold text-cream mb-3 sm:mb-4"
            >
              Client Testimonials
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-body text-cream-muted max-w-2xl mx-auto"
            >
              See what our clients say about their experience with Z360 Virtual Tours
            </motion.p>
          </div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex overflow-x-auto scrollbar-hide justify-start sm:justify-center gap-2 mb-8 sm:mb-12 pb-1"
          >
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'all'
                  ? 'bg-gold text-navy'
                  : 'bg-navy-medium text-cream-muted hover:text-cream border border-gold/20'
              }`}
            >
              <Quote className="w-4 h-4 inline mr-1.5 sm:mr-2" />
              Client Reviews
            </button>
            <button
              onClick={() => setActiveTab('google')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'google'
                  ? 'bg-gold text-navy'
                  : 'bg-navy-medium text-cream-muted hover:text-cream border border-gold/20'
              }`}
            >
              <Star className="w-4 h-4 inline mr-1.5 sm:mr-2" />
              Google Reviews
            </button>
            <button
              onClick={() => setActiveTab('street')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'street'
                  ? 'bg-gold text-navy'
                  : 'bg-navy-medium text-cream-muted hover:text-cream border border-gold/20'
              }`}
            >
              <MapPin className="w-4 h-4 inline mr-1.5 sm:mr-2" />
              Street View
            </button>
          </motion.div>

          {/* Client Reviews Tab */}
          {activeTab === 'all' && (
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {/* Testimonials List */}
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-h4 sm:text-h3 font-semibold text-cream mb-4 sm:mb-6">What Our Clients Say</h2>

                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 sm:h-40 bg-gold/10 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : testimonials.length === 0 ? (
                  <Card className="p-6 sm:p-8 text-center">
                    <Star className="w-10 h-10 sm:w-12 sm:h-12 text-cream-muted mx-auto mb-4" />
                    <p className="text-cream-muted">No testimonials yet. Be the first to share your experience!</p>
                  </Card>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {testimonials.map((testimonial, index) => (
                      <motion.div
                        key={testimonial.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="p-4 sm:p-6">
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < testimonial.rating ? 'text-gold fill-gold' : 'text-cream-muted'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-cream-soft mb-4 italic text-sm sm:text-base">&quot;{testimonial.content}&quot;</p>
                          <div>
                            <p className="font-semibold text-cream">{testimonial.clientName}</p>
                            {testimonial.clientTitle && !testimonial.clientTitle.startsWith('Email:') && (
                              <p className="text-sm text-cream-muted">{testimonial.clientTitle}</p>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submission Form */}
              <div>
                <h2 className="text-h4 sm:text-h3 font-semibold text-cream mb-4 sm:mb-6">Share Your Experience</h2>

                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card className="p-6 sm:p-8 text-center">
                        <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg sm:text-xl font-semibold text-cream mb-2">Thank You!</h3>
                        <p className="text-cream-muted mb-6">
                          Your testimonial has been submitted and is pending approval.
                          We appreciate your feedback!
                        </p>
                        <Button onClick={() => setSubmitted(false)}>
                          Submit Another
                        </Button>
                      </Card>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Card className="p-4 sm:p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-cream mb-2">
                                Your Name *
                              </label>
                              <Input
                                value={formData.clientName}
                                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                placeholder="Marko Petrovski"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-cream mb-2">
                                Email
                              </label>
                              <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="marko@example.com"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-cream mb-2">
                              Title / Company
                            </label>
                            <Input
                              value={formData.clientTitle}
                              onChange={(e) => setFormData({ ...formData, clientTitle: e.target.value })}
                              placeholder="CEO at Company"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-cream mb-2">
                              Your Experience *
                            </label>
                            <textarea
                              value={formData.content}
                              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                              placeholder="Tell us about your experience with Z360 Virtual Tours..."
                              rows={4}
                              required
                              className="w-full px-4 py-3 rounded-md bg-navy-medium border border-cream/15 text-cream
                                         placeholder:text-cream-dim focus:outline-none focus:border-gold
                                         focus:ring-1 focus:ring-gold/50 transition-all duration-200 resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-cream mb-2">
                              Rating
                            </label>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, rating: star })}
                                  className="p-0.5 sm:p-1 transition-transform hover:scale-110"
                                >
                                  <Star
                                    className={`w-7 h-7 sm:w-8 sm:h-8 ${
                                      star <= formData.rating
                                        ? 'text-gold fill-gold'
                                        : 'text-cream-muted'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          {error && (
                            <p className="text-red-400 text-sm">{error}</p>
                          )}

                          <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                              'Submitting...'
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Submit Testimonial
                              </>
                            )}
                          </Button>

                          <p className="text-xs text-cream-muted text-center">
                            Your testimonial will be reviewed before being published.
                          </p>
                        </form>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Google Reviews Tab */}
          {activeTab === 'google' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gold/10 mb-4">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-10 sm:h-10" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <h2 className="text-h3 sm:text-h2 font-bold text-cream mb-3 sm:mb-4">Google Reviews</h2>
                <p className="text-cream-muted mb-6 sm:mb-8">
                  See what clients are saying about us on Google
                </p>
              </div>

              {googleReviews.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                  {googleReviews.map((review, index) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="p-4 sm:p-6 h-full">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">
                            {review.author.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-cream">{review.author}</p>
                            <p className="text-xs text-cream-muted">{review.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-gold fill-gold' : 'text-cream-muted'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-cream-soft text-sm sm:text-base">{review.text}</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card className="p-8 sm:p-12 text-center mb-8">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
                    <Star className="w-7 h-7 sm:w-8 sm:h-8 text-gold" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-cream mb-2">Google Reviews Coming Soon</h3>
                  <p className="text-cream-muted mb-6 max-w-md mx-auto text-sm sm:text-base">
                    We&apos;re integrating our Google Business reviews. In the meantime, you can leave us a review directly on Google!
                  </p>
                  <a
                    href={googleBusinessUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gold text-navy font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-gold-soft transition-colors text-sm sm:text-base"
                  >
                    Leave a Google Review
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Card>
              )}

              {/* Google Review CTA */}
              <Card className="p-6 sm:p-8 bg-gradient-to-br from-navy-medium to-navy-dark border-gold/20 text-center">
                <h3 className="text-lg sm:text-xl font-semibold text-cream mb-2">Enjoyed Our Service?</h3>
                <p className="text-cream-muted mb-4 sm:mb-6 text-sm sm:text-base">
                  Your feedback helps us grow! Leave a review on Google and help others discover Z360 Virtual Tours.
                </p>
                <a
                  href={googleBusinessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gold text-navy font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-gold-soft transition-colors text-sm sm:text-base"
                >
                  Write a Review on Google
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Card>
            </motion.div>
          )}

          {/* Google Street View Tab */}
          {activeTab === 'street' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gold/10 mb-4">
                  <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-gold" />
                </div>
                <h2 className="text-h3 sm:text-h2 font-bold text-cream mb-3 sm:mb-4">Google Street View</h2>
                <p className="text-cream-muted mb-6 sm:mb-8">
                  Explore our 360° contributions to Google Street View and Maps
                </p>
              </div>

              <Card className="p-8 sm:p-12 text-center mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-cream mb-2">Google Maps Contributions</h3>
                <p className="text-cream-muted mb-6 max-w-lg mx-auto text-sm sm:text-base">
                  We&apos;re a trusted Google Street View contributor, adding 360° imagery to Google Maps.
                  View our work on Google Maps to see the quality of our virtual tours!
                </p>

                <div className="flex flex-wrap justify-center gap-4">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gold text-navy font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-gold-soft transition-colors text-sm sm:text-base"
                  >
                    <MapPin className="w-4 h-4" />
                    View on Google Maps
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </Card>

              {/* Stats/Info Cards */}
              <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
                <Card className="p-4 sm:p-6 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-cream mb-1.5 sm:mb-2">Locations Covered</h4>
                  <p className="text-cream-muted text-xs sm:text-sm">
                    Multiple businesses and locations across the Balkans on Google Maps
                  </p>
                </Card>

                <Card className="p-4 sm:p-6 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-cream mb-1.5 sm:mb-2">Trusted Contributor</h4>
                  <p className="text-cream-muted text-xs sm:text-sm">
                    Official Google Street View trusted photographer
                  </p>
                </Card>

                <Card className="p-4 sm:p-6 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 text-gold" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-cream mb-1.5 sm:mb-2">High Quality</h4>
                  <p className="text-cream-muted text-xs sm:text-sm">
                    Professional 360° imagery meeting Google&apos;s quality standards
                  </p>
                </Card>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
