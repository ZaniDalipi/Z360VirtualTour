'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Heart, Grid3X3, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/tours', icon: Grid3X3, label: 'Tours' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/contact', icon: Mail, label: 'Contact' },
]

export function Navbar() {
  // Bottom navigation disabled - using top header navigation instead
  // This component is kept for potential future use in app-like pages
  return null
}

// Alternative TabBar component for apps that need a different style
export function TabBar() {
  const pathname = usePathname()

  const tabs = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/tours', icon: Grid3X3, label: 'Tours' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/contact', icon: Mail, label: 'Contact' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[9980] md:hidden">
      <div className="mx-4 mb-4 bg-navy-medium/90 backdrop-blur-xl border border-gold/20 rounded-2xl shadow-lg safe-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const isActive = tab.href === '/'
              ? pathname === '/'
              : pathname.startsWith(tab.href)
            const Icon = tab.icon

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-colors duration-150',
                  isActive
                    ? 'text-gold bg-gold/15'
                    : 'text-cream-muted active:text-cream-soft'
                )}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
