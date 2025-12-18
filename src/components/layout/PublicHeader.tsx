'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/tours', label: 'Portfolio' },
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
]

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        backgroundColor: '#0A1520',
        borderBottom: '1px solid rgba(201, 169, 98, 0.3)',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#E8DCC4' }}>Z</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#C9A962' }}>360</span>
            <span className="hidden sm:inline" style={{ fontSize: '0.875rem', color: '#E8DCC4' }}>Virtual Tours</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: '#E8DCC4',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link href="/contact">
              <button
                style={{
                  backgroundColor: '#C9A962',
                  color: '#0A1520',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '0.375rem',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Get a Quote
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            style={{ color: '#E8DCC4', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? 'max-h-96' : 'max-h-0'
        }`}
        style={{ backgroundColor: '#0A1520', borderTop: mobileMenuOpen ? '1px solid rgba(201, 169, 98, 0.2)' : 'none' }}
      >
        <nav className="px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-3 rounded-lg"
              style={{ color: '#E8DCC4', fontWeight: 500, textDecoration: 'none' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 px-4">
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
              <button
                style={{
                  width: '100%',
                  backgroundColor: '#C9A962',
                  color: '#0A1520',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Get a Quote
              </button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
