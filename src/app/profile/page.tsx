'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ClipboardList, Calendar, Bell, Palette, Shield, HelpCircle,
  FileText, LogOut, ChevronRight, Settings, Heart, Map, Eye,
  Star, Clock, MapPin, Camera, ExternalLink, Phone, Mail
} from 'lucide-react'
import { Navbar } from '@/components/layout'
import { Card, Button } from '@/components/ui'
import { motion, AnimatePresence } from 'framer-motion'

const menuItems = [
  { icon: ClipboardList, label: 'My Tour History', href: '/profile/history', description: 'View all tours you\'ve taken' },
  { icon: Calendar, label: 'Scheduled Visits', href: '/profile/visits', badge: '2', description: 'Upcoming bookings and appointments' },
  { icon: Bell, label: 'Notifications', href: '/profile/notifications', badge: '3', description: 'Updates and alerts' },
  { icon: Palette, label: 'Appearance', href: '/profile/appearance', description: 'Theme and display settings' },
  { icon: Shield, label: 'Privacy & Security', href: '/profile/security', description: 'Manage your account security' },
  { icon: HelpCircle, label: 'Help & Support', href: '/profile/support', description: 'Get help and contact us' },
  { icon: FileText, label: 'Terms & Privacy', href: '/profile/terms', description: 'Legal information' },
]

const stats = [
  { label: 'Saved', value: 12, icon: Heart, color: 'text-red-400' },
  { label: 'Toured', value: 48, icon: Eye, color: 'text-blue-400' },
  { label: 'Visited', value: 5, icon: MapPin, color: 'text-green-400' },
]

const recentActivity = [
  { type: 'viewed', title: 'Skopje Old Bazaar Tour', time: '2 hours ago', icon: Eye },
  { type: 'saved', title: 'Lake Ohrid Panorama', time: '1 day ago', icon: Heart },
  { type: 'booked', title: 'Matka Canyon Experience', time: '3 days ago', icon: Calendar },
]

const quickActions = [
  { icon: Camera, label: 'Book a Tour', href: '/pricing', color: 'bg-gold/20 text-gold' },
  { icon: Map, label: 'Explore Map', href: '/map', color: 'bg-blue-500/20 text-blue-400' },
  { icon: Heart, label: 'Saved Tours', href: '/saved', color: 'bg-red-500/20 text-red-400' },
  { icon: Phone, label: 'Contact Us', href: '/contact', color: 'bg-green-500/20 text-green-400' },
]

export default function ProfilePage() {
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    // Simulate sign out
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSigningOut(false)
  }

  return (
    <div className="min-h-screen bg-navy pb-20">
      {/* Header with gradient background */}
      <div className="relative">
        <div className="absolute inset-0 h-48 bg-gradient-to-b from-gold/20 to-transparent" />
        <header className="sticky top-0 z-40 bg-navy/80 backdrop-blur-lg border-b border-gold/10">
          <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
            <h1 className="text-h4 font-semibold text-cream">My Profile</h1>
            <Link href="/profile/settings">
              <Button variant="icon" size="sm">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </header>

        <main className="relative max-w-7xl mx-auto px-4 py-6">
          {/* Profile Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 mb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gold/30 shadow-lg shadow-gold/10">
                    <Image
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80"
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-gold to-gold/80 rounded-full flex items-center justify-center border-2 border-navy shadow-lg">
                    <Star className="w-4 h-4 text-navy" />
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-h3 font-bold text-cream mb-1">Alex Johnson</h2>
                  <p className="text-body text-cream-muted mb-3">alex@email.com</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold/10 rounded-full text-xs text-gold font-medium">
                      <Star className="w-3 h-3" />
                      Premium Member
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 rounded-full text-xs text-green-400">
                      <Clock className="w-3 h-3" />
                      Member since 2024
                    </span>
                  </div>
                </div>

                {/* Edit Profile Button */}
                <Button variant="secondary" size="sm" className="hidden sm:flex">
                  Edit Profile
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="grid grid-cols-3">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className={`py-5 text-center ${index !== stats.length - 1 ? 'border-r border-gold/10' : ''}`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                      <p className="text-2xl font-bold text-cream">{stat.value}</p>
                    </div>
                    <p className="text-caption text-cream-muted">{stat.label}</p>
                  </div>
                )
              })}
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <h3 className="text-sm font-semibold text-cream-muted mb-3 px-1">Quick Actions</h3>
            <div className="grid grid-cols-4 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.label} href={action.href}>
                    <Card className="p-4 text-center hover:bg-gold/5 transition-colors cursor-pointer">
                      <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mx-auto mb-2`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-cream font-medium">{action.label}</p>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-semibold text-cream-muted">Recent Activity</h3>
              <Link href="/profile/history" className="text-xs text-gold hover:underline">
                View All
              </Link>
            </div>
            <Card className="divide-y divide-gold/10">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="flex items-center gap-3 p-4"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.type === 'viewed' ? 'bg-blue-500/10 text-blue-400' :
                      activity.type === 'saved' ? 'bg-red-500/10 text-red-400' :
                      'bg-green-500/10 text-green-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-cream font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-cream-muted">{activity.time}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-cream-muted flex-shrink-0" />
                  </motion.div>
                )
              })}
            </Card>
          </motion.div>

          {/* Menu Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6"
          >
            <h3 className="text-sm font-semibold text-cream-muted mb-3 px-1">Settings</h3>
            <Card className="divide-y divide-gold/10">
              {menuItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between p-4 hover:bg-gold/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                        <Icon className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <span className="text-body text-cream block">{item.label}</span>
                        <span className="text-xs text-cream-muted">{item.description}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="bg-gold text-navy text-caption px-2 py-0.5 rounded-full font-medium">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-5 h-5 text-cream-muted group-hover:text-gold transition-colors" />
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
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? (
                <>
                  <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </>
              )}
            </Button>
          </motion.div>

          {/* Footer Info */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-caption text-cream-dim">
              Z360 Virtual Tours v2.1.0
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-cream-muted">
              <Link href="/profile/terms" className="hover:text-gold transition-colors">
                Terms of Service
              </Link>
              <span>|</span>
              <Link href="/profile/privacy" className="hover:text-gold transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </main>
      </div>

      <Navbar />
    </div>
  )
}
