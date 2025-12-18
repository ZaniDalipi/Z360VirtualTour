'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, ChevronLeft, ChevronRight, Pause } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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

interface FeaturedCarouselProps {
  tours: Tour[]
}

export function FeaturedCarousel({ tours }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [direction, setDirection] = useState(1)

  const goToNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % tours.length)
  }, [tours.length])

  const goToPrev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + tours.length) % tours.length)
  }, [tours.length])

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  // Auto-play functionality
  useEffect(() => {
    if (isPaused || tours.length <= 1) return

    const interval = setInterval(goToNext, 5000) // Change every 5 seconds
    return () => clearInterval(interval)
  }, [isPaused, tours.length, goToNext])

  if (tours.length === 0) {
    return (
      <div className="relative aspect-square">
        <div className="absolute inset-4 rounded-2xl overflow-hidden border border-gold/20 bg-navy-medium flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-gold" />
            </div>
            <p className="text-cream-muted">Your featured tours will appear here</p>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-24 h-24 border border-gold/30 rounded-2xl" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 border border-gold/20 rounded-2xl" />
      </div>
    )
  }

  const currentTour = tours[currentIndex]

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
  }

  return (
    <div
      className="relative aspect-square"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main carousel container */}
      <div className="absolute inset-4 rounded-2xl overflow-hidden border border-gold/20">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 },
            }}
            className="absolute inset-0"
          >
            {/* Image */}
            <Image
              src={currentTour.coverImage}
              alt={currentTour.title}
              fill
              className="object-cover"
              priority
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent" />

            {/* Category badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute top-4 left-4"
            >
              <span className="bg-gold text-navy text-caption font-semibold px-3 py-1.5 rounded-full">
                {currentTour.category.name}
              </span>
            </motion.div>

            {/* Play Button */}
            <Link
              href={currentTour.tourUrl || `/tour/${currentTour.slug}`}
              target={currentTour.tourUrl ? '_blank' : undefined}
              rel={currentTour.tourUrl ? 'noopener noreferrer' : undefined}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.1 }}
                className="w-20 h-20 rounded-full bg-gold/90 flex items-center justify-center cursor-pointer shadow-glow backdrop-blur-sm"
              >
                <Play className="w-8 h-8 text-navy ml-1" fill="currentColor" />
              </motion.div>
            </Link>

            {/* Tour info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <p className="text-caption text-gold mb-1">Featured Tour</p>
              <h3 className="text-h3 font-bold text-cream mb-1">{currentTour.title}</h3>
              {currentTour.clientName && (
                <p className="text-body text-cream-muted">{currentTour.clientName}</p>
              )}
              {currentTour.location && (
                <p className="text-caption text-cream-dim">{currentTour.location}</p>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {tours.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault()
                goToPrev()
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-navy/60 backdrop-blur-sm border border-gold/20 flex items-center justify-center text-cream hover:bg-gold hover:text-navy transition-all z-10 opacity-0 group-hover:opacity-100 hover:opacity-100"
              style={{ opacity: isPaused ? 1 : 0.6 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                goToNext()
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-navy/60 backdrop-blur-sm border border-gold/20 flex items-center justify-center text-cream hover:bg-gold hover:text-navy transition-all z-10 opacity-0 group-hover:opacity-100 hover:opacity-100"
              style={{ opacity: isPaused ? 1 : 0.6 }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Pause indicator */}
        {isPaused && tours.length > 1 && (
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-navy/60 backdrop-blur-sm flex items-center justify-center text-cream z-10">
            <Pause className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Progress dots */}
      {tours.length > 1 && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {tours.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 h-2 bg-gold rounded-full'
                  : 'w-2 h-2 bg-gold/30 rounded-full hover:bg-gold/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {tours.length > 1 && !isPaused && (
        <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gold/20 rounded-full overflow-hidden">
          <motion.div
            key={currentIndex}
            className="h-full bg-gold"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 5, ease: 'linear' }}
          />
        </div>
      )}

      {/* Decorative Elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 border border-gold/30 rounded-2xl" />
      <div className="absolute -bottom-4 -left-4 w-32 h-32 border border-gold/20 rounded-2xl" />

      {/* Tour counter */}
      {tours.length > 1 && (
        <div className="absolute -top-2 -left-2 bg-gold text-navy text-sm font-bold px-3 py-1 rounded-full z-10">
          {currentIndex + 1} / {tours.length}
        </div>
      )}
    </div>
  )
}
