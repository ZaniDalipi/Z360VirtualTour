'use client'

import { cn } from '@/lib/utils'

interface ChipProps {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  icon?: React.ReactNode
  className?: string
}

export function Chip({ children, active = false, onClick, icon, className }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
        'transition-all duration-200',
        active
          ? 'bg-cream text-navy'
          : 'bg-navy-medium text-cream-soft border border-cream/20 hover:border-gold/40 hover:bg-gold/10',
        className
      )}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {children}
    </button>
  )
}
