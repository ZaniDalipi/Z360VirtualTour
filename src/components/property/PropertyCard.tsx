'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Bed, Bath, Square, Eye } from 'lucide-react'
import { Property } from '@/types'
import { formatPrice, formatArea, cn } from '@/lib/utils'
import { Badge, Button } from '@/components/ui'
import { motion } from 'framer-motion'

interface PropertyCardProps {
  property: Property
  index?: number
}

export function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/property/${property.id}`}>
        <div className="property-card group cursor-pointer">
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <Image
              src={property.image}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 to-transparent" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {property.has360Tour && (
                <Badge variant="tour">
                  <Eye className="w-3 h-3" />
                  360° Tour
                </Badge>
              )}
              {property.featured && (
                <Badge variant="warning">Featured</Badge>
              )}
            </div>

            {/* Favorite Button */}
            <Button
              variant="icon"
              size="sm"
              className="absolute top-3 right-3 bg-navy-dark/50 backdrop-blur-sm"
              onClick={(e) => {
                e.preventDefault()
                // Handle favorite
              }}
            >
              <Heart className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-h4 font-semibold text-cream truncate">
              {property.title}
            </h3>
            <p className="text-body text-cream-muted mt-1 truncate">
              📍 {property.address}
            </p>

            <div className="mt-3">
              <span className="text-h3 font-bold text-gold">
                {formatPrice(property.price)}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-3 text-cream-soft">
              <span className="flex items-center gap-1.5 text-body">
                <Bed className="w-4 h-4" />
                {property.bedrooms}
              </span>
              <span className="flex items-center gap-1.5 text-body">
                <Bath className="w-4 h-4" />
                {property.bathrooms}
              </span>
              <span className="flex items-center gap-1.5 text-body">
                <Square className="w-4 h-4" />
                {formatArea(property.sqft)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
