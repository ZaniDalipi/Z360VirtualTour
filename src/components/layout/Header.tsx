'use client'

import Link from 'next/link'
import { Menu, Bell, User } from 'lucide-react'
import { Button } from '@/components/ui'

interface HeaderProps {
  showMenu?: boolean
  title?: string
  showBack?: boolean
  onBack?: () => void
}

export function Header({ showMenu = true, title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-navy/95 backdrop-blur-lg border-b border-gold/10">
      <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
        {showMenu ? (
          <Button variant="icon" size="sm">
            <Menu className="w-5 h-5" />
          </Button>
        ) : (
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-cream">
              Z<span className="text-gold">360</span>
            </div>
          </Link>
        )}

        {title && (
          <h1 className="text-h4 font-semibold text-cream">{title}</h1>
        )}

        <div className="flex items-center gap-2">
          <Button variant="icon" size="sm">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="icon" size="sm">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
