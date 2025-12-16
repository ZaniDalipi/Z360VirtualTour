'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Eye, Bed, Bath, Square } from 'lucide-react'
import { Property } from '@/types'
import { formatPrice, formatArea, cn } from '@/lib/utils'
import { Badge, Button } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'

interface FeaturedCarouselProps {
  properties: Property[]
}

export function FeaturedCarousel({ properties }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % properties.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + properties.length) % properties.length)
  }

  const property = properties[currentIndex]

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Link href={`/property/${property.id}`}>
            <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden group cursor-pointer">
              <Image
                src={property.image}
                alt={property.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {property.has360Tour && (
                  <Badge variant="tour">
                    <Eye className="w-3 h-3" />
                    360° Tour
                  </Badge>
                )}
                <Badge variant="warning">Featured</Badge>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-h2 font-bold text-cream mb-1">
                  {property.title}
                </h3>
                <p className="text-body text-cream-soft mb-3">
                  📍 {property.address}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-h2 font-bold text-gold">
                    {formatPrice(property.price)}
                  </span>
                  <div className="flex items-center gap-4 text-cream-soft">
                    <span className="flex items-center gap-1">
                      <Bed className="w-4 h-4" /> {property.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-4 h-4" /> {property.bathrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Square className="w-4 h-4" /> {formatArea(property.sqft)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-navy-dark/80 backdrop-blur-sm rounded-full text-cream hover:bg-gold/20 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-navy-dark/80 backdrop-blur-sm rounded-full text-cream hover:bg-gold/20 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {properties.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-200',
              index === currentIndex ? 'bg-gold w-6' : 'bg-cream/30 hover:bg-cream/50'
            )}
          />
        ))}
      </div>
    </div>
  )
}
