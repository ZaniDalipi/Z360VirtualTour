'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, SlidersHorizontal, Grid, List } from 'lucide-react'
import { Navbar } from '@/components/layout'
import { Button, Input, Chip, Card } from '@/components/ui'
import { PropertyCard, PropertyGrid } from '@/components/property'
import { properties } from '@/data/properties'
import { motion } from 'framer-motion'

const propertyTypes = [
  { id: 'all', label: 'All', icon: '🏘️' },
  { id: 'house', label: 'Houses', icon: '🏠' },
  { id: 'apartment', label: 'Apartments', icon: '🏢' },
  { id: 'villa', label: 'Villas', icon: '🏡' },
]

const sortOptions = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'newest', label: 'Newest First' },
]

export default function SearchPage() {
  const [activeType, setActiveType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filteredProperties = properties.filter(property => {
    if (searchQuery) {
      return property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             property.address.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  return (
    <div className="min-h-screen bg-navy pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-navy/95 backdrop-blur-lg border-b border-gold/10">
        <div className="flex items-center gap-3 h-16 px-4 max-w-7xl mx-auto">
          <Link href="/">
            <Button variant="icon" size="sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-h4 font-semibold text-cream">Properties</h1>
          <div className="flex-1" />
          <Button variant="icon" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Input
            icon={<Search className="w-5 h-5" />}
            placeholder="Search location, price..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>

        {/* Property Type Chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 mb-4"
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

        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-4"
        >
          <p className="text-body text-cream-muted">
            {filteredProperties.length} properties found
          </p>
          <div className="flex items-center gap-2">
            <select className="bg-navy-medium border border-cream/15 rounded-md px-3 py-2 text-body text-cream focus:outline-none focus:border-gold">
              {sortOptions.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
            <div className="flex border border-cream/15 rounded-md overflow-hidden">
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
        </motion.div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card variant="elevated" className="p-4">
              <h3 className="text-h4 font-semibold text-cream mb-4">Filters</h3>

              <div className="space-y-4">
                {/* Price Range */}
                <div>
                  <label className="text-body text-cream-soft mb-2 block">Price Range</label>
                  <div className="flex gap-4">
                    <Input placeholder="Min" className="flex-1" />
                    <Input placeholder="Max" className="flex-1" />
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="text-body text-cream-soft mb-2 block">Bedrooms</label>
                  <div className="flex gap-2">
                    {['Any', '1', '2', '3', '4', '5+'].map((num) => (
                      <Chip key={num} active={num === '3'}>{num}</Chip>
                    ))}
                  </div>
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="text-body text-cream-soft mb-2 block">Bathrooms</label>
                  <div className="flex gap-2">
                    {['Any', '1', '2', '3', '4+'].map((num) => (
                      <Chip key={num} active={num === '2'}>{num}</Chip>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="text-body text-cream-soft mb-2 block">Features</label>
                  <div className="flex flex-wrap gap-2">
                    <Chip active>360° Tour</Chip>
                    <Chip active>AR View</Chip>
                    <Chip>Pool</Chip>
                    <Chip>Gym</Chip>
                    <Chip>Parking</Chip>
                    <Chip>Garden</Chip>
                  </div>
                </div>

                <Button className="w-full mt-4">
                  Show {filteredProperties.length} Properties
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Property Grid */}
        <PropertyGrid properties={filteredProperties} columns={viewMode === 'grid' ? 2 : 1} />
      </main>

      <Navbar />
    </div>
  )
}
