'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion'

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

interface MobileFeaturedSliderProps {
  tours: Tour[]
}

export function MobileFeaturedSlider({ tours }: MobileFeaturedSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const scale = useTransform(x, [-200, 0, 200], [0.98, 1, 0.98])
  const rotate = useTransform(x, [-200, 0, 200], [-2, 0, 2])

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tours.length)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + tours.length) % tours.length)
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    const threshold = 50
    if (info.offset.x > threshold) {
      goToPrev()
    } else if (info.offset.x < -threshold) {
      goToNext()
    }
  }

  // Auto-play
  useEffect(() => {
    if (tours.length <= 1) return
    const interval = setInterval(goToNext, 5000)
    return () => clearInterval(interval)
  }, [tours.length])

  if (tours.length === 0) return null

  const currentTour = tours[currentIndex]

  return (
    <div className="relative w-full mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-1.5 h-6 bg-gold rounded-full"
            animate={{ scaleY: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-sm font-semibold text-gold uppercase tracking-wider">Featured</span>
        </div>
        <div className="text-xs text-cream-muted">
          {currentIndex + 1} of {tours.length}
        </div>
      </div>

      {/* Main Slider */}
      <div ref={containerRef} className="relative h-[280px] overflow-visible">
        {/* Background glow */}
        <motion.div
          className="absolute inset-4 bg-gold/15 rounded-2xl blur-2xl"
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [0.9, 1, 0.9]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Stacked cards behind */}
        {tours.length > 1 && (
          <>
            <motion.div
              className="absolute inset-x-4 top-4 h-[240px] rounded-xl overflow-hidden border border-gold/10"
              style={{
                transform: 'scale(0.92) translateY(-12px)',
                opacity: 0.3,
                zIndex: 0
              }}
            >
              <Image
                src={tours[(currentIndex + 1) % tours.length].coverImage}
                alt=""
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-navy/70" />
            </motion.div>

            {tours.length > 2 && (
              <motion.div
                className="absolute inset-x-6 top-2 h-[240px] rounded-xl overflow-hidden border border-gold/5"
                style={{
                  transform: 'scale(0.85) translateY(-24px)',
                  opacity: 0.15,
                  zIndex: -1
                }}
              >
                <Image
                  src={tours[(currentIndex + 2) % tours.length].coverImage}
                  alt=""
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-navy/80" />
              </motion.div>
            )}
          </>
        )}

        {/* Main Card */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -80, scale: 0.95 }}
            transition={{
              x: { type: 'tween', duration: 0.4, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.35, ease: 'easeInOut' },
              scale: { duration: 0.35, ease: 'easeOut' }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            style={{ x, scale, rotate }}
            className="relative h-[250px] mx-2 cursor-grab active:cursor-grabbing touch-pan-y"
          >
            <div className="relative h-full rounded-2xl overflow-hidden border border-gold/30 shadow-xl shadow-gold/10">
              {/* Image with Ken Burns */}
              <motion.div
                className="absolute inset-0"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
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
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />

              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
              />

              {/* Category Badge */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.35, ease: 'easeOut' }}
                className="absolute top-3 left-3"
              >
                <span className="bg-gold text-navy text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                  <Sparkles className="w-3 h-3" />
                  {currentTour.category.name}
                </span>
              </motion.div>

              {/* Play Button */}
              <Link
                href={currentTour.tourUrl || `/tour/${currentTour.slug}`}
                target={currentTour.tourUrl ? '_blank' : undefined}
                rel={currentTour.tourUrl ? 'noopener noreferrer' : undefined}
                onClick={(e) => isDragging && e.preventDefault()}
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.div className="relative">
                  {/* Pulsing rings */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gold/40"
                    animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gold/30"
                    animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                  />

                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="relative w-16 h-16 rounded-full bg-gold flex items-center justify-center shadow-2xl shadow-gold/40"
                  >
                    <Play className="w-7 h-7 text-navy ml-1" fill="currentColor" />
                  </motion.div>
                </motion.div>
              </Link>

              {/* Tour Info */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="absolute bottom-0 left-0 right-0 p-4"
              >
                <h3 className="text-lg font-bold text-cream mb-1 line-clamp-1">
                  {currentTour.title}
                </h3>
                <div className="flex items-center gap-3 text-sm">
                  {currentTour.clientName && (
                    <span className="text-cream-soft">{currentTour.clientName}</span>
                  )}
                  {currentTour.location && (
                    <span className="text-cream-muted text-xs">📍 {currentTour.location}</span>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {tours.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-10 h-10 rounded-full bg-navy/80 backdrop-blur-sm border border-gold/20 flex items-center justify-center text-cream z-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-10 h-10 rounded-full bg-navy/80 backdrop-blur-sm border border-gold/20 flex items-center justify-center text-cream z-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Progress Dots */}
      {tours.length > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {tours.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="relative"
            >
              <motion.div
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-8 h-2 bg-gold'
                    : 'w-2 h-2 bg-gold/30'
                }`}
                whileTap={{ scale: 0.9 }}
              />
              {index === currentIndex && (
                <motion.div
                  className="absolute inset-0 bg-white/30 rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 5, ease: 'linear' }}
                  key={`progress-${currentIndex}`}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Swipe hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-xs text-cream-muted mt-3"
      >
        Swipe to explore more
      </motion.p>
    </div>
  )
}
