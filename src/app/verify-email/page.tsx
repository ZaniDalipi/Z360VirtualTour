'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import { motion } from 'framer-motion'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('no-token')
      return
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()

        if (res.ok) {
          setStatus('success')
          setMessage(data.message || 'Email verified successfully!')
        } else {
          setStatus('error')
          setMessage(data.error || 'Verification failed')
        }
      } catch {
        setStatus('error')
        setMessage('Failed to verify email. Please try again.')
      }
    }

    verifyEmail()
  }, [token])

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-navy-medium border border-cream/10 rounded-2xl p-8 text-center"
      >
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-navy-light rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-cream mb-3">Verifying Your Email</h1>
            <p className="text-cream-muted">Please wait while we verify your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-cream mb-3">Email Verified!</h1>
            <p className="text-cream-muted mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-navy-dark rounded-lg font-semibold hover:bg-gold-soft transition-colors"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-cream mb-3">Verification Failed</h1>
            <p className="text-cream-muted mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                href="/login"
                className="block w-full px-6 py-3 bg-gold text-navy-dark rounded-lg font-semibold hover:bg-gold-soft transition-colors"
              >
                Go to Login
              </Link>
              <Link
                href="/contact"
                className="block w-full px-6 py-3 bg-navy-light text-cream rounded-lg font-medium hover:bg-navy transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </>
        )}

        {status === 'no-token' && (
          <>
            <div className="w-16 h-16 bg-navy-light rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-cream-muted" />
            </div>
            <h1 className="text-2xl font-bold text-cream mb-3">No Verification Token</h1>
            <p className="text-cream-muted mb-6">
              Please use the verification link sent to your email.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-navy-dark rounded-lg font-semibold hover:bg-gold-soft transition-colors"
            >
              Go to Home
            </Link>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
