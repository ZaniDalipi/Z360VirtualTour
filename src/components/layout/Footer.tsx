'use client'

import { Link } from '@/i18n/routing'
import Image from 'next/image'
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, Eye } from 'lucide-react'
import { useTranslations } from 'next-intl'

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Twitter, href: '#', label: 'Twitter' },
]

export function Footer() {
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')

  const footerLinks = {
    services: [
      { label: t('realEstateTours'), href: '/tours?category=real-estate' },
      { label: t('businessTours'), href: '/tours?category=business' },
      { label: t('hospitalityTours'), href: '/tours?category=hospitality' },
      { label: t('customSolutions'), href: '/contact' },
    ],
    company: [
      { label: t('aboutUs'), href: '/about' },
      { label: t('portfolio'), href: '/tours' },
      { label: tNav('testimonials'), href: '/testimonials' },
      { label: t('pricing'), href: '/pricing' },
      { label: t('contact'), href: '/contact' },
    ],
    legal: [
      { label: t('privacyPolicy'), href: '/privacy' },
      { label: t('termsOfService'), href: '/terms' },
    ],
  }

  return (
    <footer className="bg-navy-dark border-t border-gold/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand - Full width on mobile */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-gold" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-cream">Z</span>
                <span className="text-lg font-bold text-gold">360</span>
                <span className="text-sm text-cream-soft ml-1">Virtual Tours</span>
              </div>
            </Link>
            <p className="text-body text-cream-muted mb-6">
              {t('description')}
            </p>
            <div className="flex gap-2 sm:gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-navy-medium flex items-center justify-center text-cream-muted hover:text-gold hover:bg-gold/10 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-h4 font-semibold text-cream mb-4">{t('services')}</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs sm:text-body text-cream-muted hover:text-cream transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-h4 font-semibold text-cream mb-4">{t('company')}</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs sm:text-body text-cream-muted hover:text-cream transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-h4 font-semibold text-cream mb-4">{t('contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-body text-cream-muted">
                <Mail className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <a href="mailto:z360virtualtours@gmail.com" className="hover:text-cream transition-colors">
                  z360virtualtours@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2 sm:gap-3 text-xs sm:text-body text-cream-muted">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gold flex-shrink-0 mt-0.5" />
                <a href="tel:+38971967915" className="hover:text-cream transition-colors">
                  +389 71 967 915
                </a>
              </li>
              <li className="flex items-start gap-3 text-body text-cream-muted">
                <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <span>{t('location')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Partnership Banner */}
        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gold/10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <span className="text-xs sm:text-sm text-cream-muted">In partnership with</span>
            <a
              href="https://balkanestateai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <Image
                src="/images/balkanestate-logo.svg"
                alt="BalkanEstate"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gold/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-caption text-cream-muted">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
          <div className="flex gap-4 sm:gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs sm:text-caption text-cream-muted hover:text-cream transition-colors"
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
