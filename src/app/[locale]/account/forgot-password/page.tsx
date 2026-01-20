'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { Button, Card, Input } from '@/components/ui'
import { PublicHeader, Footer } from '@/components/layout'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setIsSubmitted(true)
      } else {
        setError(data.error || t('somethingWentWrong'))
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

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="p-6 sm:p-8">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-h3 font-bold text-cream mb-2">
                  {t('checkYourEmail', { defaultValue: 'Check Your Email' })}
                </h2>
                <p className="text-body text-cream-muted mb-6">
                  {t('resetLinkSent', { defaultValue: "If an account exists with that email, we've sent password reset instructions." })}
                </p>
                <Link href="/account/login">
                  <Button variant="secondary" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('backToLogin', { defaultValue: 'Back to Login' })}
                  </Button>
                </Link>
              </motion.div>
            ) : (
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
                    {t('forgotPasswordTitle', { defaultValue: 'Forgot Password?' })}
                  </h1>
                  <p className="text-body text-cream-muted mt-2">
                    {t('forgotPasswordSubtitle', { defaultValue: "Enter your email and we'll send you a reset link" })}
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
                      {t('email')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('enterEmail')}
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
                        {t('sending', { defaultValue: 'Sending...' })}
                      </>
                    ) : (
                      t('sendResetLink', { defaultValue: 'Send Reset Link' })
                    )}
                  </Button>
                </form>

                <p className="text-sm text-cream-muted text-center mt-6">
                  {t('rememberPassword', { defaultValue: 'Remember your password?' })}{' '}
                  <Link href="/account/login" className="text-gold hover:text-gold/80">
                    {t('signIn')}
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
