import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`
  }
  return `$${(price / 1000).toFixed(0)}K`
}

export function formatArea(sqft: number): string {
  return `${sqft.toLocaleString()} sqft`
}

/**
 * Format date in European format (DD.MM.YYYY or with weekday/month name)
 * Uses dots as separator for European style
 */
export function formatDateEU(dateStr: string | Date, options?: {
  includeWeekday?: boolean
  includeTime?: boolean
  shortMonth?: boolean
}): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr

  if (options?.includeWeekday) {
    // "Monday, 6 January 2025"
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (options?.shortMonth) {
    // "6 Jan 2025"
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  // Default: "06.01.2025" (European with dots)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}
