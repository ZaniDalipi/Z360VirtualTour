'use client'

import { cn } from '@/lib/utils'
import { forwardRef, InputHTMLAttributes, useState } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, hint, type, onInvalid, ...props }, ref) => {
    const [validationError, setValidationError] = useState<string | null>(null)

    // Custom validation messages based on input type
    const handleInvalid = (e: React.InvalidEvent<HTMLInputElement>) => {
      e.preventDefault()

      const input = e.target
      let message = ''

      if (input.validity.valueMissing) {
        message = 'This field is required'
      } else if (input.validity.typeMismatch) {
        if (type === 'email') {
          message = 'Please enter a valid email (e.g., name@example.com)'
        } else if (type === 'tel') {
          message = 'Please enter a valid phone number (e.g., +389 71 234 567)'
        } else if (type === 'url') {
          message = 'Please enter a valid URL (e.g., https://example.com)'
        } else {
          message = 'Please enter a valid value'
        }
      } else if (input.validity.patternMismatch) {
        if (type === 'tel') {
          message = 'Please enter a valid phone number (e.g., +389 71 234 567)'
        } else {
          message = input.title || 'Please match the requested format'
        }
      } else if (input.validity.tooShort) {
        message = `Please enter at least ${input.minLength} characters`
      } else if (input.validity.tooLong) {
        message = `Please enter no more than ${input.maxLength} characters`
      } else {
        message = input.validationMessage
      }

      setValidationError(message)

      if (onInvalid) {
        onInvalid(e)
      }
    }

    const handleInput = () => {
      setValidationError(null)
    }

    // For tel type, remove native pattern validation - accept any format
    const getInputProps = () => {
      if (type === 'tel') {
        return {
          ...props,
          type: 'text', // Use text instead of tel to avoid native pattern validation
          inputMode: 'tel' as const,
          autoComplete: 'tel',
        }
      }
      return { ...props, type }
    }

    const displayError = error || validationError

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
            displayError && 'border-red-500 focus:border-red-500 focus:ring-red-500/50',
            className
          )}
          onInvalid={handleInvalid}
          onInput={handleInput}
          {...getInputProps()}
        />
        {displayError && (
          <p className="mt-1 text-sm text-red-400">{displayError}</p>
        )}
        {hint && !displayError && (
          <p className="mt-1 text-xs text-cream-muted">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
