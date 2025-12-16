'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ChevronRight, MapPin, Eye } from 'lucide-react'
import { Header, Navbar } from '@/components/layout'
import { Button, Input, Chip, Card } from '@/components/ui'
import { PropertyCard, FeaturedCarousel } from '@/components/property'
import { properties, featuredProperties } from '@/data/properties'
import { motion } from 'framer-motion'

const propertyTypes = [
  { id: 'house', label: 'Houses', icon: '🏠' },
  { id: 'apartment', label: 'Apartments', icon: '🏢' },
  { id: 'villa', label: 'Villas', icon: '🏡' },
  { id: 'townhouse', label: 'Townhouse', icon: '🏘️' },
]

export default function HomePage() {
  const [activeType, setActiveType] = useState('house')

  return (
    <div className="min-h-screen bg-navy pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-h1 font-bold text-cream">Welcome back, Alex</h1>
          <p className="text-body-lg text-cream-muted mt-1">
            Find your dream property
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Link href="/search">
            <div className="flex items-center gap-3 bg-navy-medium border border-cream/15 rounded-md px-4 py-3.5 hover:border-gold/40 transition-colors">
              <Search className="w-5 h-5 text-gold-soft" />
              <span className="text-cream-dim">Search location, price...</span>
            </div>
          </Link>
        </motion.div>

        {/* Property Type Chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 mb-8"
        >
          {propertyTypes.map((type) => (
            <Chip
              key={type.id}
              active={activeType === type.id}
              onClick={() => setActiveType(type.id)}
              icon={type.icon}
            >
              {type.label}
            </Chip>
          ))}
        </motion.div>

        {/* Featured Tours Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2">
              Featured Tours
              <span className="text-gold">360°</span>
            </h2>
            <Link href="/search?featured=true" className="section-link flex items-center gap-1">
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <FeaturedCarousel properties={featuredProperties} />
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 gap-4">
            <Link href="/search?has360=true">
              <Card variant="elevated" className="p-4 hover:border-gold/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gold/20 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-h4 font-semibold text-cream">360° Tours</h3>
                    <p className="text-caption text-cream-muted">Virtual walkthrough</p>
                  </div>
                </div>
              </Card>
            </Link>
            <Link href="/map">
              <Card variant="elevated" className="p-4 hover:border-gold/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gold/20 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h3 className="text-h4 font-semibold text-cream">Map View</h3>
                    <p className="text-caption text-cream-muted">Explore nearby</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </motion.section>

        {/* Nearby Properties */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Nearby Properties</h2>
            <Link href="/search" className="section-link flex items-center gap-1">
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Map Preview */}
          <Card className="h-40 mb-4 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-radial opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-gold mx-auto mb-2" />
                <p className="text-cream-soft">Tap to explore map</p>
              </div>
            </div>
            {/* Decorative pins */}
            <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-gold rounded-full animate-pulse-glow" />
            <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-gold rounded-full animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-gold rounded-full animate-pulse-glow" style={{ animationDelay: '1s' }} />
          </Card>
        </motion.section>

        {/* Recently Viewed */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">All Properties</h2>
            <Link href="/search" className="section-link flex items-center gap-1">
              See All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.slice(0, 6).map((property, index) => (
              <PropertyCard key={property.id} property={property} index={index} />
            ))}
          </div>
        </motion.section>
      </main>

      <Navbar />
    </div>
  )
}
