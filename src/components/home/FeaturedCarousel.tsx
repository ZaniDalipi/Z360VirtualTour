'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
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

    const interval = setInterval(goToNext, 4000)
    return () => clearInterval(interval)
  }, [isPaused, tours.length, goToNext])

  if (tours.length === 0) {
    return (
      <div className="relative aspect-square">
        <div className="absolute inset-4 rounded-2xl overflow-hidden border border-gold/20 bg-navy-medium flex items-center justify-center">
          <div className="text-center p-8">
            <motion.div
              className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Play className="w-8 h-8 text-gold" />
            </motion.div>
            <p className="text-cream-muted">Your featured tours will appear here</p>
          </div>
        </div>
      </div>
    )
  }

  const currentTour = tours[currentIndex]
  const nextIndex = (currentIndex + 1) % tours.length
  const prevIndex = (currentIndex - 1 + tours.length) % tours.length

  return (
    <div
      className="relative h-[480px] perspective-1000"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Floating decorative elements */}
      <motion.div
        className="absolute -top-6 -right-6 w-28 h-28 border-2 border-gold/40 rounded-2xl"
        animate={{
          rotate: [0, 5, 0, -5, 0],
          y: [0, -8, 0, 8, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-6 -left-6 w-36 h-36 border-2 border-gold/25 rounded-2xl"
        animate={{
          rotate: [0, -5, 0, 5, 0],
          y: [0, 10, 0, -10, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Glow effect behind main card */}
      <motion.div
        className="absolute inset-8 rounded-3xl bg-gold/20 blur-3xl"
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [0.95, 1.02, 0.95]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Stacked cards behind - Previous */}
      {tours.length > 2 && (
        <motion.div
          className="absolute left-0 top-8 w-full h-[400px] rounded-2xl overflow-hidden opacity-30 cursor-pointer"
          style={{
            transform: 'translateX(-15%) scale(0.85) rotateY(25deg)',
            transformStyle: 'preserve-3d'
          }}
          whileHover={{ opacity: 0.5, x: -10 }}
          onClick={goToPrev}
        >
          <Image
            src={tours[prevIndex].coverImage}
            alt={tours[prevIndex].title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-navy/60" />
        </motion.div>
      )}

      {/* Stacked cards behind - Next */}
      {tours.length > 1 && (
        <motion.div
          className="absolute right-0 top-8 w-full h-[400px] rounded-2xl overflow-hidden opacity-40 cursor-pointer"
          style={{
            transform: 'translateX(15%) scale(0.88) rotateY(-20deg)',
            transformStyle: 'preserve-3d'
          }}
          whileHover={{ opacity: 0.6, x: 10 }}
          onClick={goToNext}
        >
          <Image
            src={tours[nextIndex].coverImage}
            alt={tours[nextIndex].title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-navy/50" />
        </motion.div>
      )}

      {/* Main carousel card */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-[420px] rounded-2xl overflow-hidden border border-gold/30 shadow-2xl shadow-gold/10">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={{
                x: direction > 0 ? 400 : -400,
                opacity: 0,
                rotateY: direction > 0 ? -15 : 15,
                scale: 0.9
              }}
              animate={{
                x: 0,
                opacity: 1,
                rotateY: 0,
                scale: 1
              }}
              exit={{
                x: direction < 0 ? 400 : -400,
                opacity: 0,
                rotateY: direction < 0 ? -15 : 15,
                scale: 0.9
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 25,
              }}
              className="absolute inset-0"
            >
              {/* Image with Ken Burns effect */}
              <motion.div
                className="absolute inset-0"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src={currentTour.coverImage}
                  alt={currentTour.title}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />

              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
              />

              {/* Category badge with sparkle */}
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="absolute top-5 left-5 flex items-center gap-2"
              >
                <span className="bg-gold text-navy text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-gold/30">
                  <Sparkles className="w-4 h-4" />
                  {currentTour.category.name}
                </span>
              </motion.div>

              {/* Center Play Button with pulsing glow */}
              <Link
                href={currentTour.tourUrl || `/tour/${currentTour.slug}`}
                target={currentTour.tourUrl ? '_blank' : undefined}
                rel={currentTour.tourUrl ? 'noopener noreferrer' : undefined}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Pulsing rings */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gold/30"
                    animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gold/20"
                    animate={{ scale: [1, 2.2], opacity: [0.4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                  />

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative w-24 h-24 rounded-full bg-gold flex items-center justify-center cursor-pointer shadow-2xl shadow-gold/50"
                  >
                    <Play className="w-10 h-10 text-navy ml-1.5" fill="currentColor" />
                  </motion.div>
                </motion.div>
              </Link>

              {/* Tour info with slide-up animation */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-navy/90 to-transparent"
              >
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    className="w-1 h-6 bg-gold rounded-full"
                    animate={{ scaleY: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <p className="text-sm text-gold font-medium uppercase tracking-wider">Featured Tour</p>
                </div>
                <h3 className="text-2xl font-bold text-cream mb-2">{currentTour.title}</h3>
                <div className="flex items-center gap-4">
                  {currentTour.clientName && (
                    <p className="text-cream-soft">{currentTour.clientName}</p>
                  )}
                  {currentTour.location && (
                    <p className="text-cream-muted text-sm">📍 {currentTour.location}</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows - always visible with animation */}
          {tours.length > 1 && (
            <>
              <motion.button
                whileHover={{ scale: 1.1, x: -3 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault()
                  goToPrev()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-navy/70 backdrop-blur-md border border-gold/30 flex items-center justify-center text-cream hover:bg-gold hover:text-navy transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, x: 3 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault()
                  goToNext()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-navy/70 backdrop-blur-md border border-gold/30 flex items-center justify-center text-cream hover:bg-gold hover:text-navy transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Progress indicators */}
      {tours.length > 1 && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {tours.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              className="relative"
            >
              <div className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-10 h-3 bg-gold'
                  : 'w-3 h-3 bg-gold/30 hover:bg-gold/50'
              }`} />
              {index === currentIndex && !isPaused && (
                <motion.div
                  className="absolute inset-0 bg-white/30 rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 4, ease: 'linear' }}
                  key={`progress-${currentIndex}`}
                />
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Tour counter badge */}
      {tours.length > 1 && (
        <motion.div
          className="absolute -top-3 -left-3 bg-gold text-navy text-sm font-bold px-4 py-2 rounded-full z-10 shadow-lg shadow-gold/30"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {currentIndex + 1} / {tours.length}
        </motion.div>
      )}
    </div>
  )
}
