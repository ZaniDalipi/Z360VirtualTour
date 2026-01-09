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

/**
 * Sanitize HTML content for safe rendering
 * Allows only iframe elements from trusted sources (tour providers)
 * Strips all other potentially dangerous HTML
 */
export function sanitizeEmbedHTML(html: string): string {
  if (!html) return ''

  // List of trusted domains for tour embeds
  const trustedDomains = [
    'kuula.co',
    'matterport.com',
    'my.matterport.com',
    'app.cloudpano.com',
    'cloudpano.com',
    'momento360.com',
    'viewin360.co',
    'www.google.com/maps',
    'youtube.com',
    'www.youtube.com',
    'player.vimeo.com',
  ]

  // Create a temporary DOM element to parse HTML
  if (typeof window === 'undefined') {
    // Server-side: basic regex sanitization
    // Only allow iframe tags with src from trusted domains
    const iframeRegex = /<iframe[^>]*src=["']([^"']+)["'][^>]*><\/iframe>/gi
    const matches = html.match(iframeRegex)

    if (!matches) return ''

    return matches
      .filter((iframe) => {
        const srcMatch = iframe.match(/src=["']([^"']+)["']/)
        if (!srcMatch) return false
        const src = srcMatch[1]
        return trustedDomains.some((domain) => src.includes(domain))
      })
      .join('')
  }

  // Client-side: use DOMParser for safer parsing
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const iframes = doc.querySelectorAll('iframe')

  const safeIframes: string[] = []

  iframes.forEach((iframe) => {
    const src = iframe.getAttribute('src') || ''
    // Check if src is from trusted domain
    if (trustedDomains.some((domain) => src.includes(domain))) {
      // Remove any event handlers and potentially dangerous attributes
      const safeAttrs = ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'allow', 'style', 'title']
      const cleanIframe = document.createElement('iframe')

      safeAttrs.forEach((attr) => {
        const value = iframe.getAttribute(attr)
        if (value) {
          cleanIframe.setAttribute(attr, value)
        }
      })

      safeIframes.push(cleanIframe.outerHTML)
    }
  })

  return safeIframes.join('')
}

/**
 * Check if a URL is from a trusted tour provider
 */
export function isTrustedTourURL(url: string): boolean {
  const trustedDomains = [
    'kuula.co',
    'matterport.com',
    'cloudpano.com',
    'momento360.com',
    'viewin360.co',
  ]

  try {
    const urlObj = new URL(url)
    return trustedDomains.some((domain) => urlObj.hostname.includes(domain))
  } catch {
    return false
  }
}
