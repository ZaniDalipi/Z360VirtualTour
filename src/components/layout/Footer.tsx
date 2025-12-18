'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, Star, Map } from 'lucide-react'

const footerLinks = {
  services: [
    { label: 'Real Estate Tours', href: '/tours?category=real-estate' },
    { label: 'Business Tours', href: '/tours?category=business' },
    { label: 'Hospitality Tours', href: '/tours?category=hospitality' },
    { label: 'Custom Solutions', href: '/contact' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Portfolio', href: '/tours' },
    { label: 'Testimonials', href: '/testimonials' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Twitter, href: '#', label: 'Twitter' },
]

export function Footer() {
  return (
    <footer className="bg-navy-dark border-t border-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="block mb-4">
              <div className="relative h-12 w-32">
                <Image
                  src="/images/logo-desktop.svg"
                  alt="Z360 Virtual Tours"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-body text-cream-muted mb-6">
              Professional 360° virtual tour services that bring your spaces to life and captivate your audience.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 rounded-lg bg-navy-medium flex items-center justify-center text-cream-muted hover:text-gold hover:bg-gold/10 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-h4 font-semibold text-cream mb-4">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-body text-cream-muted hover:text-cream transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-h4 font-semibold text-cream mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-body text-cream-muted hover:text-cream transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-h4 font-semibold text-cream mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-body text-cream-muted">
                <Mail className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <a href="mailto:z360virtualtours@gmail.com" className="hover:text-cream transition-colors">
                  z360virtualtours@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-body text-cream-muted">
                <Phone className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <a href="tel:+38971967915" className="hover:text-cream transition-colors">
                  +389 71 967 915
                </a>
              </li>
              <li className="flex items-start gap-3 text-body text-cream-muted">
                <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <span>Balkans</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gold/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-caption text-cream-muted">
            © {new Date().getFullYear()} Z360 Virtual Tours. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-caption text-cream-muted hover:text-cream transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
