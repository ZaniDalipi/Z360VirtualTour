'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Eye, Star, Home, Building2, Hotel, Car, GraduationCap, Heart,
  Play, ArrowRight, Quote
} from 'lucide-react'
import { PublicHeader, Footer } from '@/components/layout'
import { Button, Card } from '@/components/ui'
import { FeaturedCarousel } from '@/components/home'
import { motion } from 'framer-motion'

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
    <div className="min-h-screen bg-navy">
      <PublicHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(201, 169, 98, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201, 169, 98, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
                <Eye className="w-4 h-4 text-gold" />
                <span className="text-caption text-gold">Professional 360° Virtual Tours</span>
              </div>

              <h1 className="text-[32px] sm:text-display-xl md:text-[56px] lg:text-[64px] font-bold text-cream leading-tight mb-4 sm:mb-6">
                Bring Your Space
                <span className="text-gold"> to Life</span>
              </h1>

              <p className="text-body sm:text-body-lg text-cream-soft mb-6 sm:mb-8 max-w-xl">
                Immersive 360° virtual tours for real estate, businesses, hospitality, and more.
                Captivate your audience and showcase every detail of your space.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <Link href="/tours" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto flex items-center justify-center gap-2">
                    <Play className="w-5 h-5" />
                    View Portfolio
                  </Button>
                </Link>
                <Link href="/contact" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Get a Free Quote
                  </Button>
                </Link>
              </div>

              {/* Dynamic Stats */}
              {(stats.totalTours > 0 || stats.totalViews > 0) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gold/10">
                  {stats.totalTours > 0 && (
                    <div>
                      <p className="text-h3 sm:text-h2 font-bold text-gold">{stats.totalTours}</p>
                      <p className="text-caption text-cream-muted">Tours Created</p>
                    </div>
                  )}
                  {categories.length > 0 && (
                    <div>
                      <p className="text-h3 sm:text-h2 font-bold text-gold">{categories.length}</p>
                      <p className="text-caption text-cream-muted">Categories</p>
                    </div>
                  )}
                  {stats.totalViews > 0 && (
                    <div>
                      <p className="text-h3 sm:text-h2 font-bold text-gold">{stats.totalViews.toLocaleString()}</p>
                      <p className="text-caption text-cream-muted">Total Views</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Hero Carousel - visible on all screen sizes */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative mt-4 lg:mt-0"
            >
              <FeaturedCarousel tours={tours} />
            </motion.div>
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
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-h1 sm:text-display font-bold text-cream mb-3 sm:mb-4">
                Industries We Serve
              </h2>
              <p className="text-body sm:text-body-lg text-cream-muted max-w-2xl mx-auto">
                From real estate to hospitality, we create stunning virtual experiences for every industry
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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
                        <p className="text-caption text-cream-muted">{category.tourCount} tours</p>
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
              className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-12"
            >
              <div>
                <h2 className="text-h1 sm:text-display font-bold text-cream mb-3 sm:mb-4">
                  Featured Tours
                </h2>
                <p className="text-body sm:text-body-lg text-cream-muted max-w-xl">
                  Explore some of our recent projects and see the quality we deliver
                </p>
              </div>
              <Link href="/tours" className="hidden md:flex items-center gap-2 text-gold hover:text-gold-soft transition-colors flex-shrink-0">
                View All <ArrowRight className="w-5 h-5" />
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
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-medium to-navy-dark border border-gold/10
                                    hover:border-gold/40 transition-all duration-500 hover:shadow-2xl hover:shadow-gold/10
                                    hover:-translate-y-2">
                      {/* Image Container */}
                      <div className="relative h-60 overflow-hidden">
                        <Image
                          src={tour.coverImage}
                          alt={tour.title}
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-110"
                        />

                        {/* Gradient Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/60 via-30% to-transparent" />
                        <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/5 transition-colors duration-500" />

                        {/* Play Button - Always visible but enhanced on hover */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative transform transition-all duration-300 group-hover:scale-110">
                            <div className="absolute -inset-2 rounded-full bg-gold/20 animate-pulse" />
                            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-soft
                                            flex items-center justify-center shadow-lg group-hover:shadow-gold/40
                                            backdrop-blur-sm border border-gold/20">
                              <Play className="w-7 h-7 text-navy ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="bg-gold/90 backdrop-blur-sm text-navy text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                            {tour.category.name}
                          </span>
                        </div>

                        {/* 360° indicator */}
                        <div className="absolute top-4 right-4">
                          <span className="bg-navy/70 backdrop-blur-sm text-cream text-xs font-medium px-2.5 py-1 rounded-lg border border-cream/10">
                            360°
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-cream mb-2 group-hover:text-gold transition-colors duration-300 line-clamp-1">
                          {tour.title}
                        </h3>

                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            {tour.clientName && (
                              <p className="text-sm text-cream-muted truncate">{tour.clientName}</p>
                            )}
                            {tour.location && (
                              <p className="text-xs text-cream-dim flex items-center gap-1 mt-1">
                                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate">{tour.location}</span>
                              </p>
                            )}
                          </div>

                          {/* Arrow indicator */}
                          <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center
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

            <div className="text-center mt-8 md:hidden">
              <Link href="/tours">
                <Button variant="secondary">View All Tours</Button>
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
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-h1 sm:text-display font-bold text-cream mb-3 sm:mb-4">
                What Our Clients Say
              </h2>
              <p className="text-body sm:text-body-lg text-cream-muted max-w-2xl mx-auto">
                Don&apos;t just take our word for it - hear from businesses we&apos;ve helped
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 sm:p-8 md:p-12 text-center bg-gradient-to-br from-navy-medium to-navy-dark border-gold/20">
              <h2 className="text-h1 sm:text-display font-bold text-cream mb-3 sm:mb-4">
                Ready to Showcase Your Space?
              </h2>
              <p className="text-body sm:text-body-lg text-cream-muted mb-6 sm:mb-8 max-w-xl mx-auto">
                Let&apos;s create an immersive virtual tour that captivates your audience and drives results.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
                <Link href="/contact" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">Get Started Today</Button>
                </Link>
                <Link href="/pricing" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">View Pricing</Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
