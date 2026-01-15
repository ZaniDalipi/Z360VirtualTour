'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { User, Mail, Lock, Phone, Building2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Button, Card, Input } from '@/components/ui'
import { PublicHeader, Footer } from '@/components/layout'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

export default function SignupPage() {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('auth')
  const locale = pathname.split('/')[1] || 'en'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

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
        router.push(`/${locale}/account`)
      } else {
        setError(data.error || t('signupError'))
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
                {t('createAccount')}
              </h1>
              <p className="text-body text-cream-muted mt-2">
                {t('signupSubtitle')}
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

            {/* Signup form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  {t('fullName')} *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('enterFullName')}
                    className="pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  {t('email')} *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('enterEmail')}
                    className="pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  {t('password')} *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('enterPassword')}
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
                  {t('confirmPassword')} *
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder={t('confirmYourPassword')}
                    className="pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  {t('phone')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t('enterPhone')}
                    className="pl-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cream mb-2">
                  {t('company')}
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream-muted" />
                  <Input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder={t('enterCompany')}
                    className="pl-12"
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
                    {t('creatingAccount')}
                  </>
                ) : (
                  t('signUp')
                )}
              </Button>
            </form>

            <p className="text-sm text-cream-muted text-center mt-6">
              {t('alreadyHaveAccount')}{' '}
              <Link href="/account/login" className="text-gold hover:text-gold/80">
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
