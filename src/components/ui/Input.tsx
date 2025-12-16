'use client'

import { cn } from '@/lib/utils'
import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-soft">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-navy-medium border border-cream/15 rounded-md',
            'px-4 py-3 text-cream placeholder:text-cream-dim',
            'focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/50',
            'transition-all duration-200',
            icon && 'pl-12',
            error && 'border-error focus:border-error focus:ring-error/50',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-caption text-error">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
