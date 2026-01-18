'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'

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
  isInitialized: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const initRef = useRef(false)

  // Check session on mount
  const checkSession = useCallback(async () => {
    if (initRef.current) return
    initRef.current = true

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
      setIsInitialized(true)
    }
  }, [])

  // Refresh session - extends the token if still valid
  const refreshSession = useCallback(async () => {
    if (!user) return

    try {
      const res = await fetch('/api/user/refresh', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to refresh session:', error)
    }
  }, [user])

  // Login
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Logout
  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await fetch('/api/user/logout', { method: 'POST' })
    } finally {
      setUser(null)
      setIsLoading(false)
    }
  }, [])

  // Check session on mount - only once
  useEffect(() => {
    checkSession()
  }, [checkSession])

  // Refresh session periodically (every 30 minutes) to keep it alive
  useEffect(() => {
    if (!user || !isInitialized) return

    const interval = setInterval(() => {
      refreshSession()
    }, 30 * 60 * 1000) // 30 minutes

    return () => clearInterval(interval)
  }, [user, isInitialized, refreshSession])

  // Refresh session on tab visibility change (when user comes back to tab)
  useEffect(() => {
    if (!isInitialized) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        refreshSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user, isInitialized, refreshSession])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isInitialized,
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
