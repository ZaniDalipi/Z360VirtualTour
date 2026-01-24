'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, Eye, EyeOff, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/Toast'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const { success, error } = useToast()

  const [status, setStatus] = useState<'validating' | 'valid' | 'invalid' | 'success' | 'no-token'>(
    'validating'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!token) {
      setStatus('no-token')
      return
    }

    const validateToken = async () => {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${token}`)
        const data = await res.json()

        if (res.ok && data.valid) {
          setStatus('valid')
          setEmail(data.email)
        } else {
          setStatus('invalid')
        }
      } catch {
        setStatus('invalid')
      }
    }

    validateToken()
  }, [token])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must contain an uppercase letter'
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = 'Password must contain a lowercase letter'
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain a number'
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        success('Password Reset', 'You can now log in with your new password')
        setTimeout(() => router.push('/login'), 3000)
      } else {
        error('Reset Failed', data.error || 'Please try again')
        if (data.errors) {
          setErrors(data.errors)
        }
      }
    } catch {
      error('Error', 'Failed to reset password. Please try again.')
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
        {status === 'validating' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-navy-light rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-cream mb-3">Validating Link</h1>
            <p className="text-cream-muted">Please wait...</p>
          </div>
        )}

        {status === 'valid' && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-gold" />
              </div>
              <h1 className="text-2xl font-bold text-cream mb-2">Reset Password</h1>
              <p className="text-cream-muted text-sm">
                Create a new password for <span className="text-cream">{email}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-cream text-sm font-medium mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors((p) => ({ ...p, password: '' }))
                    }}
                    className={`w-full px-4 py-3 pr-12 bg-navy-light border rounded-lg text-cream placeholder-cream-muted focus:outline-none focus:border-gold transition-colors ${
                      errors.password ? 'border-red-500' : 'border-cream/10'
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-cream-muted hover:text-cream"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-cream text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' }))
                    }}
                    className={`w-full px-4 py-3 pr-12 bg-navy-light border rounded-lg text-cream placeholder-cream-muted focus:outline-none focus:border-gold transition-colors ${
                      errors.confirmPassword ? 'border-red-500' : 'border-cream/10'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-cream-muted hover:text-cream"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="bg-navy-light rounded-lg p-4">
                <p className="text-cream-muted text-xs">Password must contain:</p>
                <ul className="text-xs mt-2 space-y-1">
                  <li className={password.length >= 8 ? 'text-green-400' : 'text-cream-dim'}>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(password) ? 'text-green-400' : 'text-cream-dim'}>
                    One uppercase letter
                  </li>
                  <li className={/[a-z]/.test(password) ? 'text-green-400' : 'text-cream-dim'}>
                    One lowercase letter
                  </li>
                  <li className={/[0-9]/.test(password) ? 'text-green-400' : 'text-cream-dim'}>
                    One number
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-gold text-navy-dark rounded-lg font-semibold hover:bg-gold-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </>
        )}

        {status === 'invalid' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-cream mb-3">Invalid or Expired Link</h1>
            <p className="text-cream-muted mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-navy-dark rounded-lg font-semibold hover:bg-gold-soft transition-colors"
            >
              Request New Link
            </Link>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-cream mb-3">Password Reset!</h1>
            <p className="text-cream-muted mb-6">
              Your password has been reset successfully. Redirecting to login...
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-navy-dark rounded-lg font-semibold hover:bg-gold-soft transition-colors"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === 'no-token' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-navy-light rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-cream-muted" />
            </div>
            <h1 className="text-2xl font-bold text-cream mb-3">Missing Reset Token</h1>
            <p className="text-cream-muted mb-6">
              Please use the password reset link sent to your email.
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-navy-dark rounded-lg font-semibold hover:bg-gold-soft transition-colors"
            >
              Request Password Reset
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-navy flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
