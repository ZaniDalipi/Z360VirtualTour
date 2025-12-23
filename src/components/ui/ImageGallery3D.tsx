'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, ZoomIn, Download } from 'lucide-react'
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
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)

  const navigate = useCallback((newDirection: number) => {
    setDirection(newDirection)
    setCurrentIndex((prev) => {
      if (newDirection > 0) {
        return prev === images.length - 1 ? 0 : prev + 1
      }
      return prev === 0 ? images.length - 1 : prev - 1
    })
  }, [images.length])

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

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

  // Touch/drag handling
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setDragStart(clientX)
  }

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    setIsDragging(false)

    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX
    const diff = dragStart - clientX

    if (Math.abs(diff) > 50) {
      navigate(diff > 0 ? 1 : -1)
    }
  }

  if (images.length === 0) return null

  const getVisibleIndices = () => {
    const prev2 = (currentIndex - 2 + images.length) % images.length
    const prev1 = (currentIndex - 1 + images.length) % images.length
    const next1 = (currentIndex + 1) % images.length
    const next2 = (currentIndex + 2) % images.length
    return { prev2, prev1, current: currentIndex, next1, next2 }
  }

  const { prev2, prev1, next1, next2 } = getVisibleIndices()

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 30 : -30,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 30 : -30,
    }),
  }

  return (
    <>
      <div
        className="relative w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 3D Carousel Container */}
        <div
          className="relative h-[400px] sm:h-[500px] md:h-[550px] lg:h-[600px] perspective-[1500px] overflow-hidden"
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onMouseLeave={() => isDragging && setIsDragging(false)}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
        >
          {/* Background Cards - Far Left */}
          {images.length > 4 && (
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[120px] sm:w-[150px] md:w-[180px] h-[180px] sm:h-[220px] md:h-[280px] cursor-pointer transition-all duration-500 opacity-30"
              style={{
                transform: 'translateY(-50%) translateX(-30%) rotateY(35deg) scale(0.6)',
                transformStyle: 'preserve-3d',
              }}
              onClick={() => navigate(-1)}
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <Image
                  src={images[prev2]}
                  alt={`${title} - Image ${prev2 + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-navy/70" />
              </div>
            </div>
          )}

          {/* Left Card */}
          {images.length > 2 && (
            <motion.div
              className="absolute left-4 sm:left-8 md:left-16 lg:left-24 top-1/2 w-[160px] sm:w-[200px] md:w-[260px] lg:w-[300px] h-[220px] sm:h-[280px] md:h-[350px] lg:h-[400px] cursor-pointer z-10"
              style={{
                transform: 'translateY(-50%) translateX(-10%) rotateY(25deg) scale(0.85)',
                transformStyle: 'preserve-3d',
              }}
              whileHover={{ scale: 0.9, rotateY: 20 }}
              onClick={() => navigate(-1)}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-gold/10">
                <Image
                  src={images[prev1]}
                  alt={`${title} - Image ${prev1 + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-navy/50" />
              </div>
            </motion.div>
          )}

          {/* Center Card - Main */}
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="absolute left-1/2 top-1/2 z-20 w-[280px] sm:w-[360px] md:w-[480px] lg:w-[600px] xl:w-[700px] h-[280px] sm:h-[360px] md:h-[420px] lg:h-[480px] cursor-pointer"
              style={{
                transform: 'translate(-50%, -50%)',
                transformStyle: 'preserve-3d',
              }}
              onClick={() => setIsFullscreen(true)}
            >
              <div className="group relative w-full h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-gold/20 border-2 border-gold/30 hover:border-gold/60 transition-all duration-300">
                <Image
                  src={images[currentIndex]}
                  alt={`${title} - Image ${currentIndex + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Zoom Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 rounded-full bg-gold/90 flex items-center justify-center shadow-xl">
                    <ZoomIn className="w-8 h-8 text-navy" />
                  </div>
                </div>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-navy/80 backdrop-blur-sm border border-gold/30">
                  <span className="text-gold font-bold">{currentIndex + 1}</span>
                  <span className="text-cream-muted"> / {images.length}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right Card */}
          {images.length > 2 && (
            <motion.div
              className="absolute right-4 sm:right-8 md:right-16 lg:right-24 top-1/2 w-[160px] sm:w-[200px] md:w-[260px] lg:w-[300px] h-[220px] sm:h-[280px] md:h-[350px] lg:h-[400px] cursor-pointer z-10"
              style={{
                transform: 'translateY(-50%) translateX(10%) rotateY(-25deg) scale(0.85)',
                transformStyle: 'preserve-3d',
              }}
              whileHover={{ scale: 0.9, rotateY: -20 }}
              onClick={() => navigate(1)}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-gold/10">
                <Image
                  src={images[next1]}
                  alt={`${title} - Image ${next1 + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-navy/50" />
              </div>
            </motion.div>
          )}

          {/* Background Cards - Far Right */}
          {images.length > 4 && (
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-[120px] sm:w-[150px] md:w-[180px] h-[180px] sm:h-[220px] md:h-[280px] cursor-pointer transition-all duration-500 opacity-30"
              style={{
                transform: 'translateY(-50%) translateX(30%) rotateY(-35deg) scale(0.6)',
                transformStyle: 'preserve-3d',
              }}
              onClick={() => navigate(1)}
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <Image
                  src={images[next2]}
                  alt={`${title} - Image ${next2 + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-navy/70" />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => navigate(-1)}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-navy-dark/90 backdrop-blur-sm border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-navy hover:border-gold transition-all duration-300 shadow-xl"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigate(1)}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-navy-dark/90 backdrop-blur-sm border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-navy hover:border-gold transition-all duration-300 shadow-xl"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 px-4 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 md:w-24 md:h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                  index === currentIndex
                    ? 'border-gold scale-110 shadow-lg shadow-gold/30'
                    : 'border-gold/20 opacity-60 hover:opacity-100 hover:border-gold/50'
                }`}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
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

            {/* Image */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-[90vw] h-[80vh] max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[currentIndex]}
                alt={`${title} - Image ${currentIndex + 1}`}
                fill
                className="object-contain"
                priority
              />
            </motion.div>

            {/* Fullscreen Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(1); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Fullscreen Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <span className="text-white font-bold text-lg">{currentIndex + 1}</span>
              <span className="text-white/60 text-lg"> / {images.length}</span>
            </div>

            {/* Fullscreen Thumbnails */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4 pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
                  className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-white scale-110'
                      : 'border-white/30 opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
