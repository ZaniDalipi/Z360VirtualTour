'use client'

import { useState, useEffect } from 'react'
import { Star, Send, CheckCircle } from 'lucide-react'
import { Card, Button, Input } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'

interface Testimonial {
  id: string
  clientName: string
  clientTitle: string | null
  content: string
  rating: number
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    clientTitle: '',
    content: '',
    rating: 5,
  })

  useEffect(() => {
    fetchTestimonials()
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
    <div className="min-h-screen bg-navy pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-h1 font-bold text-cream mb-4"
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

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Testimonials List */}
          <div className="space-y-6">
            <h2 className="text-h3 font-semibold text-cream mb-6">What Our Clients Say</h2>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-40 bg-gold/10 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : testimonials.length === 0 ? (
              <Card className="p-8 text-center">
                <Star className="w-12 h-12 text-cream-muted mx-auto mb-4" />
                <p className="text-cream-muted">No testimonials yet. Be the first to share your experience!</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6">
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
                      <p className="text-cream-soft mb-4 italic">"{testimonial.content}"</p>
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
            <h2 className="text-h3 font-semibold text-cream mb-6">Share Your Experience</h2>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="p-8 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-cream mb-2">Thank You!</h3>
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
                  <Card className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                        <p className="text-xs text-cream-muted mt-1">Optional - for verification purposes only</p>
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
                          className="w-full px-4 py-3 rounded-xl bg-navy border border-gold/20 text-cream
                                     placeholder:text-cream-muted focus:outline-none focus:ring-2
                                     focus:ring-gold/50 focus:border-gold/50 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-cream mb-2">
                          Rating
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFormData({ ...formData, rating: star })}
                              className="p-1 transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-8 h-8 ${
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
      </div>
    </div>
  )
}
