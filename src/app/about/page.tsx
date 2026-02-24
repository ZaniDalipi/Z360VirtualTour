'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Eye, Target, Award, Users, CheckCircle } from 'lucide-react'
import { PublicHeader, Footer } from '@/components/layout'
import { Button, Card } from '@/components/ui'
import { motion } from 'framer-motion'

const values = [
  {
    icon: Eye,
    title: 'Immersive Quality',
    description: 'We deliver stunning, high-resolution 360° tours that capture every detail of your space.',
  },
  {
    icon: Target,
    title: 'Results-Driven',
    description: 'Our tours are designed to engage viewers and convert them into customers.',
  },
  {
    icon: Award,
    title: 'Professional Service',
    description: 'From capture to delivery, we maintain the highest standards of professionalism.',
  },
  {
    icon: Users,
    title: 'Client-Focused',
    description: 'Your success is our priority. We work closely with you to exceed expectations.',
  },
]

const process = [
  {
    step: '01',
    title: 'Consultation',
    description: 'We discuss your needs, understand your space, and plan the perfect tour strategy.',
  },
  {
    step: '02',
    title: 'Capture',
    description: 'Our team arrives with professional equipment to capture stunning 360° imagery.',
  },
  {
    step: '03',
    title: 'Production',
    description: 'We process and enhance your images, adding hotspots, navigation, and branding.',
  },
  {
    step: '04',
    title: 'Delivery',
    description: 'Your tour goes live with hosting, analytics, and ongoing support included.',
  },
]

const features = [
  'High-resolution 360° photography',
  'Interactive hotspots and navigation',
  'Mobile-friendly responsive tours',
  'Custom branding and styling',
  'Social media sharing integration',
  'Google Street View publishing',
  'Lead capture forms',
  'Analytics and insights',
  'Fast turnaround times',
  'Dedicated support',
]

export default function AboutPage() {
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
              <h1 className="text-h1 sm:text-display font-bold text-cream mb-4 sm:mb-6">
                Bringing Spaces <span className="text-gold">to Life</span>
              </h1>
              <p className="text-body sm:text-body-lg text-cream-soft mb-6 sm:mb-8 leading-relaxed">
                Z360 Virtual Tours is a professional 360° virtual tour service helping businesses
                showcase their spaces in stunning, immersive detail. From real estate to hospitality,
                we create engaging virtual experiences that captivate your audience and drive results.
              </p>
              <p className="text-body text-cream-muted mb-6 sm:mb-8 leading-relaxed">
                Founded with a passion for visual storytelling, we combine cutting-edge technology
                with creative expertise to deliver virtual tours that make a lasting impression.
                Our mission is simple: help businesses connect with their audience through immersive
                experiences that showcase the true essence of their spaces.
              </p>
              <Link href="/contact" className="inline-block w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">Work With Us</Button>
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
            <h2 className="text-h1 sm:text-display font-bold text-cream mb-3 sm:mb-4">
              Our Values
            </h2>
            <p className="text-body sm:text-body-lg text-cream-muted max-w-2xl mx-auto">
              What drives us to deliver exceptional virtual tour experiences
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.title}
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
            <h2 className="text-h1 sm:text-display font-bold text-cream mb-3 sm:mb-4">
              Our Process
            </h2>
            <p className="text-body sm:text-body-lg text-cream-muted max-w-2xl mx-auto">
              A seamless experience from start to finish
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {process.map((step, index) => (
              <motion.div
                key={step.step}
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
              <h2 className="text-h1 sm:text-display font-bold text-cream mb-4 sm:mb-6">
                What&apos;s Included
              </h2>
              <p className="text-body sm:text-body-lg text-cream-muted mb-6 sm:mb-8">
                Every tour comes packed with features to help you succeed
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature}
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
            <h2 className="text-h1 sm:text-display font-bold text-cream mb-3 sm:mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-body sm:text-body-lg text-cream-muted mb-6 sm:mb-8 max-w-xl mx-auto">
              Let&apos;s discuss how we can help showcase your space with an immersive virtual tour.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
              <Link href="/contact" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">Contact Us</Button>
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">View Pricing</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
