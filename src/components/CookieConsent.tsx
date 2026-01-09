'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, Settings } from 'lucide-react'
import { Button } from '@/components/ui'

const COOKIE_CONSENT_KEY = 'z360-cookie-consent'

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    }
    savePreferences(allAccepted)
  }

  const handleAcceptNecessary = () => {
    const necessaryOnly: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    }
    savePreferences(necessaryOnly)
  }

  const handleSavePreferences = () => {
    savePreferences(preferences)
  }

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      preferences: prefs,
      timestamp: new Date().toISOString(),
    }))
    setShowBanner(false)
    setShowSettings(false)
  }

  if (!showBanner) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-navy-dark border border-gold/20 rounded-xl shadow-2xl overflow-hidden">
            {/* Main Banner */}
            <AnimatePresence mode="wait">
              {!showSettings ? (
                <motion.div
                  key="banner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gold/10 flex items-center justify-center">
                        <Cookie className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-cream mb-2">
                        We value your privacy
                      </h3>
                      <p className="text-xs sm:text-sm text-cream-muted mb-4">
                        We use cookies to enhance your browsing experience, analyze site traffic,
                        and personalize content. By clicking &quot;Accept All&quot;, you consent to our use of cookies.
                        Read our{' '}
                        <Link href="/cookies" className="text-gold hover:underline">
                          Cookie Policy
                        </Link>{' '}
                        to learn more.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <Button
                          onClick={handleAcceptAll}
                          className="w-full sm:w-auto text-sm"
                        >
                          Accept All
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={handleAcceptNecessary}
                          className="w-full sm:w-auto text-sm"
                        >
                          Necessary Only
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setShowSettings(true)}
                          className="w-full sm:w-auto text-sm"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Customize
                        </Button>
                      </div>
                    </div>
                    <button
                      onClick={handleAcceptNecessary}
                      className="absolute top-3 right-3 sm:relative sm:top-0 sm:right-0 p-1 text-cream-muted hover:text-cream transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 sm:p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-cream">
                      Cookie Preferences
                    </h3>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="p-1 text-cream-muted hover:text-cream transition-colors"
                      aria-label="Back"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    {/* Necessary Cookies */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-navy-medium">
                      <input
                        type="checkbox"
                        checked={preferences.necessary}
                        disabled
                        className="mt-1 h-4 w-4 rounded border-gold/30 bg-navy text-gold focus:ring-gold/50 cursor-not-allowed"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-cream">Necessary</span>
                          <span className="text-xs px-2 py-0.5 bg-gold/20 text-gold rounded">Required</span>
                        </div>
                        <p className="text-xs text-cream-muted mt-1">
                          Essential cookies for the website to function properly. Cannot be disabled.
                        </p>
                      </div>
                    </div>

                    {/* Analytics Cookies */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-navy-medium">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-gold/30 bg-navy text-gold focus:ring-gold/50 cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-cream">Analytics</span>
                        <p className="text-xs text-cream-muted mt-1">
                          Help us understand how visitors interact with our website by collecting anonymous information.
                        </p>
                      </div>
                    </div>

                    {/* Marketing Cookies */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-navy-medium">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-gold/30 bg-navy text-gold focus:ring-gold/50 cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-cream">Marketing</span>
                        <p className="text-xs text-cream-muted mt-1">
                          Used to track visitors across websites to display relevant advertisements.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                      onClick={handleSavePreferences}
                      className="w-full sm:w-auto text-sm"
                    >
                      Save Preferences
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleAcceptAll}
                      className="w-full sm:w-auto text-sm"
                    >
                      Accept All
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
