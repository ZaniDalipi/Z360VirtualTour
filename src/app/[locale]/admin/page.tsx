'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Image, Eye, MessageSquare, Mail, TrendingUp, Plus } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { motion } from 'framer-motion'

interface DashboardStats {
  totalTours: number
  totalViews: number
  totalTestimonials: number
  unreadMessages: number
  recentTours: Array<{
    id: string
    title: string
    views: number
    category: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      icon: Image,
      label: 'Total Tours',
      value: stats?.totalTours || 0,
      href: '/admin/tours',
      color: 'bg-blue-500/20 text-blue-400',
    },
    {
      icon: Eye,
      label: 'Total Views',
      value: stats?.totalViews || 0,
      href: '/admin/tours',
      color: 'bg-green-500/20 text-green-400',
    },
    {
      icon: MessageSquare,
      label: 'Testimonials',
      value: stats?.totalTestimonials || 0,
      href: '/admin/testimonials',
      color: 'bg-purple-500/20 text-purple-400',
    },
    {
      icon: Mail,
      label: 'Unread Messages',
      value: stats?.unreadMessages || 0,
      href: '/admin/messages',
      color: 'bg-gold/20 text-gold',
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gold/10 rounded animate-pulse" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gold/10 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 font-bold text-cream">Dashboard</h1>
          <p className="text-body text-cream-muted">
            Welcome back! Here's an overview of your virtual tours.
          </p>
        </div>
        <Link href="/admin/tours/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Tour
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={stat.href}>
                <Card className="p-6 hover:border-gold/40 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-cream-muted">{stat.label}</p>
                      <p className="text-h2 font-bold text-cream mt-1">
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Tours */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-h4 font-semibold text-cream">Recent Tours</h2>
            <Link
              href="/admin/tours"
              className="text-sm text-gold hover:text-gold/80 transition-colors"
            >
              View All →
            </Link>
          </div>

          {stats?.recentTours && stats.recentTours.length > 0 ? (
            <div className="space-y-4">
              {stats.recentTours.map((tour) => (
                <Link
                  key={tour.id}
                  href={`/admin/tours/${tour.id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-navy hover:bg-gold/10 transition-colors"
                >
                  <div>
                    <p className="font-medium text-cream">{tour.title}</p>
                    <p className="text-sm text-cream-muted">{tour.category}</p>
                  </div>
                  <div className="flex items-center gap-2 text-cream-muted">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">{tour.views}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Image className="w-12 h-12 text-cream-muted mx-auto mb-4" />
              <p className="text-cream-muted mb-4">No tours yet</p>
              <Link href="/admin/tours/new">
                <Button variant="secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Tour
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6">
          <h2 className="text-h4 font-semibold text-cream mb-6">Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/tours/new">
              <Button variant="secondary" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Add New Tour
              </Button>
            </Link>
            <Link href="/admin/testimonials">
              <Button variant="secondary" className="w-full justify-start">
                <MessageSquare className="w-4 h-4 mr-2" />
                Manage Testimonials
              </Button>
            </Link>
            <Link href="/admin/messages">
              <Button variant="secondary" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" />
                View Messages
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="secondary" className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2" />
                Site Settings
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
