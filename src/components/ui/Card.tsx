'use client'

import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'glass' | 'property'
  hover?: boolean
}

export function Card({ children, className, variant = 'default', hover = false }: CardProps) {
  const variants = {
    default: 'bg-navy-dark border border-gold/10 rounded-lg',
    elevated: 'bg-navy-medium/85 backdrop-blur-2xl border border-gold/15 rounded-lg',
    glass: 'bg-navy-dark/80 backdrop-blur-xl border border-cream/10 rounded-lg',
    property: 'bg-navy-dark border border-gold/10 rounded-lg shadow-card overflow-hidden',
  }

  return (
    <div
      className={cn(
        variants[variant],
        hover && 'transition-all duration-300 hover:border-gold/25 hover:shadow-glow/20 hover:-translate-y-1',
        className
      )}
    >
      {children}
    </div>
  )
}
