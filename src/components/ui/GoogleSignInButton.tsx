'use client'

import { useEffect, useRef, useCallback } from 'react'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void
          prompt: () => void
        }
      }
    }
  }
}

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void
  onError?: () => void
  text?: 'signin_with' | 'signup_with' | 'continue_with'
  disabled?: boolean
}

export function GoogleSignInButton({ onSuccess, onError, text = 'signin_with', disabled }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  const handleCredentialResponse = useCallback((response: { credential: string }) => {
    if (response.credential) {
      onSuccess(response.credential)
    } else {
      onError?.()
    }
  }, [onSuccess, onError])

  useEffect(() => {
    if (initializedRef.current) return

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) return

    const initializeGoogle = () => {
      if (!window.google || !buttonRef.current) return

      initializedRef.current = true

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      })

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'filled_black',
        size: 'large',
        text,
        shape: 'rectangular',
        logo_alignment: 'left',
        width: buttonRef.current.offsetWidth,
      })
    }

    // Try initializing immediately if Google script is already loaded
    if (window.google) {
      initializeGoogle()
      return
    }

    // Otherwise wait for script to load
    const checkGoogle = setInterval(() => {
      if (window.google) {
        clearInterval(checkGoogle)
        initializeGoogle()
      }
    }, 100)

    // Cleanup after 10 seconds
    const timeout = setTimeout(() => clearInterval(checkGoogle), 10000)

    return () => {
      clearInterval(checkGoogle)
      clearTimeout(timeout)
    }
  }, [handleCredentialResponse, text])

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  // Fallback button when Google client ID is not configured
  if (!clientId) {
    return (
      <button
        type="button"
        disabled
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-cream/10 bg-cream/5 text-cream-muted text-sm opacity-50 cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google Sign-In (not configured)
      </button>
    )
  }

  return (
    <div className={`w-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div ref={buttonRef} className="w-full flex justify-center [&>div]:!w-full" />
    </div>
  )
}
