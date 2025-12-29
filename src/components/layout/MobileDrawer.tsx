'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, Eye, Home, FolderOpen, MessageSquare, DollarSign, Mail, ChevronRight, CalendarDays, User, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface NavLink {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface UserData {
  id: string
  name: string
  email: string
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tours', label: 'Portfolio', icon: FolderOpen },
  { href: '/schedule', label: 'Availability', icon: CalendarDays },
  { href: '/testimonials', label: 'Testimonials', icon: MessageSquare },
  { href: '/pricing', label: 'Pricing', icon: DollarSign },
]

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  user: UserData | null
}

export function MobileDrawer({ isOpen, onClose, user }: MobileDrawerProps) {
  const pathname = usePathname()
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Close on route change
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[85%] max-w-[320px] bg-navy-dark border-l border-gold/20 z-[9999] flex flex-col safe-top"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gold/10">
              <Link href="/" className="flex items-center gap-2" onClick={onClose}>
                <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-gold" />
                </div>
                <span className="text-lg font-bold text-cream">
                  Z<span className="text-gold">360</span>
                </span>
              </Link>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-navy-medium border border-cream/10 flex items-center justify-center text-cream-muted hover:text-cream hover:border-gold/30 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-6 px-4">
              <div className="space-y-1">
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href
                  const Icon = link.icon

                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3.5 rounded-xl text-body-lg transition-all duration-200',
                          isActive
                            ? 'bg-gold text-navy font-semibold'
                            : 'text-cream-soft hover:text-cream hover:bg-gold/10'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="flex-1">{link.label}</span>
                        {!isActive && <ChevronRight className="w-4 h-4 text-cream-dim" />}
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </nav>

            {/* Login/Profile Link */}
            <div className="px-4 pb-2">
              {user ? (
                <Link
                  href="/profile"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-body-lg text-cream-soft hover:text-cream hover:bg-gold/10 transition-all duration-200"
                >
                  <User className="w-5 h-5" />
                  <span className="flex-1">My Profile</span>
                  <ChevronRight className="w-4 h-4 text-cream-dim" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-body-lg text-cream-soft hover:text-cream hover:bg-gold/10 transition-all duration-200"
                >
                  <LogIn className="w-5 h-5" />
                  <span className="flex-1">Login</span>
                  <ChevronRight className="w-4 h-4 text-cream-dim" />
                </Link>
              )}
            </div>

            {/* CTA Button */}
            <div className="p-4 border-t border-gold/10 safe-bottom">
              <Link href="/contact" onClick={onClose}>
                <button className="w-full bg-gold hover:bg-gold-soft text-navy font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                  Work With Us
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
