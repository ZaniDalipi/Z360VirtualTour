'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, MapPin, Heart, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/map', icon: MapPin, label: 'Map' },
  { href: '/saved', icon: Heart, label: 'Saved' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-navy-dark border-t border-gold/15 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-2 px-4 transition-all duration-200',
                isActive ? 'text-cream' : 'text-cream-muted hover:text-cream-soft'
              )}
            >
              <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
