'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Search, SlidersHorizontal, MapPin, X } from 'lucide-react'
import { Navbar } from '@/components/layout'
import { Button, Input, Card, Badge } from '@/components/ui'
import { properties } from '@/data/properties'
import { formatPrice } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function MapPage() {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const selected = properties.find(p => p.id === selectedProperty)

  return (
    <div className="h-screen bg-navy flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-navy/95 backdrop-blur-lg border-b border-gold/10">
        <div className="flex items-center gap-3 h-16 px-4 max-w-7xl mx-auto">
          <Link href="/">
            <Button variant="icon" size="sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-h4 font-semibold text-cream">Map View</h1>
          <div className="flex-1" />
          <Button variant="icon" size="sm">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="icon" size="sm">
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Map Area */}
      <div className="flex-1 relative bg-navy-dark">
        {/* Simulated Map Background */}
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(201, 169, 98, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201, 169, 98, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Property Pins */}
        {properties.map((property, index) => {
          // Simulated positions based on index
          const positions = [
            { left: '20%', top: '25%' },
            { left: '60%', top: '30%' },
            { left: '35%', top: '45%' },
            { left: '70%', top: '55%' },
            { left: '25%', top: '65%' },
            { left: '55%', top: '70%' },
          ]
          const pos = positions[index % positions.length]

          return (
            <motion.button
              key={property.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`absolute transform -translate-x-1/2 -translate-y-full z-10 ${
                selectedProperty === property.id ? 'z-20' : ''
              }`}
              style={pos}
              onClick={() => setSelectedProperty(property.id)}
            >
              <div
                className={`
                  px-3 py-1.5 rounded-full font-semibold text-sm
                  transition-all duration-200 shadow-lg
                  ${selectedProperty === property.id
                    ? 'bg-gold text-navy scale-110'
                    : 'bg-navy-dark text-gold border border-gold/50 hover:bg-gold hover:text-navy'
                  }
                `}
              >
                {formatPrice(property.price)}
              </div>
              <div
                className={`
                  w-3 h-3 mx-auto -mt-1 rotate-45
                  ${selectedProperty === property.id ? 'bg-gold' : 'bg-navy-dark border-b border-r border-gold/50'}
                `}
              />
            </motion.button>
          )
        })}

        {/* Selected Property Card */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-24 left-4 right-4 z-30"
            >
              <Card className="p-4">
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="absolute top-2 right-2 p-1 text-cream-muted hover:text-cream"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex gap-4">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={selected.image}
                      alt={selected.title}
                      fill
                      className="object-cover"
                    />
                    {selected.has360Tour && (
                      <Badge variant="tour" className="absolute top-1 left-1 text-[8px] px-1.5 py-0.5">
                        360°
                      </Badge>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-h4 font-semibold text-cream truncate">
                      {selected.title}
                    </h3>
                    <p className="text-caption text-cream-muted flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{selected.address}</span>
                    </p>
                    <p className="text-h3 font-bold text-gold mt-2">
                      {formatPrice(selected.price)}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-caption text-cream-soft">
                      <span>{selected.bedrooms} Beds</span>
                      <span>{selected.bathrooms} Baths</span>
                      <span>{selected.sqft.toLocaleString()} sqft</span>
                    </div>
                  </div>
                </div>

                <Link href={`/property/${selected.id}`} className="block mt-4">
                  <Button className="w-full">View Details</Button>
                </Link>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Navbar />
    </div>
  )
}
