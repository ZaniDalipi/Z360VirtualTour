'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Eye, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MobileDrawer } from './MobileDrawer'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/tours', label: 'Portfolio' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/pricing', label: 'Pricing' },
]

export function PublicHeader() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleCloseMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  return (
    <>
      {/* Fixed Header */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-[9990] transition-all duration-300 safe-top',
          isScrolled
            ? 'bg-navy-dark/95 backdrop-blur-lg border-b border-gold/20 shadow-lg'
            : 'bg-navy-dark border-b border-gold/15'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-1.5"
            >
              <span className="text-2xl font-bold text-cream">Z</span>
              <span className="text-xl font-semibold text-gold">360</span>
              <span className="text-sm text-cream-soft ml-0.5">Virtual Tours</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-4 py-2 rounded-lg text-body font-medium transition-all duration-200',
                      isActive
                        ? 'text-gold bg-gold/10'
                        : 'text-cream-soft hover:text-cream hover:bg-cream/5'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Phone button - visible on tablet */}
              <a
                href="tel:+1234567890"
                className="hidden sm:flex lg:hidden items-center gap-2 px-3 py-2 rounded-lg text-cream-soft hover:text-cream hover:bg-cream/5 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">Call Us</span>
              </a>

              {/* CTA Button - Desktop */}
              <Link href="/contact" className="hidden lg:block">
                <button className="bg-gold hover:bg-gold-soft text-navy font-bold px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 hover:scale-105">
                  Get a Free Quote
                </button>
              </Link>

              {/* Mobile & Tablet Menu Button - Shows on all screens below desktop */}
              <button
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-cream/15 text-cream hover:border-gold/30 hover:text-gold transition-colors"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={mobileMenuOpen} onClose={handleCloseMenu} />

      {/* Spacer to push content below fixed header */}
      <div className="h-16 md:h-20" />
    </>
  )
}
