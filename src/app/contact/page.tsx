'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react'
import { PublicHeader, Footer } from '@/components/layout'
import { Button, Card, Input } from '@/components/ui'
import { motion } from 'framer-motion'

const contactInfo = [
  {
    icon: MapPin,
    label: 'Location',
    value: 'Available for on-site visits',
    subtext: 'Local & travel projects',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+1 (555) 360-TOUR',
    subtext: 'Mon-Fri 9am-6pm',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@z360tours.com',
    subtext: 'We reply within 24 hours',
  },
  {
    icon: Clock,
    label: 'Response Time',
    value: 'Within 24 Hours',
    subtext: 'Usually much faster',
  },
]

const services = [
  'Real Estate Tours',
  'Business & Retail',
  'Hotels & Hospitality',
  'Restaurants & Venues',
  'Educational Institutions',
  'Other',
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // In production, this would submit to /api/contact
    console.log('Form submitted:', formData)

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-navy">
      <PublicHeader />

      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-display font-bold text-cream mb-6">
              Let's Create Something <span className="text-gold">Amazing</span>
            </h1>
            <p className="text-body-lg text-cream-muted max-w-2xl mx-auto">
              Ready to showcase your space with an immersive virtual tour?
              Get in touch and let's discuss your project.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              <div>
                <h2 className="text-h2 font-bold text-cream mb-4">
                  Get in Touch
                </h2>
                <p className="text-body text-cream-muted">
                  Have questions about our services or ready to book your virtual tour?
                  We'd love to hear from you.
                </p>
              </div>

              <div className="space-y-4">
                {contactInfo.map((info) => {
                  const Icon = info.icon
                  return (
                    <Card key={info.label} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-gold" />
                        </div>
                        <div>
                          <p className="text-sm text-cream-muted">{info.label}</p>
                          <p className="text-body font-semibold text-cream">{info.value}</p>
                          <p className="text-sm text-cream-muted">{info.subtext}</p>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </motion.div>

            {/* Contact Form */}
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
                      Message Sent!
                    </h3>
                    <p className="text-body text-cream-muted mb-6">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsSubmitted(false)
                        setFormData({
                          name: '',
                          email: '',
                          phone: '',
                          company: '',
                          service: '',
                          message: '',
                        })
                      }}
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-cream mb-2">
                          Your Name *
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Smith"
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
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-cream mb-2">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cream mb-2">
                          Company / Property
                        </label>
                        <Input
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          placeholder="Your company or property name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Service Interested In
                      </label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-navy border border-gold/20 text-cream
                                   focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50"
                      >
                        <option value="">Select a service...</option>
                        {services.map((service) => (
                          <option key={service} value={service}>
                            {service}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Tell Us About Your Project *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Describe your space, goals, and any specific requirements..."
                        rows={5}
                        required
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
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>

                    <p className="text-sm text-cream-muted text-center">
                      By submitting this form, you agree to our privacy policy.
                      We'll never share your information.
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
