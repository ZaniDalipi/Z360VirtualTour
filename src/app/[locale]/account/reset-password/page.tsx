'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Link, useRouter } from '@/i18n/routing'
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { Button, Card, Input } from '@/components/ui'
import { PublicHeader, Footer } from '@/components/layout'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

const DynamicResetPasswordForm = dynamic(() => Promise.resolve(ResetPasswordFormContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

export default function ResetPasswordPage() {
  return <DynamicResetPasswordForm />
}

function ResetPasswordFormContent() {
  const router = useRouter()
  const t = useTranslations('auth')
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsValidToken(false)
        return
      }

      try {
        const res = await fetch(`/api/auth/reset-password?token=${token}`)
        const data = await res.json()
        setIsValidToken(data.valid)
      } catch {
        setIsValidToken(false)
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }

    if (password.length < 6) {
      setError(t('passwordTooShort'))
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (res.ok) {
        setIsSuccess(true)
      } else {
        setError(data.error || t('somethingWentWrong'))
      }
    } catch {
      setError(t('somethingWentWrong'))
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state while verifying token
  if (isValidToken === null) {
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

  return (
    <div className="min-h-screen bg-navy">
      <PublicHeader />

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-6 sm:p-8">
            {/* Invalid/Expired Token */}
            {!isValidToken && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-h3 font-bold text-cream mb-2">
                  {t('invalidResetLink', { defaultValue: 'Invalid Reset Link' })}
                </h2>
                <p className="text-body text-cream-muted mb-6">
                  {t('resetLinkExpired', { defaultValue: 'This password reset link is invalid or has expired. Please request a new one.' })}
                </p>
                <Link href="/account/forgot-password">
                  <Button className="w-full">
                    {t('requestNewLink', { defaultValue: 'Request New Link' })}
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* Success State */}
            {isValidToken && isSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-h3 font-bold text-cream mb-2">
                  {t('passwordResetSuccess', { defaultValue: 'Password Reset!' })}
                </h2>
                <p className="text-body text-cream-muted mb-6">
                  {t('passwordResetSuccessMessage', { defaultValue: 'Your password has been successfully reset. You can now log in with your new password.' })}
                </p>
                <Link href="/account/login">
                  <Button className="w-full">
                    {t('signIn')}
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* Reset Password Form */}
            {isValidToken && !isSuccess && (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="relative h-16 w-16 mx-auto mb-4">
                    <Image
                      src="/images/logo-mobile.svg"
                      alt="Z360 Virtual Tours"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h1 className="text-h3 font-bold text-cream">
                    {t('resetPasswordTitle', { defaultValue: 'Reset Password' })}
                  </h1>
                  <p className="text-body text-cream-muted mt-2">
                    {t('resetPasswordSubtitle', { defaultValue: 'Enter your new password below' })}
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      {t('newPassword', { defaultValue: 'New Password' })}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('enterNewPassword', { defaultValue: 'Enter new password' })}
                        className="pl-12 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-cream-muted hover:text-cream"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-cream mb-2">
                      {t('confirmNewPassword', { defaultValue: 'Confirm New Password' })}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t('confirmYourPassword')}
                        className="pl-12"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin mr-2" />
                        {t('resetting', { defaultValue: 'Resetting...' })}
                      </>
                    ) : (
                      t('resetPassword', { defaultValue: 'Reset Password' })
                    )}
                  </Button>
                </form>

                <p className="text-sm text-cream-muted text-center mt-6">
                  <Link href="/account/login" className="text-gold hover:text-gold/80 flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    {t('backToLogin', { defaultValue: 'Back to Login' })}
                  </Link>
                </p>
              </>
            )}
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
