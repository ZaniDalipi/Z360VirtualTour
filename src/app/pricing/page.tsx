'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, ArrowRight, Sparkles } from 'lucide-react'
import { PublicHeader, Footer } from '@/components/layout'
import { Button, Card } from '@/components/ui'
import { motion } from 'framer-motion'

interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  priceLabel: string | null
  features: string[]
  isPopular: boolean
  isActive: boolean
  order: number
}

const faqs = [
  {
    question: 'How long does it take to create a virtual tour?',
    answer: 'Standard delivery is 14-30 days depending on your package. Rush delivery is available for Enterprise clients. The timeline includes on-site capture, processing, and quality review.',
  },
  {
    question: 'What equipment do you use?',
    answer: 'We use professional-grade 360° cameras and equipment to capture high-resolution imagery. Our team brings all necessary equipment to your location.',
  },
  {
    question: 'Can I update my tour after delivery?',
    answer: 'Yes! We offer tour updates and modifications at an hourly rate. Enterprise clients receive included update hours as part of their package.',
  },
  {
    question: 'Do you travel for on-site captures?',
    answer: 'We serve clients locally and can travel for projects. Travel fees may apply for locations outside our standard service area.',
  },
  {
    question: 'How do I embed the tour on my website?',
    answer: 'We provide simple embed codes that work with any website. Just copy and paste the code, and your tour will be live. We also offer integration support.',
  },
  {
    question: 'What industries do you serve?',
    answer: 'We work with real estate agents, hotels, restaurants, retail stores, event venues, museums, educational institutions, and more. Any space can benefit from a virtual tour!',
  },
]

export default function PricingPage() {
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch('/api/pricing')
        if (res.ok) {
          const data = await res.json()
          setPricingPlans(data)
        }
      } catch (error) {
        console.error('Failed to fetch pricing:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPricing()
  }, [])

  // Format price for display
  const formatPrice = (price: number) => {
    if (price === 0) return 'Custom'
    return `€${price}`
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
              Simple, Transparent <span className="text-gold">Pricing</span>
            </h1>
            <p className="text-body-lg text-cream-muted max-w-2xl mx-auto">
              Choose the package that fits your needs. All plans include professional
              capture, processing, hosting, and ongoing support.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-navy-dark/50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : pricingPlans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-cream-muted">No pricing plans available at the moment.</p>
              <Link href="/contact">
                <Button className="mt-4">Contact Us for Pricing</Button>
              </Link>
            </div>
          ) : (
            <div className={`grid gap-8 ${
              pricingPlans.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' :
              pricingPlans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' :
              'md:grid-cols-3'
            }`}>
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="flex items-center gap-1 bg-gold text-navy px-4 py-1 rounded-full text-sm font-semibold">
                        <Sparkles className="w-4 h-4" />
                        Most Popular
                      </div>
                    </div>
                  )}
                  <Card
                    className={`p-8 h-full flex flex-col ${
                      plan.isPopular ? 'border-gold ring-2 ring-gold/20' : ''
                    }`}
                  >
                    <div className="mb-6">
                      <h3 className="text-h3 font-bold text-cream mb-2">{plan.name}</h3>
                      <p className="text-body text-cream-muted">{plan.description}</p>
                    </div>

                    <div className="mb-6">
                      <span className="text-display font-bold text-gold">{formatPrice(plan.price)}</span>
                      {plan.priceLabel && (
                        <span className="text-body text-cream-muted ml-2">{plan.priceLabel}</span>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                          <span className="text-body text-cream-soft">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href="/contact">
                      <Button
                        variant={plan.isPopular ? 'primary' : 'secondary'}
                        className="w-full"
                      >
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-navy-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-display font-bold text-cream mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-body-lg text-cream-muted">
              Everything you need to know about our virtual tour services
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6">
                  <h3 className="text-h4 font-semibold text-cream mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-body text-cream-muted">{faq.answer}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-display font-bold text-cream mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-body-lg text-cream-muted mb-8 max-w-xl mx-auto">
              Let's discuss your project and find the perfect solution for your needs.
            </p>
            <Link href="/contact">
              <Button size="lg">
                Contact Us Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
