'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageGallery3DProps {
  images: string[]
  title?: string
  autoPlay?: boolean
  autoPlayInterval?: number
}

export function ImageGallery3D({
  images,
  title = 'Gallery',
  autoPlay = false,
  autoPlayInterval = 4000,
}: ImageGallery3DProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const navigate = useCallback((newDirection: number) => {
    setDirection(newDirection)
    setCurrentIndex((prev) => {
      if (newDirection > 0) {
        return prev === images.length - 1 ? 0 : prev + 1
      }
      return prev === 0 ? images.length - 1 : prev - 1
    })
  }, [images.length])

  useEffect(() => {
    if (!autoPlay || isHovered || images.length <= 1 || isFullscreen) return

    const interval = setInterval(() => {
      navigate(1)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, isHovered, navigate, images.length, isFullscreen])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigate(-1)
      if (e.key === 'ArrowRight') navigate(1)
      if (e.key === 'Escape') setIsFullscreen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  if (images.length === 0) return null

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.85,
      rotateY: direction > 0 ? 35 : -35,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.4 },
        rotateY: { duration: 0.4 },
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.85,
      rotateY: direction < 0 ? 35 : -35,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.4 },
        rotateY: { duration: 0.4 },
      },
    }),
  }

  return (
    <>
      {/* Main Gallery Container with Side Navigation */}
      <div
        className="relative w-full flex items-center justify-center gap-4 md:gap-8"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* PREV Button - Left Side */}
        {images.length > 1 && (
          <button
            onClick={() => navigate(-1)}
            className="flex-shrink-0 w-16 md:w-20 h-48 md:h-72 lg:h-96 rounded-2xl bg-navy-light/50 backdrop-blur-sm border-2 border-gold/30 flex flex-col items-center justify-center text-gold hover:bg-gold/20 hover:border-gold/60 transition-all duration-300 shadow-xl group"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8 md:w-10 md:h-10 group-hover:scale-110 transition-transform" />
            <span className="mt-2 text-sm md:text-base font-semibold tracking-wider">Prev</span>
          </button>
        )}

        {/* Main Image Container */}
        <div
          className="relative flex-1 max-w-4xl aspect-[16/10] rounded-2xl md:rounded-3xl overflow-hidden"
          style={{ perspective: '1200px' }}
        >
          {/* Animated Image */}
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 cursor-pointer"
              style={{ transformStyle: 'preserve-3d' }}
              onClick={() => setIsFullscreen(true)}
            >
              <div className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border-2 border-gold/30 hover:border-gold/60 transition-colors duration-300">
                <Image
                  src={images[currentIndex]}
                  alt={`${title} - Image ${currentIndex + 1}`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
                />

                {/* Image Counter Badge */}
                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 px-4 py-2 rounded-xl bg-navy/80 backdrop-blur-sm border border-gold/30">
                  <span className="text-gold font-bold text-lg">{currentIndex + 1}</span>
                  <span className="text-cream-muted text-lg"> / {images.length}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* NEXT Button - Right Side */}
        {images.length > 1 && (
          <button
            onClick={() => navigate(1)}
            className="flex-shrink-0 w-16 md:w-20 h-48 md:h-72 lg:h-96 rounded-2xl bg-navy-light/50 backdrop-blur-sm border-2 border-gold/30 flex flex-col items-center justify-center text-gold hover:bg-gold/20 hover:border-gold/60 transition-all duration-300 shadow-xl group"
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8 md:w-10 md:h-10 group-hover:scale-110 transition-transform" />
            <span className="mt-2 text-sm md:text-base font-semibold tracking-wider">Next</span>
          </button>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-lg flex items-center justify-center"
            onClick={() => setIsFullscreen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* PREV Button - Fullscreen */}
            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 w-16 md:w-20 h-48 md:h-72 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/20 flex flex-col items-center justify-center text-white transition-all"
              >
                <ChevronLeft className="w-10 h-10" />
                <span className="mt-2 text-sm font-medium">Prev</span>
              </button>
            )}

            {/* Fullscreen Image */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-[70vw] h-[85vh] max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction < 0 ? 100 : -100 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={images[currentIndex]}
                    alt={`${title} - Image ${currentIndex + 1}`}
                    fill
                    className="object-contain"
                    priority
                    sizes="70vw"
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* NEXT Button - Fullscreen */}
            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(1); }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 w-16 md:w-20 h-48 md:h-72 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/20 flex flex-col items-center justify-center text-white transition-all"
              >
                <ChevronRight className="w-10 h-10" />
                <span className="mt-2 text-sm font-medium">Next</span>
              </button>
            )}

            {/* Fullscreen Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <span className="text-white font-bold text-lg">{currentIndex + 1}</span>
              <span className="text-white/60 text-lg"> / {images.length}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
