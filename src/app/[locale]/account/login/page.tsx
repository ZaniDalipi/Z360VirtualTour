'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Link, useRouter } from '@/i18n/routing'
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Button, Card, Input, GoogleSignInButton } from '@/components/ui'
import { PublicHeader, Footer } from '@/components/layout'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const t = useTranslations('auth')
  const { login, loginWithGoogle, isAuthenticated, isInitialized } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace('/account')
    }
  }, [isAuthenticated, isInitialized, router])

  // Show loading while checking auth to prevent flicker
  if (!isInitialized || isAuthenticated) {
    return (
      <div className="min-h-screen bg-navy">
        <PublicHeader />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await login(email, password)

      if (result.success) {
        router.replace('/account')
      } else {
        setError(result.error || t('invalidCredentials'))
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

      <div className="flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)] sm:min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-md"
        >
          <Card className="p-5 sm:p-8 rounded-2xl">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="relative h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4">
                <Image
                  src="/images/logo-mobile.svg"
                  alt="Z360 Virtual Tours"
                  fill
                  className="object-contain"
                />
              </div>
              <h1 className="text-xl sm:text-h3 font-bold text-cream">
                {t('welcomeBack')}
              </h1>
              <p className="text-sm sm:text-body text-cream-muted mt-1 sm:mt-2">
                {t('loginSubtitle')}
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

            {/* Google Sign-In */}
            <div className="mb-4 sm:mb-6">
              <GoogleSignInButton
                onSuccess={handleGoogleSuccess}
                text="signin_with"
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

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-cream mb-1.5 sm:mb-2">
                  {t('email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('enterEmail')}
                    className="pl-10 sm:pl-12 h-11 sm:h-auto text-base"
                    required
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                  <label className="block text-sm font-medium text-cream">
                    {t('password')}
                  </label>
                  <Link href="/account/forgot-password" className="text-sm text-gold hover:text-gold/80 active:text-gold/60 py-1 touch-manipulation">
                    {t('forgotPassword', { defaultValue: 'Forgot password?' })}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('enterPassword')}
                    className="pl-10 sm:pl-12 pr-12 h-11 sm:h-auto text-base"
                    required
                    autoComplete="current-password"
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

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 sm:h-auto text-base touch-manipulation"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin mr-2" />
                    {t('signingIn')}
                  </>
                ) : (
                  t('signIn')
                )}
              </Button>
            </form>

            <p className="text-sm text-cream-muted text-center mt-5 sm:mt-6">
              {t('dontHaveAccount')}{' '}
              <Link href="/account/signup" className="text-gold hover:text-gold/80 active:text-gold/60 font-medium">
                {t('signUp')}
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
