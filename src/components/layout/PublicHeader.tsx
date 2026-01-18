'use client'

import { Link } from '@/i18n/routing'
import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, LogIn, UserPlus, Phone, User } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/ui'
import { cn } from '@/lib/utils'
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
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-cream/15 text-cream hover:border-gold/30 hover:text-gold transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-navy-dark border-t border-gold/20 p-4">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-cream font-medium px-4 py-3 rounded-lg hover:bg-cream/5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-4 py-3">
                <LanguageSwitcher />
              </div>
              {isInitialized && !user && (
                <>
                  <Link
                    href="/account/login"
                    className="flex items-center gap-2 text-cream-muted font-medium px-4 py-3 rounded-lg hover:bg-cream/5 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="w-4 h-4" />
                    {tAuth('login')}
                  </Link>
                  <Link
                    href="/account/signup"
                    className="flex items-center gap-2 text-cream font-medium px-4 py-3 rounded-lg hover:bg-cream/5 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserPlus className="w-4 h-4" />
                    {tAuth('signup')}
                  </Link>
                </>
              )}
              {isInitialized && user && (
                <Link
                  href="/account"
                  className="flex items-center gap-2 text-cream font-medium px-4 py-3 rounded-lg hover:bg-cream/5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  {user.name || 'Account'}
                </Link>
              )}
              <div className="pt-2 px-4">
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full bg-gold hover:bg-gold-soft text-navy font-bold py-3 rounded-lg transition-all">
                    {tContact('title')}
                  </button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Spacer to push content below fixed header */}
      <div className="h-16 md:h-20" />
    </>
  )
}
