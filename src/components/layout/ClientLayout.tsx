'use client'

import { ReactNode } from 'react'
import { TourTransitionProvider, TourTransitionOverlay } from '@/components/tour'

interface ClientLayoutProps {
  children: ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <TourTransitionProvider>
      {children}
      <TourTransitionOverlay />
    </TourTransitionProvider>
  )
}
