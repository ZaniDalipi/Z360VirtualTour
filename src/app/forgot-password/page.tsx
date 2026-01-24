'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/Toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const { success, error: toastError } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setIsSubmitted(true)
        success('Email Sent', 'Check your inbox for the reset link')
      } else {
        toastError('Error', data.error || 'Failed to send reset email')
      }
    } catch {
      toastError('Error', 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-navy-medium border border-cream/10 rounded-2xl p-8"
      >
        {!isSubmitted ? (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-gold" />
              </div>
              <h1 className="text-2xl font-bold text-cream mb-2">Forgot Password?</h1>
              <p className="text-cream-muted text-sm">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-cream text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (error) setError('')
                    }}
                    className={`w-full pl-12 pr-4 py-3 bg-navy-light border rounded-lg text-cream placeholder-cream-muted focus:outline-none focus:border-gold transition-colors ${
                      error ? 'border-red-500' : 'border-cream/10'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-gold text-navy-dark rounded-lg font-semibold hover:bg-gold-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-cream-muted hover:text-cream text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-cream mb-3">Check Your Email</h1>
            <p className="text-cream-muted mb-6">
              If an account exists with <span className="text-cream">{email}</span>, you&apos;ll
              receive a password reset link shortly.
            </p>

            <div className="bg-navy-light rounded-lg p-4 mb-6">
              <p className="text-cream-muted text-sm">
                Didn&apos;t receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-gold hover:underline"
                >
                  try again
                </button>
                .
              </p>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-navy-dark rounded-lg font-semibold hover:bg-gold-soft transition-colors"
            >
              Return to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}
