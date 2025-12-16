'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft, Heart, Share2, Eye, Smartphone, Bed, Bath, Square, Car,
  MapPin, Star, Phone, MessageCircle, Calendar, ChevronRight,
  Waves, Dumbbell, Shield, Wifi, Snowflake, ParkingCircle
} from 'lucide-react'
import { Button, Badge, Card } from '@/components/ui'
import { getPropertyById } from '@/data/properties'
import { formatPrice, formatArea, cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const amenityIcons: Record<string, any> = {
  'Pool': Waves,
  'Gym': Dumbbell,
  'Security': Shield,
  'WiFi': Wifi,
  'AC': Snowflake,
  'Parking': ParkingCircle,
}

export default function PropertyDetailPage() {
  const params = useParams()
  const property = getPropertyById(params.id as string)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  if (!property) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <p className="text-cream">Property not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy pb-24">
      {/* Hero Image */}
      <div className="relative h-72 sm:h-96">
        <Image
          src={property.images[currentImageIndex] || property.image}
          alt={property.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/30" />

        {/* Top Navigation */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="icon" className="bg-navy-dark/60 backdrop-blur-sm">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button
              variant="icon"
              className={cn(
                "backdrop-blur-sm",
                isFavorite ? "bg-error/20 text-error" : "bg-navy-dark/60"
              )}
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
            </Button>
            <Button variant="icon" className="bg-navy-dark/60 backdrop-blur-sm">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* 360 Tour Button */}
        {property.has360Tour && (
          <Link href={`/tour/${property.id}`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2"
            >
              <Button className="flex items-center gap-2 shadow-glow">
                <Eye className="w-5 h-5" />
                Start 360° Tour
              </Button>
            </motion.div>
          </Link>
        )}

        {/* Image Dots */}
        <div className="absolute bottom-6 right-4 flex gap-1.5">
          {property.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === currentImageIndex ? 'bg-cream w-4' : 'bg-cream/40'
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="px-4 -mt-4 relative z-10">
        {/* Price & Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <span className="text-display font-bold text-gold">
            {formatPrice(property.price)}
          </span>
          <h1 className="text-h1 font-bold text-cream mt-1">
            {property.title}
          </h1>
          <p className="text-body text-cream-muted mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {property.address}
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-3 mb-6"
        >
          <Card className="p-3 text-center">
            <Bed className="w-5 h-5 text-gold mx-auto mb-1" />
            <span className="text-h4 font-bold text-cream">{property.bedrooms}</span>
            <p className="text-caption text-cream-muted">Beds</p>
          </Card>
          <Card className="p-3 text-center">
            <Bath className="w-5 h-5 text-gold mx-auto mb-1" />
            <span className="text-h4 font-bold text-cream">{property.bathrooms}</span>
            <p className="text-caption text-cream-muted">Baths</p>
          </Card>
          <Card className="p-3 text-center">
            <Square className="w-5 h-5 text-gold mx-auto mb-1" />
            <span className="text-h4 font-bold text-cream">{property.sqft.toLocaleString()}</span>
            <p className="text-caption text-cream-muted">sqft</p>
          </Card>
          <Card className="p-3 text-center">
            <Car className="w-5 h-5 text-gold mx-auto mb-1" />
            <span className="text-h4 font-bold text-cream">{property.parking}</span>
            <p className="text-caption text-cream-muted">Parking</p>
          </Card>
        </motion.div>

        {/* Tour Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4 mb-6"
        >
          <Link href={`/tour/${property.id}`}>
            <Card variant="elevated" className="p-4 hover:border-gold/30 transition-colors cursor-pointer">
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-gold/20 flex items-center justify-center mx-auto mb-2">
                  <Eye className="w-6 h-6 text-gold" />
                </div>
                <h3 className="text-h4 font-semibold text-cream">360° Virtual</h3>
                <p className="text-caption text-cream-muted">Tour</p>
              </div>
            </Card>
          </Link>
          <Card variant="elevated" className={cn(
            "p-4 transition-colors cursor-pointer",
            property.hasARView ? "hover:border-gold/30" : "opacity-50"
          )}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-gold/20 flex items-center justify-center mx-auto mb-2">
                <Smartphone className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-h4 font-semibold text-cream">AR View</h3>
              <p className="text-caption text-cream-muted">
                {property.hasARView ? 'Available' : 'Coming Soon'}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Description */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="section-title mb-3">Description</h2>
          <Card className="p-4">
            <p className="text-body text-cream-soft leading-relaxed">
              {property.description}
            </p>
          </Card>
        </motion.section>

        {/* Amenities */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h2 className="section-title mb-3">Amenities</h2>
          <div className="flex flex-wrap gap-2">
            {property.amenities.map((amenity) => {
              const Icon = amenityIcons[amenity] || Shield
              return (
                <Badge key={amenity} variant="default" className="flex items-center gap-1.5 px-3 py-2">
                  <Icon className="w-4 h-4 text-gold" />
                  {amenity}
                </Badge>
              )
            })}
          </div>
        </motion.section>

        {/* Location */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <h2 className="section-title mb-3">Location</h2>
          <Card className="h-40 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-radial opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-gold mx-auto mb-2" />
                <p className="text-cream-soft">{property.address}</p>
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Agent */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <h2 className="section-title mb-3">Agent</h2>
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden">
                <Image
                  src={property.agent.avatar}
                  alt={property.agent.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-h4 font-semibold text-cream">{property.agent.name}</h3>
                <div className="flex items-center gap-1 text-caption text-cream-muted">
                  <Star className="w-3 h-3 text-gold fill-gold" />
                  {property.agent.rating} • {property.agent.reviews} reviews
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="secondary" className="flex-1 flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Chat
              </Button>
              <Button variant="secondary" className="flex-1 flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                Call
              </Button>
            </div>
          </Card>
        </motion.section>
      </main>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-navy-dark/95 backdrop-blur-lg border-t border-gold/15 p-4 safe-bottom">
        <Button className="w-full flex items-center justify-center gap-2">
          <Calendar className="w-5 h-5" />
          Schedule a Visit
        </Button>
      </div>
    </div>
  )
}
