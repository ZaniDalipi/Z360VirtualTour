'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Filter, Play, MapPin, Grid, List } from 'lucide-react'
import { PublicHeader, Footer } from '@/components/layout'
import { Button, Input, Card, Chip } from '@/components/ui'
import { motion } from 'framer-motion'

// Sample data - will be fetched from database
const categories = [
  { id: 'all', name: 'All Tours', slug: 'all' },
  { id: 'real-estate', name: 'Real Estate', slug: 'real-estate' },
  { id: 'business', name: 'Business', slug: 'business' },
  { id: 'hospitality', name: 'Hospitality', slug: 'hospitality' },
  { id: 'automotive', name: 'Automotive', slug: 'automotive' },
  { id: 'education', name: 'Education', slug: 'education' },
]

const tours = [
  {
    id: '1',
    title: 'Luxury Downtown Penthouse',
    slug: 'luxury-downtown-penthouse',
    shortDesc: 'Stunning penthouse with panoramic city views',
    clientName: 'Premier Realty Group',
    location: 'New York, NY',
    coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    category: { name: 'Real Estate', slug: 'real-estate' },
    featured: true,
  },
  {
    id: '2',
    title: 'Modern Office Space',
    slug: 'modern-office-space',
    shortDesc: 'Contemporary office with open floor plan',
    clientName: 'TechHub Coworking',
    location: 'San Francisco, CA',
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    category: { name: 'Business', slug: 'business' },
    featured: true,
  },
  {
    id: '3',
    title: 'Boutique Hotel & Spa',
    slug: 'boutique-hotel-spa',
    shortDesc: 'Intimate boutique hotel with full spa',
    clientName: 'The Grand Retreat',
    location: 'Miami, FL',
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    category: { name: 'Hospitality', slug: 'hospitality' },
    featured: true,
  },
  {
    id: '4',
    title: 'Waterfront Villa Estate',
    slug: 'waterfront-villa-estate',
    shortDesc: 'Magnificent waterfront estate with private dock',
    clientName: 'Coastal Luxury Realty',
    location: 'Malibu, CA',
    coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    category: { name: 'Real Estate', slug: 'real-estate' },
    featured: false,
  },
  {
    id: '5',
    title: 'Artisan Coffee Roastery',
    slug: 'artisan-coffee-roastery',
    shortDesc: 'Craft coffee roastery and café experience',
    clientName: 'Bean & Brew Co.',
    location: 'Portland, OR',
    coverImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
    category: { name: 'Business', slug: 'business' },
    featured: false,
  },
  {
    id: '6',
    title: 'Fine Dining Restaurant',
    slug: 'fine-dining-restaurant',
    shortDesc: 'Michelin-starred dining experience',
    clientName: 'La Maison Élégante',
    location: 'Chicago, IL',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
    category: { name: 'Hospitality', slug: 'hospitality' },
    featured: false,
  },
]

export default function ToursPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredTours = tours.filter((tour) => {
    const matchesCategory = activeCategory === 'all' || tour.category.slug === activeCategory
    const matchesSearch = tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tour.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tour.location.toLowerCase().includes(searchQuery.toLowerCase())
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
                  onClick={() => setActiveCategory(category.slug)}
                >
                  {category.name}
                </Chip>
              ))}
            </div>

            {/* View Toggle */}
            <div className="hidden md:flex border border-cream/15 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gold/20 text-gold' : 'text-cream-muted hover:bg-cream/5'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gold/20 text-gold' : 'text-cream-muted hover:bg-cream/5'}`}
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

          <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredTours.map((tour, index) => (
              <motion.div
                key={tour.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/tour/${tour.slug}`}>
                  <Card className={`overflow-hidden group cursor-pointer hover:border-gold/30 transition-all ${viewMode === 'list' ? 'flex' : ''}`}>
                    <div className={`relative ${viewMode === 'list' ? 'w-64 flex-shrink-0' : 'h-56'}`}>
                      <div className={viewMode === 'list' ? 'h-full' : ''}>
                        <Image
                          src={tour.coverImage}
                          alt={tour.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
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

                      {tour.featured && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-navy-dark/80 text-gold text-caption font-semibold px-3 py-1 rounded-full border border-gold/30">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>

                    <div className={`p-5 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <h3 className="text-h3 font-semibold text-cream mb-2 group-hover:text-gold transition-colors">
                        {tour.title}
                      </h3>
                      {tour.shortDesc && (
                        <p className="text-body text-cream-soft mb-3">{tour.shortDesc}</p>
                      )}
                      <p className="text-body text-cream-muted mb-1">{tour.clientName}</p>
                      <p className="text-caption text-cream-dim flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {tour.location}
                      </p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {filteredTours.length === 0 && (
            <div className="text-center py-16">
              <p className="text-h3 text-cream-muted mb-4">No tours found</p>
              <p className="text-body text-cream-dim mb-6">Try adjusting your search or filters</p>
              <Button onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}>
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
