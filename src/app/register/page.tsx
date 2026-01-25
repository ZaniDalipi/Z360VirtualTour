'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react'
import { motion } from 'framer-motion'
import PublicHeader from '@/components/layout/PublicHeader'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain an uppercase letter'
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain a lowercase letter'
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain a number'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setIsSuccess(true)
      } else {
        setError(data.error || 'Registration failed')
        if (data.errors) {
          setErrors(data.errors)
        }
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Password strength indicator
  const getPasswordStrength = () => {
    const password = formData.password
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength()
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500']
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']

  if (isSuccess) {
    return (
      <>
        <PublicHeader />
        <div className="min-h-screen bg-navy flex items-center justify-center p-4 pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-navy-medium border border-cream/10 rounded-2xl p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>

            <h1 className="text-2xl font-bold text-cream mb-3">Check Your Email</h1>

            <p className="text-cream-muted mb-6">
              We&apos;ve sent a verification link to{' '}
              <span className="text-cream">{formData.email}</span>. Please check your inbox and
              click the link to verify your account.
            </p>

            <div className="bg-navy-light rounded-lg p-4 mb-6">
              <p className="text-cream-muted text-sm">
                Didn&apos;t receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-gold hover:underline"
                >
                  try again with a different email
                </button>
              </p>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-gold text-navy-dark rounded-lg font-semibold hover:bg-gold-soft transition-colors"
            >
              Go to Login
            </Link>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-navy flex items-center justify-center p-4 pt-20 pb-24">
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
                <User className="w-8 h-8 text-gold" />
              </div>
              <h1 className="text-2xl font-bold text-cream">Create Account</h1>
              <p className="text-cream-muted mt-2">
                Sign up to request quotes and track your projects
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

            {/* Register form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    placeholder="John Smith"
                    className={`w-full pl-12 pr-4 py-3 bg-navy-light border rounded-lg text-cream placeholder-cream-muted focus:outline-none focus:border-gold transition-colors ${
                      errors.name ? 'border-red-500' : 'border-cream/10'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full pl-12 pr-4 py-3 bg-navy-light border rounded-lg text-cream placeholder-cream-muted focus:outline-none focus:border-gold transition-colors ${
                      errors.email ? 'border-red-500' : 'border-cream/10'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-12 pr-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream placeholder-cream-muted focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  Company
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => updateForm('company', e.target.value)}
                    placeholder="Your company name"
                    className="w-full pl-12 pr-4 py-3 bg-navy-light border border-cream/10 rounded-lg text-cream placeholder-cream-muted focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => updateForm('password', e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-12 py-3 bg-navy-light border rounded-lg text-cream placeholder-cream-muted focus:outline-none focus:border-gold transition-colors ${
                      errors.password ? 'border-red-500' : 'border-cream/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-cream-muted hover:text-cream transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}

                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full ${
                            level <= passwordStrength
                              ? strengthColors[passwordStrength - 1]
                              : 'bg-navy-light'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-cream-muted">
                      Strength: {strengthLabels[passwordStrength - 1] || 'Too weak'}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => updateForm('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-4 py-3 bg-navy-light border rounded-lg text-cream placeholder-cream-muted focus:outline-none focus:border-gold transition-colors ${
                      errors.confirmPassword ? 'border-red-500' : 'border-cream/10'
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gold text-navy-dark rounded-lg font-semibold hover:bg-gold-soft transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-navy-dark border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Login link */}
            <p className="text-center text-cream-muted mt-6">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-gold hover:text-gold-soft font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}
