'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import PublicHeader from '@/components/layout/PublicHeader'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/dashboard')
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-navy flex items-center justify-center p-4 pt-20">
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-md"
        >
          <div className="bg-navy-medium border border-cream/10 rounded-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-gold" />
              </div>
              <h1 className="text-2xl font-bold text-cream">Welcome Back</h1>
              <p className="text-cream-muted mt-2">
                Sign in to view your quotes and projects
              </p>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream placeholder-cream-muted focus:outline-none focus:border-gold transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-cream">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-gold hover:text-gold-soft transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream placeholder-cream-muted focus:outline-none focus:border-gold transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gold text-navy-dark rounded-lg font-semibold hover:bg-gold-soft transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-navy-dark border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-cream/10" />
              <span className="text-cream-muted text-sm">or</span>
              <div className="flex-1 h-px bg-cream/10" />
            </div>

            {/* Register link */}
            <p className="text-center text-cream-muted">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-gold hover:text-gold-soft font-medium transition-colors"
              >
                Create one
              </Link>
            </p>

            {/* Admin link */}
            <p className="text-center text-cream-dim text-xs mt-4">
              Admin?{' '}
              <Link href="/admin" className="text-cream-muted hover:text-cream transition-colors">
                Go to admin panel
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}
