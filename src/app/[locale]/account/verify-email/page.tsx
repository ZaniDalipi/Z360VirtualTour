'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { AlertCircle, CheckCircle, Mail } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { PublicHeader, Footer } from '@/components/layout'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

export default function VerifyEmailPage() {
  const t = useTranslations('auth')
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('no-token')
        return
      }

      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await res.json()

        if (res.ok) {
          setStatus('success')
        } else {
          setError(data.error || 'Verification failed')
          setStatus('error')
        }
      } catch {
        setError('Failed to verify email')
        setStatus('error')
      }
    }

    verifyEmail()
  }, [token])

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
            {/* Loading State */}
            {status === 'loading' && (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
                <h2 className="text-h3 font-bold text-cream mb-2">
                  {t('verifyingEmail', { defaultValue: 'Verifying Email...' })}
                </h2>
                <p className="text-body text-cream-muted">
                  {t('pleaseWait', { defaultValue: 'Please wait while we verify your email address.' })}
                </p>
              </div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-h3 font-bold text-cream mb-2">
                  {t('emailVerified', { defaultValue: 'Email Verified!' })}
                </h2>
                <p className="text-body text-cream-muted mb-6">
                  {t('emailVerifiedMessage', { defaultValue: 'Your email has been successfully verified. You can now access all features of your account.' })}
                </p>
                <Link href="/account">
                  <Button className="w-full">
                    {t('goToAccount', { defaultValue: 'Go to Account' })}
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* Error State */}
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-h3 font-bold text-cream mb-2">
                  {t('verificationFailed', { defaultValue: 'Verification Failed' })}
                </h2>
                <p className="text-body text-cream-muted mb-6">
                  {error || t('verificationFailedMessage', { defaultValue: 'The verification link is invalid or has expired. Please request a new verification email.' })}
                </p>
                <Link href="/account/login">
                  <Button className="w-full">
                    {t('backToLogin', { defaultValue: 'Back to Login' })}
                  </Button>
                </Link>
              </motion.div>
            )}

            {/* No Token State */}
            {status === 'no-token' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="relative h-16 w-16 mx-auto mb-4">
                  <Image
                    src="/images/logo-mobile.svg"
                    alt="Z360 Virtual Tours"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-gold" />
                </div>
                <h2 className="text-h3 font-bold text-cream mb-2">
                  {t('verifyYourEmail', { defaultValue: 'Verify Your Email' })}
                </h2>
                <p className="text-body text-cream-muted mb-6">
                  {t('checkInboxMessage', { defaultValue: "We've sent a verification link to your email address. Please check your inbox and click the link to verify your account." })}
                </p>
                <p className="text-sm text-cream-muted">
                  {t('didntReceiveEmail', { defaultValue: "Didn't receive the email? Check your spam folder or" })}{' '}
                  <Link href="/account/login" className="text-gold hover:text-gold/80">
                    {t('loginToResend', { defaultValue: 'log in to resend' })}
                  </Link>
                </p>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
