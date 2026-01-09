'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Home, Building2, Castle, Star } from 'lucide-react'
import { Header, Navbar } from '@/components/layout'
import { Card } from '@/components/ui'
import { PropertyGrid } from '@/components/property'
import { properties } from '@/data/properties'
import { motion } from 'framer-motion'

const collections = [
  { id: 'all', label: 'All', icon: Heart, count: 12, color: 'text-gold' },
  { id: 'houses', label: 'Houses', icon: Home, count: 5, color: 'text-cream' },
  { id: 'apartments', label: 'Apartments', icon: Building2, count: 7, color: 'text-cream' },
  { id: 'top', label: 'Top Picks', icon: Star, count: 3, color: 'text-gold' },
]

export default function SavedPage() {
  const [activeCollection, setActiveCollection] = useState('all')

  // Simulate saved properties (first 4 for demo)
  const savedProperties = properties.slice(0, 4)

  return (
    <div className="min-h-screen bg-navy pb-20">
      <Header title="Saved Properties" />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Collections Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          {collections.map((collection, index) => {
            const Icon = collection.icon
            const isActive = activeCollection === collection.id

            return (
              <motion.button
                key={collection.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveCollection(collection.id)}
                className="text-left"
              >
                <Card
                  className={`p-4 transition-all duration-200 ${
                    isActive ? 'border-gold/40 bg-gold/5' : 'hover:border-gold/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${isActive ? 'bg-gold/20' : 'bg-navy-medium'} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-gold' : collection.color}`} />
                    </div>
                    <div>
                      <h3 className="text-h4 font-semibold text-cream">{collection.label}</h3>
                      <p className="text-caption text-cream-muted">{collection.count} properties</p>
                    </div>
                  </div>
                </Card>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Recently Saved */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="section-title mb-4">Recently Saved</h2>

          {savedProperties.length > 0 ? (
            <PropertyGrid properties={savedProperties} columns={2} />
          ) : (
            <Card className="p-8 text-center">
              <Heart className="w-12 h-12 text-cream-muted mx-auto mb-4" />
              <h3 className="text-h4 font-semibold text-cream mb-2">No saved properties</h3>
              <p className="text-body text-cream-muted mb-4">
                Start exploring and save properties you love
              </p>
              <Link href="/search">
                <button className="btn-primary">Browse Properties</button>
              </Link>
            </Card>
          )}
        </motion.section>
      </main>

      <Navbar />
    </div>
  )
}
