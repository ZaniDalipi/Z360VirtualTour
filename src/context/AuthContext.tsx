'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  phone: string | null
  company: string | null
  city: string | null
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check session on mount
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/user/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh session - extends the token if still valid
  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/user/refresh', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to refresh session:', error)
    }
  }, [])

  // Login
  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch {
      return { success: false, error: 'Failed to login' }
    }
  }, [])

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetch('/api/user/logout', { method: 'POST' })
    } finally {
      setUser(null)
    }
  }, [])

  // Check session on mount
  useEffect(() => {
    checkSession()
  }, [checkSession])

  // Refresh session periodically (every 30 minutes) to keep it alive
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      refreshSession()
    }, 30 * 60 * 1000) // 30 minutes

    return () => clearInterval(interval)
  }, [user, refreshSession])

  // Refresh session on tab visibility change (when user comes back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        refreshSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user, refreshSession])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
