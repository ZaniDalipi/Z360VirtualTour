'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

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
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: '#0A1520', borderColor: 'rgba(201, 169, 98, 0.3)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold" style={{ color: '#E8DCC4' }}>Z</span>
            <span className="text-xl font-semibold" style={{ color: '#C9A962' }}>360</span>
            <span className="hidden sm:inline text-sm" style={{ color: '#E8DCC4' }}>Virtual Tours</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium transition-colors hover:opacity-80"
                style={{ color: '#E8DCC4' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link href="/contact">
              <Button>Get a Quote</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            style={{ color: '#E8DCC4' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300',
          mobileMenuOpen ? 'max-h-96' : 'max-h-0'
        )}
        style={{ backgroundColor: '#0A1520', borderTop: '1px solid rgba(201, 169, 98, 0.2)' }}
      >
        <nav className="px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-3 font-medium rounded-lg transition-colors hover:opacity-80"
              style={{ color: '#E8DCC4' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 px-4">
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full">Get a Quote</Button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
