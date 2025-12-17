'use client'

import { cn } from '@/lib/utils'
import { forwardRef, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold/50 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-cream text-navy hover:scale-[1.02] hover:shadow-glow active:scale-[0.98] active:bg-cream-soft shadow-button',
      secondary: 'bg-transparent border-[1.5px] border-gold/40 text-navy hover:border-gold hover:bg-gold/10',
      ghost: 'bg-transparent text-navy hover:bg-cream/10',
      icon: 'bg-navy-light/50 border border-gold/20 text-navy hover:bg-gold/20 hover:border-gold/40',
    }

    const sizes = {
      sm: variant === 'icon' ? 'w-10 h-10' : 'px-4 py-2 text-sm rounded-sm',
      md: variant === 'icon' ? 'w-12 h-12' : 'px-6 py-3 text-body rounded-md',
      lg: variant === 'icon' ? 'w-14 h-14' : 'px-8 py-4 text-body-lg rounded-md',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          variant === 'icon' && 'rounded-md',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
