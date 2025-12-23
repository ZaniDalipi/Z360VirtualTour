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

  // Get prev and next indices
  const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
  const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '50%' : '-50%',
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 25 : -25,
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
      x: direction < 0 ? '50%' : '-50%',
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 25 : -25,
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
      {/* Main Gallery Container with 3D Side Previews */}
      <div
        className="relative w-full flex items-center justify-center gap-2 md:gap-4 lg:gap-6 px-2 md:px-4"
        style={{ perspective: '1500px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* PREV Image - 3D Preview */}
        {images.length > 1 && (
          <button
            onClick={() => navigate(-1)}
            className="relative flex-shrink-0 w-24 md:w-32 lg:w-44 h-40 md:h-56 lg:h-72 rounded-xl md:rounded-2xl overflow-hidden cursor-pointer group"
            style={{
              transform: 'rotateY(35deg) translateZ(-50px)',
              transformStyle: 'preserve-3d',
            }}
            aria-label="Previous image"
          >
            {/* Shadow overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20 z-10 group-hover:from-black/40 group-hover:via-black/20 group-hover:to-transparent transition-all duration-300" />

            {/* Prev label */}
            <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-navy/80 backdrop-blur-sm border border-gold/40">
                <ChevronLeft className="w-5 h-5 text-gold" />
                <span className="text-gold font-semibold text-sm">Prev</span>
              </div>
            </div>

            <Image
              src={images[prevIndex]}
              alt={`Previous - ${title}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100px, (max-width: 1200px) 150px, 200px"
            />

            {/* 3D edge shadow */}
            <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-black/50 to-transparent" />

            {/* Bottom shadow */}
            <div
              className="absolute -bottom-4 left-2 right-2 h-8 bg-black/40 blur-xl rounded-full"
              style={{ transform: 'rotateX(90deg)' }}
            />
          </button>
        )}

        {/* Main Image Container */}
        <div
          className="relative flex-1 max-w-3xl aspect-[16/10] rounded-2xl md:rounded-3xl overflow-hidden z-10"
          style={{ transformStyle: 'preserve-3d' }}
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
              <div className="relative w-full h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-black/60 border-2 border-gold/40 hover:border-gold/70 transition-colors duration-300">
                <Image
                  src={images[currentIndex]}
                  alt={`${title} - Image ${currentIndex + 1}`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                />

                {/* Image Counter Badge */}
                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 px-4 py-2 rounded-xl bg-navy/80 backdrop-blur-sm border border-gold/30">
                  <span className="text-gold font-bold text-lg">{currentIndex + 1}</span>
                  <span className="text-cream-muted text-lg"> / {images.length}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Main image shadow */}
          <div className="absolute -bottom-6 left-8 right-8 h-12 bg-black/50 blur-2xl rounded-full -z-10" />
        </div>

        {/* NEXT Image - 3D Preview */}
        {images.length > 1 && (
          <button
            onClick={() => navigate(1)}
            className="relative flex-shrink-0 w-24 md:w-32 lg:w-44 h-40 md:h-56 lg:h-72 rounded-xl md:rounded-2xl overflow-hidden cursor-pointer group"
            style={{
              transform: 'rotateY(-35deg) translateZ(-50px)',
              transformStyle: 'preserve-3d',
            }}
            aria-label="Next image"
          >
            {/* Shadow overlay */}
            <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/40 to-black/20 z-10 group-hover:from-black/40 group-hover:via-black/20 group-hover:to-transparent transition-all duration-300" />

            {/* Next label */}
            <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-navy/80 backdrop-blur-sm border border-gold/40">
                <span className="text-gold font-semibold text-sm">Next</span>
                <ChevronRight className="w-5 h-5 text-gold" />
              </div>
            </div>

            <Image
              src={images[nextIndex]}
              alt={`Next - ${title}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100px, (max-width: 1200px) 150px, 200px"
            />

            {/* 3D edge shadow */}
            <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/50 to-transparent" />

            {/* Bottom shadow */}
            <div
              className="absolute -bottom-4 left-2 right-2 h-8 bg-black/40 blur-xl rounded-full"
              style={{ transform: 'rotateX(90deg)' }}
            />
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
            style={{ perspective: '1500px' }}
            onClick={() => setIsFullscreen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* PREV Image - Fullscreen 3D Preview */}
            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 w-28 md:w-40 lg:w-52 h-44 md:h-64 lg:h-80 rounded-xl md:rounded-2xl overflow-hidden cursor-pointer group"
                style={{
                  transform: 'translateY(-50%) rotateY(30deg) translateZ(-30px)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20 z-10 group-hover:from-black/50 group-hover:via-black/20 group-hover:to-transparent transition-all duration-300" />

                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/30">
                    <ChevronLeft className="w-5 h-5 text-white" />
                    <span className="text-white font-semibold text-sm">Prev</span>
                  </div>
                </div>

                <Image
                  src={images[prevIndex]}
                  alt={`Previous - ${title}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="250px"
                />
              </button>
            )}

            {/* Fullscreen Main Image */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-[60vw] h-[80vh] max-w-4xl z-30"
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
                  className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/80"
                >
                  <Image
                    src={images[currentIndex]}
                    alt={`${title} - Image ${currentIndex + 1}`}
                    fill
                    className="object-contain"
                    priority
                    sizes="60vw"
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* NEXT Image - Fullscreen 3D Preview */}
            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(1); }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 w-28 md:w-40 lg:w-52 h-44 md:h-64 lg:h-80 rounded-xl md:rounded-2xl overflow-hidden cursor-pointer group"
                style={{
                  transform: 'translateY(-50%) rotateY(-30deg) translateZ(-30px)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/40 to-black/20 z-10 group-hover:from-black/50 group-hover:via-black/20 group-hover:to-transparent transition-all duration-300" />

                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/30">
                    <span className="text-white font-semibold text-sm">Next</span>
                    <ChevronRight className="w-5 h-5 text-white" />
                  </div>
                </div>

                <Image
                  src={images[nextIndex]}
                  alt={`Next - ${title}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="250px"
                />
              </button>
            )}

            {/* Fullscreen Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm z-50">
              <span className="text-white font-bold text-lg">{currentIndex + 1}</span>
              <span className="text-white/60 text-lg"> / {images.length}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
