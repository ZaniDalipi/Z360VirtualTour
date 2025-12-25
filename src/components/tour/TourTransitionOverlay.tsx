'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Eye, Play } from 'lucide-react'
import { useTourTransition } from './TourTransitionProvider'

// Hook to get window dimensions safely
function useWindowDimensions() {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })

  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return dimensions
}

// Custom easing functions inspired by the Android shared transitions
// ArcLinearPunchEasing - sharp, punchy movement
const arcLinearPunchEasing = [0.2, 0, 0.1, 1] as const

// CinematicEasing - smooth, polished curves
const cinematicEasing = [0.4, 0, 0.2, 1] as const

// PlayfulEasing - springy, overshoot effects
const playfulEasingTitle = [0.34, 1.56, 0.64, 1] as const
const playfulEasingSubtitle = [0.25, 1.7, 0.55, 1] as const

// Animation durations matching the gist
const SCREEN_DURATION = 0.85 // 850ms main screen transition
const SHARED_DURATION = 1.05 // 1050ms shared element paths
const DETAILS_DURATION = 0.9 // 900ms detail content entrance

// Header height constant
const HEADER_HEIGHT = 64

export function TourTransitionOverlay() {
  const { selectedTour, isTransitioning, completeTransition, cardRect } = useTourTransition()
  const overlayRef = useRef<HTMLDivElement>(null)
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()

  // Complete transition after animation
  useEffect(() => {
    if (isTransitioning && selectedTour) {
      const timer = setTimeout(() => {
        completeTransition()
      }, SHARED_DURATION * 1000 + 100)
      return () => clearTimeout(timer)
    }
  }, [isTransitioning, selectedTour, completeTransition])

  if (!selectedTour || !cardRect) return null

  // Calculate the initial position based on card rect (adjusted for header offset)
  const initialImageStyle = {
    left: cardRect.left,
    top: cardRect.top - HEADER_HEIGHT,
    width: cardRect.width,
    height: cardRect.width * 0.64, // Approximate aspect ratio of card image
  }

  // Final position - full hero section (starts at 0 since overlay already has header offset)
  const finalImageStyle = {
    left: 0,
    top: 0,
    width: windowWidth,
    height: Math.min((windowHeight - HEADER_HEIGHT) * 0.7, 800),
  }

  // Initial text position (bottom of card, adjusted for header)
  const initialTextY = cardRect.top - HEADER_HEIGHT + cardRect.width * 0.64 + 24
  const initialTextX = cardRect.left + 24

  // Final text position (hero section bottom)
  const finalTextY = finalImageStyle.height - 200
  const finalTextX = Math.max(16, windowWidth * 0.05)

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed left-0 right-0 bottom-0 z-[100] overflow-hidden"
          style={{ backgroundColor: '#0D1B2A', top: HEADER_HEIGHT }}
        >
          {/* Background overlay that fades in */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: SCREEN_DURATION, ease: cinematicEasing }}
            className="absolute inset-0 bg-navy"
          />

          {/* Shared Image Element - Animates from card to hero */}
          <motion.div
            className="absolute overflow-hidden"
            initial={{
              left: initialImageStyle.left,
              top: initialImageStyle.top,
              width: initialImageStyle.width,
              height: initialImageStyle.height,
              borderRadius: 16,
            }}
            animate={{
              left: finalImageStyle.left,
              top: finalImageStyle.top,
              width: finalImageStyle.width,
              height: finalImageStyle.height,
              borderRadius: 0,
            }}
            transition={{
              duration: SHARED_DURATION,
              ease: arcLinearPunchEasing,
            }}
          >
            <Image
              src={selectedTour.coverImage}
              alt={selectedTour.title}
              fill
              className="object-cover"
              priority
            />
            {/* Gradient overlay that fades in */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: SHARED_DURATION * 0.3, duration: SHARED_DURATION * 0.7 }}
              className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-navy/30"
            />
          </motion.div>

          {/* Category Badge - Shared element with arc motion */}
          <motion.span
            className="absolute px-4 py-1.5 rounded-full bg-gold text-navy text-sm font-semibold z-10"
            initial={{
              x: cardRect.left + 16,
              y: cardRect.top - HEADER_HEIGHT + 16,
              scale: 0.85,
            }}
            animate={{
              x: finalTextX,
              y: finalTextY - 120,
              scale: 1,
            }}
            transition={{
              duration: SHARED_DURATION,
              ease: playfulEasingTitle,
              // Arc motion - goes above before settling
              y: {
                duration: SHARED_DURATION,
                ease: playfulEasingTitle,
              },
            }}
          >
            {selectedTour.category.name}
          </motion.span>

          {/* Title - Shared element with arc motion */}
          <motion.h1
            className="absolute text-4xl md:text-5xl lg:text-6xl font-bold text-cream max-w-3xl z-10"
            style={{ maxWidth: '60vw' }}
            initial={{
              x: initialTextX,
              y: initialTextY,
              fontSize: '1.25rem',
              opacity: 1,
            }}
            animate={{
              x: finalTextX,
              y: finalTextY - 60,
              fontSize: 'clamp(2rem, 5vw, 3.75rem)',
              opacity: 1,
            }}
            transition={{
              duration: SHARED_DURATION,
              ease: playfulEasingTitle,
              fontSize: {
                duration: SHARED_DURATION * 0.8,
                ease: cinematicEasing,
              },
            }}
          >
            {selectedTour.title}
          </motion.h1>

          {/* Meta Info - Fades in with delay */}
          <motion.div
            className="absolute flex flex-wrap items-center gap-4 text-cream/80 z-10"
            initial={{
              x: finalTextX,
              y: finalTextY + 20,
              opacity: 0,
            }}
            animate={{
              x: finalTextX,
              y: finalTextY + 20,
              opacity: 1,
            }}
            transition={{
              delay: SHARED_DURATION * 0.5,
              duration: DETAILS_DURATION * 0.5,
              ease: cinematicEasing,
            }}
          >
            {selectedTour.clientName && (
              <span className="text-cream font-medium">{selectedTour.clientName}</span>
            )}
            {selectedTour.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {selectedTour.location}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              360° Tour
            </span>
          </motion.div>

          {/* Action Buttons - Fade in at the end */}
          <motion.div
            className="absolute flex flex-wrap items-center gap-4 z-10"
            initial={{
              x: finalTextX,
              y: finalTextY + 70,
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              x: finalTextX,
              y: finalTextY + 70,
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: SHARED_DURATION * 0.7,
              duration: DETAILS_DURATION * 0.4,
              ease: playfulEasingSubtitle,
            }}
          >
            <div className="px-6 py-3 rounded-xl bg-gradient-to-br from-gold to-gold-soft text-navy font-semibold flex items-center gap-2 shadow-lg shadow-gold/30">
              <Play className="w-5 h-5" fill="currentColor" />
              View Virtual Tour
            </div>
          </motion.div>

          {/* Loading indicator at bottom */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: SHARED_DURATION * 0.8, duration: 0.2 }}
          >
            <div className="flex items-center gap-2 text-cream-muted text-sm">
              <div className="w-4 h-4 rounded-full border-2 border-gold border-t-transparent animate-spin" />
              Loading tour...
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
