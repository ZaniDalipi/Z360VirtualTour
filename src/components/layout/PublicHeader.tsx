'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, Image, MessageSquare, CreditCard, Phone, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/tours', label: 'Portfolio', icon: Image },
  { href: '/testimonials', label: 'Testimonials', icon: MessageSquare },
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/contact', label: 'Contact', icon: Phone },
]

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <>
      {/* Fixed Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-navy-dark/95 backdrop-blur-md shadow-lg' : 'bg-navy-dark'
        }`}
        style={{ borderBottom: '1px solid rgba(201, 169, 98, 0.2)' }}
      >
        {/* Safe area for notched devices */}
        <div className="safe-top" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 no-underline group">
              <span className="text-2xl font-bold text-cream group-hover:text-gold transition-colors">Z</span>
              <span className="text-xl font-semibold text-gold">360</span>
              <span className="text-sm text-cream hidden sm:inline ml-1">Virtual Tours</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      isActive
                        ? 'text-gold bg-gold/10'
                        : 'text-cream hover:text-gold hover:bg-cream/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            {/* CTA Button - Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="/quote"
                className="flex items-center gap-2 px-5 py-2.5 bg-gold text-navy-dark rounded-lg font-semibold text-sm hover:bg-gold-soft transition-all hover:shadow-lg hover:shadow-gold/20"
              >
                <FileText className="w-4 h-4" />
                Get a Quote
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-lg text-cream hover:bg-cream/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-navy-dark/80 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-navy-dark border-l border-cream/10 lg:hidden overflow-y-auto"
            >
              <div className="safe-top" />

              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-cream/10">
                <span className="text-lg font-semibold text-cream">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg text-cream hover:bg-cream/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="p-4 space-y-1">
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
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${
                          isActive
                            ? 'text-gold bg-gold/10'
                            : 'text-cream hover:bg-cream/5'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {link.label}
                      </Link>
                    </motion.div>
                  )
                })}
              </nav>

              {/* CTA */}
              <div className="p-4 mt-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    href="/quote"
                    className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gold text-navy-dark rounded-xl font-semibold hover:bg-gold-soft transition-all"
                  >
                    <FileText className="w-5 h-5" />
                    Get a Quote
                  </Link>
                </motion.div>

                <p className="text-center text-cream-dim text-xs mt-4">
                  No payment required. We&apos;ll call you to discuss.
                </p>
              </div>

              <div className="safe-bottom" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to push content below fixed header */}
      <div className="h-16" />
    </>
  )
}

export default PublicHeader
