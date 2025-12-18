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
  const pathname = usePathname()

  // Don't show navbar on admin pages
  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <>
      {/* Bottom Navigation - Only visible on mobile (< 768px) */}
      <nav className="fixed bottom-0 left-0 right-0 z-[9980] bg-navy-dark/95 backdrop-blur-lg border-t border-gold/15 md:hidden safe-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-0.5 py-2 px-4 min-w-[60px] rounded-xl transition-colors duration-150',
                  isActive
                    ? 'text-gold'
                    : 'text-cream-muted active:text-cream'
                )}
              >
                {/* Active indicator - simple background */}
                {isActive && (
                  <div className="absolute inset-0 bg-gold/10 rounded-xl" />
                )}

                <Icon
                  className="relative z-10 w-5 h-5"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={cn(
                  'relative z-10 text-[10px] font-medium',
                  isActive ? 'text-gold' : 'text-cream-dim'
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden behind navbar - mobile only */}
      <div className="h-16 md:hidden" />
    </>
  )
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
