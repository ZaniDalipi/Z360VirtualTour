'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Play, MapPin, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CarouselItem {
  id: string
  title: string
  slug: string
  shortDescription?: string | null
  clientName: string | null
  location: string | null
  coverImage: string
  category: { name: string; slug: string }
  featured: boolean
}

interface Carousel3DProps {
  items: CarouselItem[]
  autoPlay?: boolean
  autoPlayInterval?: number
}

export function Carousel3D({
  items,
  autoPlay = true,
  autoPlayInterval = 5000
}: Carousel3DProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  }

  const navigate = useCallback((newDirection: number) => {
    setDirection(newDirection)
    setCurrentIndex((prev) => {
      if (newDirection > 0) {
        return prev === items.length - 1 ? 0 : prev + 1
      }
      return prev === 0 ? items.length - 1 : prev - 1
    })
  }, [items.length])

  useEffect(() => {
    if (!autoPlay || isHovered || items.length <= 1) return

    const interval = setInterval(() => {
      navigate(1)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, isHovered, navigate, items.length])

  if (items.length === 0) return null

  const currentItem = items[currentIndex]

  // Get visible items for 3D effect (prev, current, next)
  const getVisibleItems = () => {
    const prev = currentIndex === 0 ? items.length - 1 : currentIndex - 1
    const next = currentIndex === items.length - 1 ? 0 : currentIndex + 1
    return { prev, current: currentIndex, next }
  }

  const { prev, next } = getVisibleItems()

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Carousel Container */}
      <div className="relative h-[500px] sm:h-[550px] md:h-[600px] lg:h-[650px] perspective-1000">
        {/* Background blur cards */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Left Card (Previous) */}
          {items.length > 1 && (
            <motion.div
              className="absolute left-0 sm:left-4 md:left-8 lg:left-16 w-[200px] sm:w-[250px] md:w-[300px] lg:w-[350px] h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] cursor-pointer"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'translateX(-20%) rotateY(25deg) scale(0.85)',
              }}
              whileHover={{ scale: 0.9, rotateY: 20 }}
              onClick={() => navigate(-1)}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden opacity-50 blur-[1px]">
                <Image
                  src={items[prev].coverImage}
                  alt={items[prev].title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-navy/60" />
              </div>
            </motion.div>
          )}

          {/* Right Card (Next) */}
          {items.length > 1 && (
            <motion.div
              className="absolute right-0 sm:right-4 md:right-8 lg:right-16 w-[200px] sm:w-[250px] md:w-[300px] lg:w-[350px] h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px] cursor-pointer"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'translateX(20%) rotateY(-25deg) scale(0.85)',
              }}
              whileHover={{ scale: 0.9, rotateY: -20 }}
              onClick={() => navigate(1)}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden opacity-50 blur-[1px]">
                <Image
                  src={items[next].coverImage}
                  alt={items[next].title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-navy/60" />
              </div>
            </motion.div>
          )}

          {/* Center Card (Current) */}
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="relative z-10 w-[320px] sm:w-[400px] md:w-[550px] lg:w-[700px] xl:w-[800px] h-[380px] sm:h-[420px] md:h-[480px] lg:h-[520px]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Link href={currentItem.slug === 'placeholder' ? '/admin' : `/tour/${currentItem.slug}`}>
                <div className="group relative w-full h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-gold/20 border border-gold/20 hover:border-gold/50 transition-all duration-500">
                  {/* Image */}
                  <Image
                    src={currentItem.coverImage}
                    alt={currentItem.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                  />

                  {/* Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/0 via-transparent to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Top Badges */}
                  <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-start justify-between">
                    <motion.span
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gold text-navy text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-lg"
                    >
                      {currentItem.category.name}
                    </motion.span>
                    {currentItem.featured && (
                      <motion.span
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-1.5 bg-navy/80 backdrop-blur-sm text-gold text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-gold/40 shadow-lg"
                      >
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-gold" />
                        Featured
                      </motion.span>
                    )}
                  </div>

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                      className="relative"
                    >
                      <div className="absolute -inset-3 rounded-full bg-gold/30 animate-ping opacity-0 group-hover:opacity-100" />
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-gold to-gold-soft flex items-center justify-center shadow-2xl shadow-gold/40 group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-navy ml-1" fill="currentColor" />
                      </div>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-cream mb-2 sm:mb-3 group-hover:text-gold transition-colors duration-300">
                        {currentItem.title}
                      </h2>
                      {currentItem.shortDescription && (
                        <p className="text-sm sm:text-base text-cream-soft mb-3 sm:mb-4 line-clamp-2 max-w-2xl">
                          {currentItem.shortDescription}
                        </p>
                      )}
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-2 text-cream-muted">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gold/20 flex items-center justify-center">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-cream">{currentItem.clientName}</p>
                            <p className="text-xs text-cream-muted">{currentItem.location}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Shine Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={() => navigate(-1)}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-navy-dark/80 backdrop-blur-sm border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-navy hover:border-gold transition-all duration-300 shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-navy-dark/80 backdrop-blur-sm border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-navy hover:border-gold transition-all duration-300 shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {items.length > 1 && (
        <div className="flex justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1)
                setCurrentIndex(index)
              }}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-8 sm:w-10 h-2 sm:h-3 bg-gold'
                  : 'w-2 sm:w-3 h-2 sm:h-3 bg-gold/30 hover:bg-gold/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      <div className="absolute bottom-4 right-4 sm:right-8 z-20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-navy-dark/80 backdrop-blur-sm border border-gold/30">
        <span className="text-gold font-bold text-sm sm:text-base">{currentIndex + 1}</span>
        <span className="text-cream-muted text-sm sm:text-base"> / {items.length}</span>
      </div>
    </div>
  )
}
