'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  ClipboardList, Calendar, Bell, Palette, Shield, HelpCircle,
  FileText, LogOut, ChevronRight, Settings
} from 'lucide-react'
import { Header, Navbar } from '@/components/layout'
import { Card, Button } from '@/components/ui'
import { motion } from 'framer-motion'

const menuItems = [
  { icon: ClipboardList, label: 'My Tour History', href: '/profile/history' },
  { icon: Calendar, label: 'Scheduled Visits', href: '/profile/visits', badge: '2' },
  { icon: Bell, label: 'Notifications', href: '/profile/notifications' },
  { icon: Palette, label: 'Appearance', href: '/profile/appearance' },
  { icon: Shield, label: 'Privacy & Security', href: '/profile/security' },
  { icon: HelpCircle, label: 'Help & Support', href: '/profile/support' },
  { icon: FileText, label: 'Terms & Privacy', href: '/profile/terms' },
]

const stats = [
  { label: 'Saved', value: 12 },
  { label: 'Toured', value: 48 },
  { label: 'Visited', value: 5 },
]

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-navy pb-20">
      <header className="sticky top-0 z-40 bg-navy/95 backdrop-blur-lg border-b border-gold/10">
        <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
          <h1 className="text-h4 font-semibold text-cream">Profile</h1>
          <Button variant="icon" size="sm">
            <Settings className="w-5 h-5" />
          </Button>
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
            <Image
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
              alt="Profile"
              fill
              className="object-cover rounded-full border-2 border-gold"
            />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gold rounded-full flex items-center justify-center border-2 border-navy">
              <span className="text-navy font-bold text-sm">A</span>
            </div>
          </div>
          <h2 className="text-h2 font-bold text-cream">Alex Johnson</h2>
          <p className="text-body text-cream-muted">alex@email.com</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="grid grid-cols-3 divide-x divide-gold/10">
            {stats.map((stat) => (
              <div key={stat.label} className="py-4 text-center">
                <p className="text-h2 font-bold text-gold">{stat.value}</p>
                <p className="text-caption text-cream-muted">{stat.label}</p>
              </div>
            ))}
          </Card>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="divide-y divide-gold/10">
            {menuItems.map((item, index) => {
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
          <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
            <LogOut className="w-5 h-5" />
            Sign Out
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
