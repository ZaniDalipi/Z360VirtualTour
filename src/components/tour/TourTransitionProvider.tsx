'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface Tour {
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

interface TourTransitionContextType {
  selectedTour: Tour | null
  isTransitioning: boolean
  startTransition: (tour: Tour, cardRect: DOMRect) => void
  completeTransition: () => void
  cardRect: DOMRect | null
}

const TourTransitionContext = createContext<TourTransitionContextType | null>(null)

export function useTourTransition() {
  const context = useContext(TourTransitionContext)
  if (!context) {
    throw new Error('useTourTransition must be used within TourTransitionProvider')
  }
  return context
}

interface TourTransitionProviderProps {
  children: ReactNode
}

export function TourTransitionProvider({ children }: TourTransitionProviderProps) {
  const router = useRouter()
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [cardRect, setCardRect] = useState<DOMRect | null>(null)

  const startTransition = useCallback((tour: Tour, rect: DOMRect) => {
    if (tour.slug === 'placeholder') {
      router.push('/admin')
      return
    }

    setSelectedTour(tour)
    setCardRect(rect)
    setIsTransitioning(true)
  }, [router])

  const completeTransition = useCallback(() => {
    if (selectedTour) {
      router.push(`/tour/${selectedTour.slug}`)
    }
    // Reset state after navigation
    setTimeout(() => {
      setIsTransitioning(false)
      setSelectedTour(null)
      setCardRect(null)
    }, 100)
  }, [selectedTour, router])

  return (
    <TourTransitionContext.Provider
      value={{
        selectedTour,
        isTransitioning,
        startTransition,
        completeTransition,
        cardRect,
      }}
    >
      {children}
    </TourTransitionContext.Provider>
  )
}
