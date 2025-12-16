'use client'

import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'tour'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-navy-medium text-cream-soft border-cream/20',
    success: 'bg-success/20 text-success border-success/30',
    warning: 'bg-gold/20 text-gold border-gold/30',
    error: 'bg-error/20 text-error border-error/30',
    tour: 'bg-gold text-navy border-gold font-semibold',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-caption rounded-full border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
