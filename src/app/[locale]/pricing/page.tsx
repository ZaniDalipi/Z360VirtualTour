'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import { Check, ArrowRight, Sparkles } from 'lucide-react'
import { PublicHeader, Footer } from '@/components/layout'
import { Button, Card } from '@/components/ui'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

interface PricingPlan {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  isPopular: boolean
  displayOrder: number
}

export default function PricingPage() {
  const t = useTranslations('pricing')
  const tCta = useTranslations('cta')
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch('/api/pricing')
        if (res.ok) {
          const data = await res.json()
          // Sort by displayOrder and mark popular
          const sortedPlans = data.sort((a: PricingPlan, b: PricingPlan) =>
            (a.displayOrder || 0) - (b.displayOrder || 0)
          )
          setPricingPlans(sortedPlans)
        }
      } catch (error) {
        console.error('Failed to fetch pricing:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPricing()
  }, [])

  const faqs = [
    { question: t('faqs.q1'), answer: t('faqs.a1') },
    { question: t('faqs.q2'), answer: t('faqs.a2') },
    { question: t('faqs.q3'), answer: t('faqs.a3') },
    { question: t('faqs.q4'), answer: t('faqs.a4') },
    { question: t('faqs.q5'), answer: t('faqs.a5') },
    { question: t('faqs.q6'), answer: t('faqs.a6') },
  ]

  return (
    <div className="min-h-screen bg-navy">
      <PublicHeader />

      {/* Hero */}
      <section className="relative py-12 sm:py-16 md:py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-display font-bold text-cream mb-3 sm:mb-4 md:mb-6">
              {t('heroTitle')} <span className="text-gold">{t('heroTitleHighlight')}</span>
            </h1>
            <p className="text-sm sm:text-base md:text-body-lg text-cream-muted max-w-2xl mx-auto px-2">
              {t('description')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 sm:py-12 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 sm:h-96 bg-gold/10 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : pricingPlans.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-cream-muted text-sm sm:text-base">{t('description')}</p>
              <Link href="/contact" className="mt-4 inline-block">
                <Button>{tCta('contactUs')}</Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
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
                        {t('mostPopular')}
                      </div>
                    </div>
                  )}
                  <Card
                    className={`p-4 sm:p-6 md:p-8 h-full flex flex-col ${
                      plan.isPopular ? 'border-gold ring-2 ring-gold/20' : ''
                    }`}
                  >
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl md:text-h3 font-bold text-cream mb-1 sm:mb-2">{plan.name}</h3>
                      <p className="text-sm sm:text-body text-cream-muted">{plan.description}</p>
                    </div>

                    <div className="mb-4 sm:mb-6">
                      <span className="text-2xl sm:text-3xl md:text-display font-bold text-gold">€{plan.price}</span>
                      <span className="text-sm sm:text-body text-cream-muted ml-2">{t('perTour')}</span>
                    </div>

                    {plan.features && plan.features.length > 0 && (
                      <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 flex-1">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 sm:gap-3">
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-gold flex-shrink-0 mt-0.5" />
                            <span className="text-sm sm:text-body text-cream-soft">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <Link href="/contact">
                      <Button
                        variant={plan.isPopular ? 'primary' : 'secondary'}
                        className="w-full"
                      >
                        {t('getStarted')}
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
      <section className="py-12 sm:py-16 md:py-20 bg-navy-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-display font-bold text-cream mb-2 md:mb-4">
              {t('faqTitle')}
            </h2>
            <p className="text-sm sm:text-base md:text-body-lg text-cream-muted px-2">
              {t('faqDescription')}
            </p>
          </motion.div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg md:text-h4 font-semibold text-cream mb-1 sm:mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-sm sm:text-body text-cream-muted">{faq.answer}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xl sm:text-2xl md:text-display font-bold text-cream mb-2 md:mb-4">
              {tCta('readyToStart')}
            </h2>
            <p className="text-sm sm:text-base md:text-body-lg text-cream-muted mb-6 md:mb-8 max-w-xl mx-auto">
              {tCta('discussProject')}
            </p>
            <Link href="/contact">
              <Button size="lg" className="w-full sm:w-auto">
                {tCta('contactUs')}
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
