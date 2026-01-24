'use client'

import { useEffect, useState } from 'react'
import { Download, X, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function ServiceWorkerRegistration() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          setRegistration(reg)
          console.log('[PWA] Service worker registered')

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setShowUpdatePrompt(true)
                }
              })
            }
          })
        })
        .catch((error) => {
          console.log('[PWA] Service worker registration failed:', error)
        })
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Check if user has dismissed before
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (!dismissed) {
        // Show prompt after 30 seconds
        setTimeout(() => setShowInstallPrompt(true), 30000)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      console.log('[PWA] App installed successfully')
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted install prompt')
    } else {
      console.log('[PWA] User dismissed install prompt')
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismissInstall = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
    setShowUpdatePrompt(false)
  }

  return (
    <>
      {/* Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && deferredPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:max-w-sm"
          >
            <div className="bg-navy-medium border border-gold/30 rounded-xl shadow-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Download className="w-6 h-6 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-cream font-semibold">Install Z360 App</h3>
                  <p className="text-cream-muted text-sm mt-1">
                    Add to your home screen for quick access and offline support.
                  </p>
                </div>
                <button
                  onClick={handleDismissInstall}
                  className="p-1 text-cream-muted hover:text-cream transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleDismissInstall}
                  className="flex-1 px-4 py-2 text-cream-muted hover:text-cream text-sm font-medium transition-colors"
                >
                  Not Now
                </button>
                <button
                  onClick={handleInstall}
                  className="flex-1 px-4 py-2 bg-gold text-navy-dark rounded-lg font-medium text-sm hover:bg-gold-soft transition-colors"
                >
                  Install
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Prompt */}
      <AnimatePresence>
        {showUpdatePrompt && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:max-w-sm"
          >
            <div className="bg-navy-medium border border-gold/30 rounded-xl shadow-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-5 h-5 text-gold" />
                </div>
                <div className="flex-1">
                  <h3 className="text-cream font-semibold text-sm">Update Available</h3>
                  <p className="text-cream-muted text-xs">
                    A new version is ready to install.
                  </p>
                </div>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-gold text-navy-dark rounded-lg font-medium text-sm hover:bg-gold-soft transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
