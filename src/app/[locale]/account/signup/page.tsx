'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Link, useRouter } from '@/i18n/routing'
import { User, Mail, Lock, Phone, Building2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Button, Card, Input, GoogleSignInButton } from '@/components/ui'
import { PublicHeader, Footer } from '@/components/layout'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'

export default function SignupPage() {
  const router = useRouter()
  const t = useTranslations('auth')
  const { loginWithGoogle } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    company: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate email format
    if (!isValidEmail(formData.email)) {
      setError(t('invalidEmail', { defaultValue: 'Please enter a valid email address' }))
      return
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError(t('passwordTooShort'))
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          company: formData.company || undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        router.replace('/account')
      } else {
        setError(data.error || t('signupError'))
      }
    } catch {
      setError(t('somethingWentWrong'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = async (credential: string) => {
    setError('')
    setIsLoading(true)

    try {
      const result = await loginWithGoogle(credential)

      if (result.success) {
        router.replace('/account')
      } else {
        setError(result.error || t('somethingWentWrong'))
      }
    } catch {
      setError(t('somethingWentWrong'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy">
      <PublicHeader />

      <div className="flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-5 sm:p-8">
            {/* Header */}
            <div className="text-center mb-5 sm:mb-8">
              <div className="relative h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4">
                <Image
                  src="/images/logo-mobile.svg"
                  alt="Z360 Virtual Tours"
                  fill
                  className="object-contain"
                />
              </div>
              <h1 className="text-xl sm:text-h3 font-bold text-cream">
                {t('createAccount')}
              </h1>
              <p className="text-sm sm:text-body text-cream-muted mt-1 sm:mt-2">
                {t('signupSubtitle')}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 sm:p-4 mb-4 sm:mb-6 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Google Sign-Up */}
            <div className="mb-4 sm:mb-6">
              <GoogleSignInButton
                onSuccess={handleGoogleSuccess}
                text="signup_with"
                disabled={isLoading}
              />
            </div>

            {/* Divider */}
            <div className="relative mb-4 sm:mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-cream/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-navy-medium text-cream-muted">
                  {t('orContinueWithEmail', { defaultValue: 'or continue with email' })}
                </span>
              </div>
            </div>

            {/* Signup form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium text-cream mb-1.5 sm:mb-2">
                  {t('fullName')} *
                </label>
                <div className="relative">
                  <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('enterFullName')}
                    className="pl-10 sm:pl-12 h-11 sm:h-auto text-base"
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream mb-1.5 sm:mb-2">
                  {t('email')} *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('enterEmail')}
                    className="pl-10 sm:pl-12 h-11 sm:h-auto text-base"
                    required
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream mb-1.5 sm:mb-2">
                  {t('password')} *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('enterPassword')}
                    className="pl-10 sm:pl-12 pr-12 h-11 sm:h-auto text-base"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-cream-muted hover:text-cream p-1 -m-1 touch-manipulation"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream mb-1.5 sm:mb-2">
                  {t('confirmPassword')} *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder={t('confirmYourPassword')}
                    className="pl-10 sm:pl-12 h-11 sm:h-auto text-base"
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream mb-1.5 sm:mb-2">
                  {t('phone')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t('enterPhone')}
                    className="pl-10 sm:pl-12 h-11 sm:h-auto text-base"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream mb-1.5 sm:mb-2">
                  {t('company')}
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <Input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder={t('enterCompany')}
                    className="pl-10 sm:pl-12 h-11 sm:h-auto text-base"
                    autoComplete="organization"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 sm:h-auto text-base touch-manipulation"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin mr-2" />
                    {t('creatingAccount')}
                  </>
                ) : (
                  t('signUp')
                )}
              </Button>
            </form>

            <p className="text-sm text-cream-muted text-center mt-5 sm:mt-6">
              {t('alreadyHaveAccount')}{' '}
              <Link href="/account/login" className="text-gold hover:text-gold/80 active:text-gold/60 font-medium">
                {t('signIn')}
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
