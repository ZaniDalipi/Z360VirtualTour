'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ClipboardList, Calendar, Bell, Palette, Shield, HelpCircle,
  FileText, LogOut, ChevronRight, Settings, Loader2
} from 'lucide-react'
import { Navbar } from '@/components/layout'
import { Card, Button } from '@/components/ui'
import { motion } from 'framer-motion'

interface User {
  id: string
  email: string
  name: string
  phone?: string
  company?: string
  avatar?: string
}

interface Stats {
  total: number
  pending: number
  confirmed: number
  completed: number
}

const menuItems = [
  { icon: ClipboardList, label: 'My Tours', href: '/profile/tours', description: 'View your tour bookings' },
  { icon: Calendar, label: 'Scheduled Visits', href: '/profile/tours?filter=scheduled', badge: null },
  { icon: Bell, label: 'Notifications', href: '/profile/notifications' },
  { icon: Settings, label: 'Account Settings', href: '/profile/settings' },
  { icon: Shield, label: 'Privacy & Security', href: '/profile/security' },
  { icon: HelpCircle, label: 'Help & Support', href: '/profile/support' },
  { icon: FileText, label: 'Terms & Privacy', href: '/terms' },
]

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        // Check authentication
        const authRes = await fetch('/api/user/auth/me')
        if (!authRes.ok) {
          router.push('/login')
          return
        }

        const authData = await authRes.json()
        setUser(authData.user)

        // Fetch booking stats
        const bookingsRes = await fetch('/api/user/bookings')
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json()
          setStats(bookingsData.stats)
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/user/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setLoggingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const displayStats = [
    { label: 'Total', value: stats?.total || 0 },
    { label: 'Active', value: stats?.confirmed || 0 },
    { label: 'Completed', value: stats?.completed || 0 },
  ]

  // Update badge for scheduled visits
  const menuItemsWithBadges = menuItems.map(item => {
    if (item.label === 'Scheduled Visits' && stats?.confirmed) {
      return { ...item, badge: stats.confirmed.toString() }
    }
    return item
  })

  return (
    <div className="min-h-screen bg-navy pb-20">
      <header className="sticky top-0 z-40 bg-navy/95 backdrop-blur-lg border-b border-gold/10">
        <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
          <h1 className="text-h4 font-semibold text-cream">Profile</h1>
          <Link href="/profile/settings">
            <Button variant="icon" size="sm">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="relative w-24 h-24 mx-auto mb-4">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt="Profile"
                fill
                className="object-cover rounded-full border-2 border-gold"
              />
            ) : (
              <div className="w-full h-full rounded-full border-2 border-gold bg-navy-light flex items-center justify-center">
                <span className="text-3xl font-bold text-gold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <h2 className="text-h2 font-bold text-cream">{user.name}</h2>
          <p className="text-body text-cream-muted">{user.email}</p>
          {user.company && (
            <p className="text-body-sm text-cream-dim mt-1">{user.company}</p>
          )}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="grid grid-cols-3 divide-x divide-gold/10">
            {displayStats.map((stat) => (
              <div key={stat.label} className="py-4 text-center">
                <p className="text-h2 font-bold text-gold">{stat.value}</p>
                <p className="text-caption text-cream-muted">{stat.label}</p>
              </div>
            ))}
          </Card>
        </motion.div>

        {/* Quick Action - View Tours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <Link href="/profile/tours">
            <Card className="p-4 bg-gold/10 border-gold/20 hover:bg-gold/15 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-body font-semibold text-cream">View My Tours</h3>
                  <p className="text-body-sm text-cream-muted">
                    {stats?.pending ? `${stats.pending} pending request${stats.pending > 1 ? 's' : ''}` : 'No pending requests'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gold" />
              </div>
            </Card>
          </Link>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="divide-y divide-gold/10">
            {menuItemsWithBadges.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between p-4 hover:bg-gold/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-gold" />
                    <span className="text-body text-cream">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="bg-gold text-navy text-caption px-2 py-0.5 rounded-full font-medium">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-cream-muted" />
                  </div>
                </Link>
              )
            })}
          </Card>
        </motion.div>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="secondary"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogOut className="w-5 h-5" />
            )}
            {loggingOut ? 'Signing Out...' : 'Sign Out'}
          </Button>
        </motion.div>

        {/* Version */}
        <p className="text-center text-caption text-cream-dim mt-8">
          Z360 Virtual Tours v2.0.0
        </p>
      </main>

      <Navbar />
    </div>
  )
}
