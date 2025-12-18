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
            <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="hidden md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    color: '#E8DCC4',
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA Button - Desktop */}
            <div className="hidden md:block">
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
                  Get a Quote
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
                    Get a Quote
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
