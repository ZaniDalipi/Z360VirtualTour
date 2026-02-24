'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import Image from 'next/image'
import {
  Eye, Star, Home, Building2, Hotel, Car, GraduationCap, Heart,
  Play, ArrowRight, Quote, Users
} from 'lucide-react'
import { PublicHeader, Footer, Navbar } from '@/components/layout'
import { Button, Card } from '@/components/ui'
import { FeaturedCarousel, MobileFeaturedSlider } from '@/components/home'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

// Icon mapping for categories
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'real-estate': Home,
  'business': Building2,
  'hospitality': Hotel,
  'automotive': Car,
  'education': GraduationCap,
  'healthcare': Heart,
}

interface Tour {
  id: string
  title: string
  slug: string
  clientName: string | null
  location: string | null
  coverImage: string
  tourUrl: string | null
  category: { name: string }
}

interface Category {
  id?: string
  name: string
  slug: string
  tourCount: number
}

interface Testimonial {
  id: string
  clientName: string
  clientTitle: string | null
  content: string
  rating: number
}

interface Stats {
  totalTours: number
  totalCategories: number
  totalViews: number
}

export default function HomePage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [stats, setStats] = useState<Stats>({ totalTours: 0, totalCategories: 0, totalViews: 0 })
  const [isLoading, setIsLoading] = useState(true)

  const tHero = useTranslations('hero')
  const tIndustries = useTranslations('industries')
  const tFeatured = useTranslations('featured')
  const tTestimonials = useTranslations('testimonials')
  const tPartners = useTranslations('partners')
  const tCta = useTranslations('cta')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured tours
        const toursRes = await fetch('/api/tours?featured=true&limit=6')
        if (toursRes.ok) {
          const toursData = await toursRes.json()
          setTours(toursData)
        }

        // Fetch categories
        const catsRes = await fetch('/api/categories')
        if (catsRes.ok) {
          const catsData = await catsRes.json()
          setCategories(catsData)
        }

        // Fetch testimonials
        const testimonialsRes = await fetch('/api/testimonials')
        if (testimonialsRes.ok) {
          const testimonialsData = await testimonialsRes.json()
          setTestimonials(testimonialsData)
        }

        // Fetch stats
        const statsRes = await fetch('/api/stats')
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-navy overflow-x-hidden">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative w-full" style={{ overflow: 'hidden' }}>
        {/* Background Elements - contained within section */}
        <div className="absolute inset-0 bg-gradient-radial opacity-30 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(201, 169, 98, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201, 169, 98, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
                <Eye className="w-4 h-4 text-gold" />
                <span className="text-caption text-gold">{tHero('badge')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[64px] font-bold text-cream leading-tight mb-4 sm:mb-6">
                {tHero('title')}
                <span className="text-gold"> {tHero('titleHighlight')}</span>
              </h1>

              <p className="text-body-lg text-cream-soft mb-8 max-w-xl">
                {tHero('description')}
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <Link href="/tours" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto flex items-center justify-center gap-2">
                    <Play className="w-5 h-5" />
                    {tHero('viewPortfolio')}
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="secondary" size="lg">
                    {tHero('getFreeQuote')}
                  </Button>
                </Link>
              </div>

              {/* Dynamic Stats */}
              {(stats.totalTours > 0 || stats.totalViews > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gold/10">
                  {stats.totalTours > 0 && (
                    <div>
                      <p className="text-h2 font-bold text-gold">{stats.totalTours}</p>
                      <p className="text-caption text-cream-muted">{tHero('toursCreated')}</p>
                    </div>
                  )}
                  {categories.length > 0 && (
                    <div>
                      <p className="text-h2 font-bold text-gold">{categories.length}</p>
                      <p className="text-caption text-cream-muted">{tHero('categories')}</p>
                    </div>
                  )}
                  {stats.totalViews > 0 && (
                    <div>
                      <p className="text-h2 font-bold text-gold">{stats.totalViews.toLocaleString()}</p>
                      <p className="text-caption text-cream-muted">{tHero('totalViews')}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Hero Carousel - Hidden on mobile, visible on large screens */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden md:block"
            >
              <FeaturedCarousel tours={tours} />
            </motion.div>

            {/* Mobile Featured Slider */}
            {tours.length > 0 && (
              <div className="lg:hidden">
                <MobileFeaturedSlider tours={tours} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categories Section - Only show if categories exist */}
      {categories.length > 0 && (
        <section className="py-12 sm:py-16 md:py-20 bg-navy-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 md:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-display font-bold text-cream mb-2 md:mb-4">
                {tIndustries('title')}
              </h2>
              <p className="text-sm sm:text-base md:text-body-lg text-cream-muted max-w-2xl mx-auto px-4">
                {tIndustries('description')}
              </p>
            </motion.div>

            {/* Mobile: Horizontal scroll, Tablet+: Grid */}
            <div className="md:hidden">
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 snap-x snap-mandatory">
                {categories.map((category, index) => {
                  const Icon = categoryIcons[category.slug] || Home
                  return (
                    <motion.div
                      key={category.slug}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="flex-shrink-0 w-[140px] snap-start"
                    >
                      <Link href={`/tours?category=${category.slug}`}>
                        <Card className="p-4 text-center hover:border-gold/30 transition-all active:scale-95">
                          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-3">
                            <Icon className="w-6 h-6 text-gold" />
                          </div>
                          <h3 className="text-sm font-semibold text-cream mb-0.5 line-clamp-1">{category.name}</h3>
                          <p className="text-xs text-cream-muted">{category.tourCount} tours</p>
                        </Card>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Tablet+ Grid */}
            <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => {
                const Icon = categoryIcons[category.slug] || Home
                return (
                  <motion.div
                    key={category.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/tours?category=${category.slug}`}>
                      <Card className="p-6 text-center hover:border-gold/30 transition-all hover:-translate-y-1">
                        <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                          <Icon className="w-7 h-7 text-gold" />
                        </div>
                        <h3 className="text-h4 font-semibold text-cream mb-1">{category.name}</h3>
                        <p className="text-caption text-cream-muted">{category.tourCount} {tIndustries('tours')}</p>
                      </Card>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Tours Section - Only show if tours exist */}
      {tours.length > 0 && (
        <section className="py-12 sm:py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-12"
            >
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-display font-bold text-cream mb-2 md:mb-4">
                  {tFeatured('title')}
                </h2>
                <p className="text-sm sm:text-base md:text-body-lg text-cream-muted max-w-xl">
                  {tFeatured('description')}
                </p>
              </div>
              <Link href="/tours" className="hidden sm:flex items-center gap-2 text-gold hover:text-gold-soft transition-colors whitespace-nowrap">
                {tFeatured('viewAll')} <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {tours.map((tour, index) => (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group"
                >
                  <Link href={`/tour/${tour.slug}`}>
                    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-navy-medium to-navy-dark border border-gold/10
                                    hover:border-gold/40 transition-all duration-500 hover:shadow-2xl hover:shadow-gold/10
                                    active:scale-[0.98] md:hover:-translate-y-2">
                      {/* Image Container */}
                      <div className="relative h-48 sm:h-56 md:h-60 overflow-hidden">
                        <Image
                          src={tour.coverImage}
                          alt={tour.title}
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-110"
                        />

                        {/* Gradient Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/60 via-30% to-transparent" />
                        <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/5 transition-colors duration-500" />

                        {/* Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative transform transition-all duration-300 group-hover:scale-110">
                            <div className="absolute -inset-2 rounded-full bg-gold/20 animate-pulse" />
                            <div className="relative w-12 h-12 sm:w-14 md:w-16 sm:h-14 md:h-16 rounded-full bg-gradient-to-br from-gold to-gold-soft
                                            flex items-center justify-center shadow-lg group-hover:shadow-gold/40
                                            backdrop-blur-sm border border-gold/20">
                              <Play className="w-5 h-5 sm:w-6 md:w-7 sm:h-6 md:h-7 text-navy ml-0.5" fill="currentColor" />
                            </div>
                          </div>
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                          <span className="bg-gold/90 backdrop-blur-sm text-navy text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-lg">
                            {tour.category.name}
                          </span>
                        </div>

                        {/* 360° indicator */}
                        <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                          <span className="bg-navy/70 backdrop-blur-sm text-cream text-xs font-medium px-2 py-1 rounded-lg border border-cream/10">
                            360°
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-5">
                        <h3 className="text-base sm:text-lg font-bold text-cream mb-2 group-hover:text-gold transition-colors duration-300 line-clamp-1">
                          {tour.title}
                        </h3>

                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            {tour.clientName && (
                              <p className="text-xs sm:text-sm text-cream-muted truncate">{tour.clientName}</p>
                            )}
                            {tour.location && (
                              <p className="text-xs text-cream-dim flex items-center gap-1 mt-0.5 sm:mt-1">
                                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate">{tour.location}</span>
                              </p>
                            )}
                          </div>

                          {/* Arrow indicator */}
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gold/10 flex items-center justify-center
                                          group-hover:bg-gold transition-all duration-300 flex-shrink-0 ml-3">
                            <ArrowRight className="w-4 h-4 text-gold group-hover:text-navy transition-colors" />
                          </div>
                        </div>
                      </div>

                      {/* Bottom border glow */}
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/0 to-transparent
                                      group-hover:via-gold/60 transition-all duration-500" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Link href="/tours">
                <Button variant="secondary">{tFeatured('viewAllTours')}</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section - Only show if testimonials exist */}
      {testimonials.length > 0 && (
        <section className="py-12 sm:py-16 md:py-20 bg-navy-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 md:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-display font-bold text-cream mb-2 md:mb-4">
                {tTestimonials('title')}
              </h2>
              <p className="text-sm sm:text-base md:text-body-lg text-cream-muted max-w-2xl mx-auto px-4">
                {tTestimonials('description')}
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full">
                    <Quote className="w-10 h-10 text-gold/30 mb-4" />
                    <p className="text-body text-cream-soft mb-6 leading-relaxed">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-gold fill-gold" />
                      ))}
                    </div>
                    <div>
                      <p className="text-h4 font-semibold text-cream">{testimonial.clientName}</p>
                      {testimonial.clientTitle && (
                        <p className="text-caption text-cream-muted">{testimonial.clientTitle}</p>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Partners Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
              <Users className="w-4 h-4 text-gold" />
              <span className="text-xs sm:text-caption text-gold">{tPartners('badge')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-display font-bold text-cream mb-2 md:mb-4">
              {tPartners('title')}
            </h2>
            <p className="text-sm sm:text-base md:text-body-lg text-cream-muted max-w-2xl mx-auto px-4">
              {tPartners('description')}
            </p>
          </motion.div>

          {/* Partner Logos Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {[
              { name: 'Google Street View', description: tPartners('googleDesc') },
              { name: 'Matterport', description: tPartners('matterportDesc') },
              { name: 'Kuula', description: tPartners('kuulaDesc') },
              { name: 'Cloudpano', description: tPartners('cloudpanoDesc') },
              { name: 'ThreeSixty Tours', description: tPartners('threesixtyDesc') },
            ].map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-3 sm:p-4 md:p-6 text-center hover:border-gold/30 transition-all group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 group-hover:bg-gold/20 transition-colors">
                    <span className="text-lg sm:text-xl md:text-2xl font-bold text-gold">{partner.name.charAt(0)}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-cream mb-0.5 sm:mb-1 line-clamp-2">{partner.name}</h3>
                  <p className="text-[10px] sm:text-xs text-cream-muted hidden sm:block">{partner.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Partnership CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-cream-muted mb-4">{tPartners('becomePartner')}</p>
            <Link href="/contact">
              <Button variant="secondary">{tPartners('contactUs')}</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-navy-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 sm:p-8 md:p-12 text-center bg-gradient-to-br from-navy-medium to-navy-dark border-gold/20">
              <h2 className="text-xl sm:text-2xl md:text-display font-bold text-cream mb-2 md:mb-4">
                {tCta('title')}
              </h2>
              <p className="text-sm sm:text-base md:text-body-lg text-cream-muted mb-6 md:mb-8 max-w-xl mx-auto">
                {tCta('description')}
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
                <Link href="/contact">
                  <Button size="lg" className="w-full sm:w-auto">{tCta('getStarted')}</Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">{tCta('viewPricing')}</Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Mobile Bottom Navigation */}
      <Navbar />
    </div>
  )
}
