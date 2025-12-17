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
    <header className="sticky top-0 z-50 bg-[#0A1520] border-b border-[rgba(201,169,98,0.3)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#E8DCC4]">Z</span>
            <span className="text-xl font-semibold text-[#C9A962]">360</span>
            <span className="hidden sm:inline text-sm text-[#E8DCC4]">Virtual Tours</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium text-[#E8DCC4] hover:opacity-80 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link href="/contact">
              <button className="bg-[#C9A962] text-[#0A1520] px-6 py-2 rounded-md font-medium hover:opacity-90">
                Get a Quote
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-[#E8DCC4]"
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
        } bg-[#0A1520] border-t border-[rgba(201,169,98,0.2)]`}
      >
        <nav className="px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-3 font-medium rounded-lg text-[#E8DCC4] hover:opacity-80 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 px-4">
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full bg-[#C9A962] text-[#0A1520] py-3 rounded-md font-medium hover:opacity-90">
                Get a Quote
              </button>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}