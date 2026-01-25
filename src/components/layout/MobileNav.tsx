'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Images, CreditCard, Phone, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tours', label: 'Tours', icon: Images },
  { href: '/quote', label: 'Quote', icon: FileText, highlight: true },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/contact', label: 'Contact', icon: Phone },
]

export function MobileNav() {
  const pathname = usePathname()

  // Don't show on admin pages or while pathname is loading
  if (!pathname || pathname.startsWith('/admin')) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-navy-dark/95 backdrop-blur-md border-t border-cream/10">
      {/* Safe area for notched devices */}
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 rounded-full bg-gold flex items-center justify-center shadow-lg shadow-gold/30"
                >
                  <Icon className="w-6 h-6 text-navy-dark" />
                </motion.div>
                <span className="text-[10px] font-medium text-gold mt-1">{item.label}</span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center py-2 px-3 relative"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`relative ${isActive ? 'text-gold' : 'text-cream-muted'}`}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
              <span
                className={`text-[10px] font-medium mt-1 ${
                  isActive ? 'text-gold' : 'text-cream-muted'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
      <div className="safe-bottom bg-navy-dark" />
    </nav>
  )
}

export default MobileNav
