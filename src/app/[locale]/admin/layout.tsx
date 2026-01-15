'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Image,
  FolderOpen,
  MessageSquare,
  DollarSign,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  Eye,
  CalendarDays,
  CalendarX,
  Clock,
  MapPin,
  Users,
  CalendarCheck,
  User,
  UserCog,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Valid locales for the app
const validLocales = ['en', 'sq', 'mk']

// Helper to extract locale from pathname (handles localePrefix: 'as-needed')
function getLocaleFromPath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  return validLocales.includes(segments[0]) ? segments[0] : 'en'
}

interface AdminUser {
  id: string
  email: string
  name?: string
}

const sidebarLinks = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/tours', icon: Image, label: 'Tours' },
  { href: '/admin/categories', icon: FolderOpen, label: 'Categories' },
  { href: '/admin/testimonials', icon: MessageSquare, label: 'Testimonials' },
  { href: '/admin/pricing', icon: DollarSign, label: 'Pricing' },
  { href: '/admin/messages', icon: Mail, label: 'Messages' },
  { href: '/admin/schedule', icon: CalendarDays, label: 'My Schedule', divider: true },
  { href: '/admin/bookings', icon: CalendarCheck, label: 'All Bookings' },
  { href: '/admin/blocked-dates', icon: CalendarX, label: 'Blocked Dates' },
  { href: '/admin/bundles', icon: Users, label: 'Travel Bundles' },
  { href: '/admin/booking-settings', icon: Settings, label: 'Booking Settings' },
  { href: '/admin/finances', icon: Wallet, label: 'Finances', divider: true },
  { href: '/admin/admins', icon: UserCog, label: 'Admin Users' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<AdminUser | null>(null)

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      if (res.ok) {
        const userData = await res.json()
        setUser(userData)
        setIsAuthenticated(true)
        return true
      } else {
        setUser(null)
        setIsAuthenticated(false)
        return false
      }
    } catch {
      setUser(null)
      setIsAuthenticated(false)
      return false
    }
  }, [])

  // Check if we're on the login page (accounting for locale prefix)
  const isLoginPage = pathname.endsWith('/admin/login')

  useEffect(() => {
    const init = async () => {
      const authenticated = await checkAuth()
      // Only redirect if not authenticated and not already on login page
      if (!authenticated && !isLoginPage) {
        const locale = getLocaleFromPath(pathname)
        // For default locale, don't add prefix (as-needed)
        const loginPath = locale === 'en' ? '/admin/login' : `/${locale}/admin/login`
        router.replace(loginPath)
      }
    }
    init()
  }, [pathname, router, checkAuth, isLoginPage])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {
      // Continue with logout even if request fails
    }
    setUser(null)
    setIsAuthenticated(false)
    const locale = getLocaleFromPath(pathname)
    const loginPath = locale === 'en' ? '/admin/login' : `/${locale}/admin/login`
    router.replace(loginPath)
  }

  // Show login page without layout
  if (isLoginPage) {
    return <>{children}</>
  }

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-navy">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-navy-dark border-r border-gold/10 transform transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gold/10">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-gold" />
              </div>
              <span className="text-lg font-bold text-cream">
                Z<span className="text-gold">360</span>
              </span>
            </Link>
            <button
              className="lg:hidden p-1 text-cream-muted hover:text-cream"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link, index) => {
              const Icon = link.icon
              const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href))
              return (
                <div key={link.href}>
                  {(link as { divider?: boolean }).divider && (
                    <div className="my-4 border-t border-gold/10" />
                  )}
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-body transition-colors',
                      isActive
                        ? 'bg-gold text-navy font-medium'
                        : 'text-cream-muted hover:text-cream hover:bg-gold/10'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                </div>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gold/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-body text-cream-muted hover:text-cream hover:bg-gold/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-navy/95 backdrop-blur-lg border-b border-gold/10">
          <div className="flex items-center justify-between h-full px-6">
            <button
              className="lg:hidden p-2 text-cream-muted hover:text-cream"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              {user && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-cream-muted">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-gold" />
                  </div>
                  <span>{user.name || user.email}</span>
                </div>
              )}
              <Link
                href="/"
                target="_blank"
                className="text-sm text-cream-muted hover:text-cream transition-colors"
              >
                View Site →
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
