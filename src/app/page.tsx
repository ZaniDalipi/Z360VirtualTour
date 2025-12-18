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

// Placeholder data - shown when no database tours exist
const placeholderCategories = [
  { name: 'Real Estate', slug: 'real-estate', tourCount: 0 },
  { name: 'Business', slug: 'business', tourCount: 0 },
  { name: 'Hospitality', slug: 'hospitality', tourCount: 0 },
  { name: 'Automotive', slug: 'automotive', tourCount: 0 },
  { name: 'Education', slug: 'education', tourCount: 0 },
  { name: 'Healthcare', slug: 'healthcare', tourCount: 0 },
]

const placeholderTours = [
  {
    id: 'placeholder-1',
    title: 'Your First Tour',
    slug: 'placeholder',
    clientName: 'Add tours from admin panel',
    location: 'Your location',
    coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    category: { name: 'Real Estate' },
  },
  {
    id: 'placeholder-2',
    title: 'Business Space Tour',
    slug: 'placeholder',
    clientName: 'Create via /admin',
    location: 'Your city',
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    category: { name: 'Business' },
  },
  {
    id: 'placeholder-3',
    title: 'Hospitality Showcase',
    slug: 'placeholder',
    clientName: 'Coming soon...',
    location: 'Your region',
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    category: { name: 'Hospitality' },
  },
]

const placeholderTestimonials = [
  {
    id: 'placeholder-1',
    clientName: 'Your Client Name',
    clientTitle: 'Client Title',
    content: 'Add testimonials through the admin panel to showcase your client feedback here.',
    rating: 5,
  },
  {
    id: 'placeholder-2',
    clientName: 'Happy Customer',
    clientTitle: 'Business Owner',
    content: 'Testimonials help build trust. Add real reviews from your satisfied clients.',
    rating: 5,
  },
  {
    id: 'placeholder-3',
    clientName: 'Satisfied Client',
    clientTitle: 'Property Manager',
    content: 'Showcase your best reviews here to convert more visitors into clients.',
    rating: 5,
  },
]

const stats = [
  { value: '500+', label: 'Tours Created' },
  { value: '200+', label: 'Happy Clients' },
  { value: '50+', label: 'Cities Covered' },
  { value: '98%', label: 'Client Satisfaction' },
]

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

export default function HomePage() {
  const [tours, setTours] = useState<Tour[]>(placeholderTours)
  const [categories, setCategories] = useState<Category[]>(placeholderCategories)
  const [testimonials] = useState<Testimonial[]>(placeholderTestimonials)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured tours
        const toursRes = await fetch('/api/tours?featured=true&limit=3')
        if (toursRes.ok) {
          const toursData = await toursRes.json()
          if (toursData.length > 0) {
            setTours(toursData)
          }
        }

        // Fetch categories
        const catsRes = await fetch('/api/categories')
        if (catsRes.ok) {
          const catsData = await catsRes.json()
          if (catsData.length > 0) {
            setCategories(catsData)
          }
        }
      } catch (error) {
        // Keep using placeholder data
        console.log('Using placeholder data')
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-2 mb-6">
                <Eye className="w-4 h-4 text-gold" />
                <span className="text-caption text-gold">Professional 360° Virtual Tours</span>
              </div>

              <h1 className="text-display-xl md:text-[64px] font-bold text-cream leading-tight mb-6">
                Bring Your Space
                <span className="text-gold"> to Life</span>
              </h1>

              <p className="text-body-lg text-cream-soft mb-8 max-w-xl">
                Immersive 360° virtual tours for real estate, businesses, hospitality, and more.
                Captivate your audience and showcase every detail of your space.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/tours">
                  <Button size="lg" className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    View Portfolio
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="secondary" size="lg">
                    Get a Free Quote
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 pt-8 border-t border-gold/10">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-h2 font-bold text-gold">{stat.value}</p>
                    <p className="text-caption text-cream-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-square">
                <div className="absolute inset-4 rounded-2xl overflow-hidden border border-gold/20">
                  <Image
                    src={tours[0]?.coverImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'}
                    alt="Virtual Tour Preview"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />

                  {/* Play Button Overlay */}
                  <Link
                    href={tours[0]?.tourUrl || (tours[0]?.slug && tours[0]?.slug !== 'placeholder' ? `/tour/${tours[0].slug}` : '/tours')}
                    target={tours[0]?.tourUrl ? '_blank' : undefined}
                    rel={tours[0]?.tourUrl ? 'noopener noreferrer' : undefined}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-gold/90 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-glow">
                      <Play className="w-8 h-8 text-navy ml-1" fill="currentColor" />
                    </div>
                  </Link>

                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-caption text-cream-muted">Featured Tour</p>
                    <p className="text-h4 font-semibold text-cream">{tours[0]?.title || 'Your Featured Tour'}</p>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 border border-gold/30 rounded-2xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 border border-gold/20 rounded-2xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-navy-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-display font-bold text-cream mb-4">
              Industries We Serve
            </h2>
            <p className="text-body-lg text-cream-muted max-w-2xl mx-auto">
              From real estate to hospitality, we create stunning virtual experiences for every industry
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

      {/* Featured Tours Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <h2 className="text-display font-bold text-cream mb-4">
                Featured Tours
              </h2>
              <p className="text-body-lg text-cream-muted max-w-xl">
                Explore some of our recent projects and see the quality we deliver
              </p>
            </div>
            <Link href="/tours" className="hidden md:flex items-center gap-2 text-gold hover:text-gold-soft transition-colors">
              View All <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour, index) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={tour.slug === 'placeholder' ? '/admin' : `/tour/${tour.slug}`}>
                  <Card className="overflow-hidden group cursor-pointer hover:border-gold/30 transition-all">
                    <div className="relative h-56">
                      <Image
                        src={tour.coverImage}
                        alt={tour.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-transparent" />

                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center shadow-glow">
                          <Play className="w-6 h-6 text-navy ml-0.5" fill="currentColor" />
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-gold text-navy text-caption font-semibold px-3 py-1 rounded-full">
                          {tour.category.name}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-h3 font-semibold text-cream mb-2 group-hover:text-gold transition-colors">
                        {tour.title}
                      </h3>
                      <p className="text-body text-cream-muted mb-1">{tour.clientName}</p>
                      <p className="text-caption text-cream-dim">{tour.location}</p>
                    </div>
                  </Card>
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

      {/* Testimonials Section */}
      <section className="py-20 bg-navy-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-display font-bold text-cream mb-4">
              What Our Clients Say
            </h2>
            <p className="text-body-lg text-cream-muted max-w-2xl mx-auto">
              Don't just take our word for it - hear from businesses we've helped
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
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
                    <p className="text-caption text-cream-muted">{testimonial.clientTitle}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-navy-medium to-navy-dark border-gold/20">
              <h2 className="text-display font-bold text-cream mb-4">
                Ready to Showcase Your Space?
              </h2>
              <p className="text-body-lg text-cream-muted mb-8 max-w-xl mx-auto">
                Let's create an immersive virtual tour that captivates your audience and drives results.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/contact">
                  <Button size="lg">Get Started Today</Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="secondary" size="lg">View Pricing</Button>
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
