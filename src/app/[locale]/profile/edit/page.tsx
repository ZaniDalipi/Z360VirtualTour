'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, Eye, EyeOff } from 'lucide-react'
import { Navbar } from '@/components/layout'
import { Card, Button, Input } from '@/components/ui'
import { motion } from 'framer-motion'

interface User {
  id: string
  email: string
  name: string
  phone?: string
  company?: string
}

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/user/auth/me')
        if (!res.ok) {
          router.push('/login')
          return
        }

        const data = await res.json()
        setFormData(prev => ({
          ...prev,
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          company: data.user.company || '',
        }))
      } catch (error) {
        console.error('Failed to load profile:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    // Validate passwords if changing
    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        setMessage({ type: 'error', text: 'New password must be at least 8 characters' })
        setSaving(false)
        return
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match' })
        setSaving(false)
        return
      }
      if (!formData.currentPassword) {
        setMessage({ type: 'error', text: 'Current password is required to change password' })
        setSaving(false)
        return
      }
    }

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone || null,
          company: formData.company || null,
          ...(formData.newPassword && {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' })
        return
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' })

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }))
    } catch (error) {
      console.error('Failed to update profile:', error)
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy pb-20">
      <header className="sticky top-0 z-40 bg-navy/95 backdrop-blur-lg border-b border-gold/10">
        <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Button variant="icon" size="sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-h4 font-semibold text-cream">Edit Profile</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit}>
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-body font-semibold text-cream mb-4">Profile Information</h2>
            <Card className="p-4 space-y-4">
              <div>
                <label className="block text-body-sm text-cream-muted mb-2">Full Name</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-body-sm text-cream-muted mb-2">Email</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="opacity-60"
                />
                <p className="text-caption text-cream-muted mt-1">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>
              <div>
                <label className="block text-body-sm text-cream-muted mb-2">Phone (optional)</label>
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+389 71 234 567"
                />
              </div>
              <div>
                <label className="block text-body-sm text-cream-muted mb-2">Company (optional)</label>
                <Input
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Your company name"
                />
              </div>
            </Card>
          </motion.div>

          {/* Change Password */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="text-body font-semibold text-cream mb-4">Change Password</h2>
            <Card className="p-4 space-y-4">
              <div>
                <label className="block text-body-sm text-cream-muted mb-2">Current Password</label>
                <div className="relative">
                  <Input
                    name="currentPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-muted hover:text-cream"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-body-sm text-cream-muted mb-2">New Password</label>
                <div className="relative">
                  <Input
                    name="newPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password (min 8 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-muted hover:text-cream"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-body-sm text-cream-muted mb-2">Confirm New Password</label>
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                />
              </div>
              <p className="text-caption text-cream-muted">
                Leave password fields empty if you don&apos;t want to change it.
              </p>
            </Card>
          </motion.div>

          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                  : 'bg-red-500/20 border border-red-500/30 text-red-400'
              }`}
            >
              {message.text}
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </motion.div>
        </form>
      </main>

      <Navbar />
    </div>
  )
}
