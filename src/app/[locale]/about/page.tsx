'use client'

import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { Eye, Target, Award, Users, CheckCircle } from 'lucide-react'
import { PublicHeader, Footer } from '@/components/layout'
import { Button, Card } from '@/components/ui'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

export default function AboutPage() {
  const t = useTranslations('about')
  const tCta = useTranslations('cta')

  const values = [
    {
      icon: Eye,
      title: t('values.quality'),
      description: t('values.qualityDesc'),
    },
    {
      icon: Target,
      title: t('values.results'),
      description: t('values.resultsDesc'),
    },
    {
      icon: Award,
      title: t('values.professional'),
      description: t('values.professionalDesc'),
    },
    {
      icon: Users,
      title: t('values.clientFocused'),
      description: t('values.clientFocusedDesc'),
    },
  ]

  const process = [
    {
      step: t('process.step1'),
      title: t('process.consultation'),
      description: t('process.consultationDesc'),
    },
    {
      step: t('process.step2'),
      title: t('process.capture'),
      description: t('process.captureDesc'),
    },
    {
      step: t('process.step3'),
      title: t('process.production'),
      description: t('process.productionDesc'),
    },
    {
      step: t('process.step4'),
      title: t('process.delivery'),
      description: t('process.deliveryDesc'),
    },
  ]

  const features = [
    t('features.highRes'),
    t('features.hotspots'),
    t('features.mobile'),
    t('features.branding'),
    t('features.social'),
    t('features.streetView'),
    t('features.leadCapture'),
    t('features.analytics'),
    t('features.fastDelivery'),
    t('features.support'),
  ]

  return (
    <div className="min-h-screen bg-navy">
      <PublicHeader />

      {/* Hero */}
      <section className="relative py-12 sm:py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-display font-bold text-cream mb-6">
                {t('heroTitle')} <span className="text-gold">{t('heroTitleHighlight')}</span>
              </h1>
              <p className="text-body-lg text-cream-soft mb-8 leading-relaxed">
                {t('heroDescription')}
              </p>
              <p className="text-body text-cream-muted mb-8 leading-relaxed">
                {t('heroDescription2')}
              </p>
              <Link href="/contact">
                <Button size="lg">{t('workWithUs')}</Button>
              </Link>
            </motion.div>

            {/* Image - visible on md+ instead of lg+ */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative hidden md:block"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gold/20">
                <Image
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
                  alt="Our Work"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -right-4 lg:-bottom-6 lg:-right-6 w-32 h-32 lg:w-48 lg:h-48 border border-gold/30 rounded-2xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 sm:py-16 md:py-20 bg-navy-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-display font-bold text-cream mb-4">
              {t('valuesTitle')}
            </h2>
            <p className="text-body-lg text-cream-muted max-w-2xl mx-auto">
              {t('valuesDescription')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 sm:p-6 text-center h-full">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-gold" />
                    </div>
                    <h3 className="text-body-lg sm:text-h4 font-semibold text-cream mb-1.5 sm:mb-2">{value.title}</h3>
                    <p className="text-caption sm:text-body text-cream-muted">{value.description}</p>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-display font-bold text-cream mb-4">
              {t('processTitle')}
            </h2>
            <p className="text-body-lg text-cream-muted max-w-2xl mx-auto">
              {t('processDescription')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {process.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gold/20" />
                )}
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gold/10 border-2 border-gold flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-body-lg sm:text-h3 font-bold text-gold">{step.step}</span>
                  </div>
                  <h3 className="text-body-lg sm:text-h4 font-semibold text-cream mb-1.5 sm:mb-2 text-center">{step.title}</h3>
                  <p className="text-caption sm:text-body text-cream-muted text-center">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 md:py-20 bg-navy-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-display font-bold text-cream mb-6">
                {t('featuresTitle')}
              </h2>
              <p className="text-body-lg text-cream-muted mb-8">
                {t('featuresDescription')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2.5 sm:gap-3"
                  >
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gold flex-shrink-0" />
                    <span className="text-caption sm:text-body text-cream-soft">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Image - visible on md+ instead of lg+ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative hidden md:block"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-gold/20">
                <Image
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"
                  alt="Features"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
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
            <h2 className="text-display font-bold text-cream mb-4">
              {tCta('readyToStart')}
            </h2>
            <p className="text-body-lg text-cream-muted mb-8 max-w-xl mx-auto">
              {tCta('discussProject')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button size="lg">{tCta('contactUs')}</Button>
              </Link>
              <Link href="/pricing">
                <Button variant="secondary" size="lg">{tCta('viewPricing')}</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
