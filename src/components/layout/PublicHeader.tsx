'use client'

import { Link } from '@/i18n/routing'
import { useState } from 'react'
import { Menu, X, LogIn, UserPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/ui'

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = useTranslations('nav')
  const tContact = useTranslations('contact')
  const tAuth = useTranslations('auth')

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/tours', label: t('tours') },
    { href: '/testimonials', label: t('testimonials') },
    { href: '/pricing', label: t('pricing') },
    { href: '/contact', label: t('contact') },
  ]

  return (
    <>
      {/* Fixed Header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          backgroundColor: '#0A1520',
          borderBottom: '1px solid rgba(201, 169, 98, 0.3)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            {/* Logo */}
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#E8DCC4' }}>Z</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#C9A962' }}>360</span>
              <span style={{ fontSize: '0.875rem', color: '#E8DCC4' }}>Virtual Tours</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-cream font-medium hover:text-gold transition-colors"
                  style={{ textDecoration: 'none' }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side - Language Switcher + Auth + CTA */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher />
              <Link
                href="/account/login"
                className="flex items-center gap-1.5 text-cream-muted hover:text-cream transition-colors text-sm"
                style={{ textDecoration: 'none' }}
              >
                <LogIn className="w-4 h-4" />
                {tAuth('login')}
              </Link>
              <Link
                href="/account/signup"
                className="flex items-center gap-1.5 text-cream hover:text-gold transition-colors text-sm font-medium"
                style={{ textDecoration: 'none' }}
              >
                <UserPlus className="w-4 h-4" />
                {tAuth('signup')}
              </Link>
              <Link href="/contact" style={{ textDecoration: 'none' }}>
                <button
                  style={{
                    backgroundColor: '#C9A962',
                    color: '#0A1520',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '0.375rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {tContact('title')}
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              style={{ color: '#E8DCC4', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X style={{ width: '24px', height: '24px' }} /> : <Menu style={{ width: '24px', height: '24px' }} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              backgroundColor: '#0A1520',
              borderTop: '1px solid rgba(201, 169, 98, 0.2)',
              padding: '1rem',
            }}
            className="md:hidden"
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    color: '#E8DCC4',
                    fontWeight: 500,
                    textDecoration: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    display: 'block',
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div style={{ padding: '0.75rem 1rem' }}>
                <LanguageSwitcher />
              </div>
              <Link
                href="/account/login"
                style={{
                  color: '#B8A88A',
                  fontWeight: 500,
                  textDecoration: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn style={{ width: '16px', height: '16px' }} />
                {tAuth('login')}
              </Link>
              <Link
                href="/account/signup"
                style={{
                  color: '#E8DCC4',
                  fontWeight: 500,
                  textDecoration: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserPlus style={{ width: '16px', height: '16px' }} />
                {tAuth('signup')}
              </Link>
              <div style={{ paddingTop: '0.5rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
                  <button
                    style={{
                      width: '100%',
                      backgroundColor: '#C9A962',
                      color: '#0A1520',
                      padding: '0.75rem',
                      borderRadius: '0.375rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {tContact('title')}
                  </button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Spacer to push content below fixed header */}
      <div style={{ height: '64px' }} />
    </>
  )
}
