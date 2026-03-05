'use client'

import { Link } from '@/i18n/routing'
import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, LogIn, UserPlus, Phone, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/ui'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'

export function PublicHeader() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { user, isInitialized } = useAuth()

  const t = useTranslations('nav')
  const tContact = useTranslations('contact')
  const tAuth = useTranslations('auth')

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/tours', label: t('tours') },
    { href: '/schedule', label: t('schedule') || 'Schedule' },
    { href: '/testimonials', label: t('testimonials') },
    { href: '/pricing', label: t('pricing') },
    { href: '/contact', label: t('contact') },
  ]

  // Mark as mounted
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-1.5 touch-manipulation"
            >
              <span className="text-xl sm:text-2xl font-bold text-cream">Z</span>
              <span className="text-lg sm:text-xl font-semibold text-gold">360</span>
              <span className="text-sm text-cream-soft ml-0.5">Virtual Tours</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname?.includes(link.href + '/')
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
              {/* Language Switcher - Desktop */}
              <div className="hidden lg:block">
                <LanguageSwitcher />
              </div>

              {/* Login/Profile Button - Desktop */}
              {isMounted && isInitialized && (
                <div className="hidden lg:block">
                  {user ? (
                    <Link
                      href="/account"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-cream-soft hover:text-cream hover:bg-cream/5 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">{user.name?.split(' ')[0] || 'Account'}</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link
                        href="/account/login"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-cream-soft hover:text-cream hover:bg-cream/5 transition-colors"
                      >
                        <LogIn className="w-4 h-4" />
                        <span className="text-sm font-medium">{tAuth('login')}</span>
                      </Link>
                      <Link
                        href="/account/signup"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-cream hover:text-gold hover:bg-cream/5 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span className="text-sm font-medium">{tAuth('signup')}</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* CTA Button - Desktop */}
              <Link href="/contact" className="hidden lg:block">
                <button className="bg-gold hover:bg-gold-soft text-navy font-bold px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 hover:scale-105">
                  {tContact('title')}
                </button>
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl border border-cream/15 text-cream hover:border-gold/30 hover:text-gold active:scale-90 active:bg-gold/10 transition-all duration-150 touch-manipulation"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Full screen overlay with native transitions */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 top-14 sm:top-16 bg-navy-dark/98 backdrop-blur-sm z-[9989] overflow-y-auto overscroll-contain scroll-momentum"
            >
              <nav className="flex flex-col p-4 pb-safe max-w-lg mx-auto">
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href || pathname?.includes(link.href + '/')
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.2 }}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          'block text-lg font-medium px-4 py-3.5 rounded-xl transition-all duration-150 touch-manipulation active:scale-[0.97] active:opacity-75',
                          isActive
                            ? 'text-gold bg-gold/10'
                            : 'text-cream active:bg-cream/5'
                        )}
                        onClick={handleCloseMenu}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  )
                })}

                {/* Divider */}
                <div className="my-3 border-t border-cream/10" />

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="px-4 py-2"
                >
                  <LanguageSwitcher />
                </motion.div>

                {/* Auth Links */}
                {isInitialized && !user && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      href="/account/login"
                      className="flex items-center gap-3 text-cream-muted font-medium px-4 py-3.5 rounded-xl transition-all duration-150 touch-manipulation active:scale-[0.97] active:bg-cream/5 active:opacity-75"
                      onClick={handleCloseMenu}
                    >
                      <LogIn className="w-5 h-5" />
                      <span className="text-base">{tAuth('login')}</span>
                    </Link>
                    <Link
                      href="/account/signup"
                      className="flex items-center gap-3 text-cream font-medium px-4 py-3.5 rounded-xl transition-all duration-150 touch-manipulation active:scale-[0.97] active:bg-cream/5 active:opacity-75"
                      onClick={handleCloseMenu}
                    >
                      <UserPlus className="w-5 h-5" />
                      <span className="text-base">{tAuth('signup')}</span>
                    </Link>
                  </motion.div>
                )}
                {isInitialized && user && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      href="/account"
                      className="flex items-center gap-3 text-cream font-medium px-4 py-3.5 rounded-xl transition-all duration-150 touch-manipulation active:scale-[0.97] active:bg-cream/5 active:opacity-75"
                      onClick={handleCloseMenu}
                    >
                      <User className="w-5 h-5" />
                      <span className="text-base">{user.name || 'Account'}</span>
                    </Link>
                  </motion.div>
                )}

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="pt-3 px-4"
                >
                  <Link href="/contact" onClick={handleCloseMenu}>
                    <button className="w-full bg-gold hover:bg-gold-soft text-navy font-bold py-3.5 rounded-xl transition-all duration-150 text-base touch-manipulation active:scale-[0.97] active:opacity-90">
                      {tContact('title')}
                    </button>
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer to push content below fixed header */}
      <div className="h-14 sm:h-16 md:h-20" />
    </>
  )
}
