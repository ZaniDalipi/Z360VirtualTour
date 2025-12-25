'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Play, MapPin, Grid, List, Eye, Star, ArrowUpRight } from 'lucide-react'
import { PublicHeader, Footer } from '@/components/layout'
import { Button, Input, Chip } from '@/components/ui'
import { useTourTransition } from '@/components/tour'
import { motion } from 'framer-motion'

// Placeholder data - shown when no database tours exist
const placeholderCategories = [
  { id: 'all', name: 'All Tours', slug: 'all' },
  { id: 'real-estate', name: 'Real Estate', slug: 'real-estate' },
  { id: 'business', name: 'Business', slug: 'business' },
  { id: 'hospitality', name: 'Hospitality', slug: 'hospitality' },
  { id: 'automotive', name: 'Automotive', slug: 'automotive' },
  { id: 'education', name: 'Education', slug: 'education' },
]

const placeholderTours = [
  {
    id: 'placeholder-1',
    title: 'Your First Tour',
    slug: 'placeholder',
    shortDescription: 'Add your first tour from the admin panel',
    clientName: 'Add tours via /admin',
    location: 'Your location',
    coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    category: { name: 'Real Estate', slug: 'real-estate' },
    featured: true,
  },
  {
    id: 'placeholder-2',
    title: 'Business Space Tour',
    slug: 'placeholder',
    shortDescription: 'Showcase your business with 360° tours',
    clientName: 'Create via admin panel',
    location: 'Your city',
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    category: { name: 'Business', slug: 'business' },
    featured: true,
  },
  {
    id: 'placeholder-3',
    title: 'Hospitality Showcase',
    slug: 'placeholder',
    shortDescription: 'Perfect for hotels, restaurants, and venues',
    clientName: 'Coming soon...',
    location: 'Your region',
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    category: { name: 'Hospitality', slug: 'hospitality' },
    featured: true,
  },
  {
    id: 'placeholder-4',
    title: 'Real Estate Property',
    slug: 'placeholder',
    shortDescription: 'Add your property tours here',
    clientName: 'Your client name',
    location: 'Property location',
    coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    category: { name: 'Real Estate', slug: 'real-estate' },
    featured: false,
  },
  {
    id: 'placeholder-5',
    title: 'Coffee Shop Tour',
    slug: 'placeholder',
    shortDescription: 'Perfect for cafes and retail stores',
    clientName: 'Business name',
    location: 'Store location',
    coverImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
    category: { name: 'Business', slug: 'business' },
    featured: false,
  },
  {
    id: 'placeholder-6',
    title: 'Restaurant Tour',
    slug: 'placeholder',
    shortDescription: 'Showcase your dining experience',
    clientName: 'Restaurant name',
    location: 'Restaurant location',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    category: { name: 'Hospitality', slug: 'hospitality' },
    featured: false,
  },
]

interface Tour {
  id: string
  title: string
  slug: string
  shortDescription?: string | null
  clientName: string | null
  location: string | null
  coverImage: string
  category: { name: string; slug: string }
  featured: boolean
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function ToursPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryFromUrl = searchParams.get('category')
  const { startTransition } = useTourTransition()

  const [tours, setTours] = useState<Tour[]>(placeholderTours)
  const [categories, setCategories] = useState<Category[]>(placeholderCategories)
  const [activeCategory, setActiveCategory] = useState(categoryFromUrl || 'all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(true)

  // Handle tour card click with shared element transition
  const handleTourClick = useCallback((e: React.MouseEvent<HTMLDivElement>, tour: Tour) => {
    e.preventDefault()
    const cardElement = e.currentTarget
    const rect = cardElement.getBoundingClientRect()
    startTransition(tour, rect)
  }, [startTransition])

  // Update active category when URL changes
  useEffect(() => {
    if (categoryFromUrl) {
      setActiveCategory(categoryFromUrl)
    }
  }, [categoryFromUrl])

  // Update URL when category changes
  const handleCategoryChange = (slug: string) => {
    setActiveCategory(slug)
    if (slug === 'all') {
      router.push('/tours', { scroll: false })
    } else {
      router.push(`/tours?category=${slug}`, { scroll: false })
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tours
        const toursRes = await fetch('/api/tours')
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
            // Add "All Tours" option
            setCategories([
              { id: 'all', name: 'All Tours', slug: 'all' },
              ...catsData,
            ])
          }
        }
      } catch (error) {
        console.log('Using placeholder data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredTours = tours.filter((tour) => {
    const matchesCategory = activeCategory === 'all' || tour.category.slug === activeCategory
    const matchesSearch = tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (tour.clientName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (tour.location?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-navy">
      <PublicHeader />

      {/* Hero */}
      <section className="bg-navy-dark py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-display font-bold text-cream mb-4">
              Our Portfolio
            </h1>
            <p className="text-body-lg text-cream-muted max-w-2xl mx-auto">
              Explore our collection of immersive 360° virtual tours across various industries
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 md:top-20 z-30 bg-navy border-b border-gold/10 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <Input
                icon={<Search className="w-5 h-5" />}
                placeholder="Search tours..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  active={activeCategory === category.slug}
                  onClick={() => handleCategoryChange(category.slug)}
                >
                  {category.name}
                </Chip>
              ))}
            </div>

            {/* View Toggle */}
            <div className="hidden md:flex border border-cream/15 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gold text-navy' : 'text-cream-muted hover:bg-cream/5'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gold text-navy' : 'text-cream-muted hover:bg-cream/5'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tours Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-body text-cream-muted mb-6">
            {filteredTours.length} tour{filteredTours.length !== 1 ? 's' : ''} found
          </p>

          <div className={`grid gap-8 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredTours.map((tour, index) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
                onClick={(e) => handleTourClick(e, tour)}
              >
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-medium to-navy-dark border border-gold/10
                                   group-hover:border-gold/40 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-gold/10
                                   ${viewMode === 'list' ? 'flex' : ''}`}>

                    {/* Image Container */}
                    <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-72 flex-shrink-0' : 'h-64'}`}>
                      <div className={viewMode === 'list' ? 'h-full' : 'h-full'}>
                        <Image
                          src={tour.coverImage}
                          alt={tour.title}
                          fill
                          className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                        />
                      </div>

                      {/* Gradient Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-br from-gold/0 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      {/* Animated Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          whileHover={{ scale: 1.1 }}
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <div className="relative">
                            {/* Pulse ring */}
                            <div className="absolute -inset-2 rounded-full bg-gold/30 animate-ping" />
                            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-soft flex items-center justify-center shadow-xl shadow-gold/30 backdrop-blur-sm">
                              <Play className="w-8 h-8 text-navy ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Top Badges Row */}
                      <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                        {/* Category Badge */}
                        <motion.span
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.08 + 0.2 }}
                          className="bg-gold/90 backdrop-blur-sm text-navy text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg"
                        >
                          {tour.category.name}
                        </motion.span>

                        {tour.featured && (
                          <motion.span
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.08 + 0.3 }}
                            className="flex items-center gap-1 bg-navy/80 backdrop-blur-sm text-gold text-xs font-bold px-3 py-1.5 rounded-lg border border-gold/40 shadow-lg"
                          >
                            <Star className="w-3 h-3 fill-gold" />
                            Featured
                          </motion.span>
                        )}
                      </div>

                      {/* Bottom Image Overlay Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center gap-3 text-cream/90 text-sm">
                          <span className="flex items-center gap-1 bg-navy/60 backdrop-blur-sm px-2 py-1 rounded-md">
                            <Eye className="w-3 h-3" />
                            360° Tour
                          </span>
                          <span className="flex items-center gap-1 bg-navy/60 backdrop-blur-sm px-2 py-1 rounded-md">
                            <MapPin className="w-3 h-3" />
                            {tour.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`p-6 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-center' : ''}`}>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="text-xl font-bold text-cream group-hover:text-gold transition-colors duration-300 line-clamp-2">
                          {tour.title}
                        </h3>
                        <ArrowUpRight className="w-5 h-5 text-cream-muted group-hover:text-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 flex-shrink-0" />
                      </div>

                      {tour.shortDescription && (
                        <p className="text-sm text-cream-soft mb-4 line-clamp-2 leading-relaxed">{tour.shortDescription}</p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gold/10">
                        <div>
                          <p className="text-sm font-medium text-cream">{tour.clientName}</p>
                          <p className="text-xs text-cream-muted flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {tour.location}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center group-hover:bg-gold group-hover:scale-110 transition-all duration-300">
                          <Play className="w-4 h-4 text-gold group-hover:text-navy transition-colors" fill="currentColor" />
                        </div>
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
                      <div className="absolute inset-y-0 -right-px w-px bg-gradient-to-b from-transparent via-gold to-transparent" />
                    </div>
                  </div>
              </motion.div>
            ))}
          </div>

          {filteredTours.length === 0 && (
            <div className="text-center py-16">
              <p className="text-h3 text-cream-muted mb-4">No tours found</p>
              <p className="text-body text-cream-dim mb-6">Try adjusting your search or filters</p>
              <Button onClick={() => { handleCategoryChange('all'); setSearchQuery(''); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-h1 font-bold text-cream mb-4">
            Want Your Space Featured?
          </h2>
          <p className="text-body-lg text-cream-muted mb-8">
            Let's create an immersive virtual tour for your business
          </p>
          <Link href="/contact">
            <Button size="lg">Get a Free Quote</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
