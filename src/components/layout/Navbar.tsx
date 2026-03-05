'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid3X3, Mail, User, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const pathname = usePathname()

  // Don't show navbar on admin pages or tour embed pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/embed')) {
    return null
  }

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/tours', icon: Grid3X3, label: 'Tours' },
    { href: '/pricing', icon: DollarSign, label: 'Pricing' },
    { href: '/contact', icon: Mail, label: 'Book' },
    { href: '/profile', icon: User, label: 'Profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[9980] md:hidden">
      <div className="bg-navy-medium/95 backdrop-blur-xl border-t border-gold/10 safe-bottom">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto">
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
                  'flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 min-w-[56px] min-h-[44px] rounded-lg transition-all duration-150 touch-manipulation active:scale-90 active:opacity-70',
                  isActive
                    ? 'text-gold'
                    : 'text-cream-muted'
                )}
              >
                <Icon className={cn('w-5 h-5 transition-transform duration-150', isActive && 'scale-110')} strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

// Alternative TabBar component for apps that need a different style
export function TabBar() {
  const pathname = usePathname()

  const tabs = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/tours', icon: Grid3X3, label: 'Tours' },
    { href: '/pricing', icon: DollarSign, label: 'Pricing' },
    { href: '/contact', icon: Mail, label: 'Book' },
    { href: '/profile', icon: User, label: 'Profile' },
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
                  'flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 min-h-[44px] rounded-xl transition-all duration-150 touch-manipulation active:scale-90 active:opacity-70',
                  isActive
                    ? 'text-gold bg-gold/15'
                    : 'text-cream-muted'
                )}
              >
                <Icon className={cn('w-5 h-5 transition-transform duration-150', isActive && 'scale-110')} strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
