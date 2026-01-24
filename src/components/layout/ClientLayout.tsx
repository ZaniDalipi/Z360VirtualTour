'use client'

import { ReactNode } from 'react'
import { ToastProvider } from '@/components/ui/Toast'
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration'
import { MobileNav } from '@/components/layout/MobileNav'

interface ClientLayoutProps {
  children: ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ToastProvider>
      <div className="min-h-screen-safe bg-navy pb-mobile-nav">
        {children}
      </div>
      <MobileNav />
      <ServiceWorkerRegistration />
    </ToastProvider>
  )
}

export default ClientLayout
