/**
 * Validation helpers and format utilities
 */

// Phone number formats the app accepts
export const PHONE_FORMATS = {
  examples: ['+389 71 234 567', '+1 555-123-4567', '071 234 567'],
  description: 'Phone numbers with or without country code',
  pattern: /^[+]?[\d\s\-().]{6,20}$/,
}

// Email format
export const EMAIL_FORMATS = {
  examples: ['name@example.com'],
  description: 'Standard email format',
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
}

/**
 * Validate phone number
 * Accepts various formats: +389 71 234 567, 071-234-567, (555) 123-4567
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false
  // Remove all spaces, dashes, parentheses for validation
  const cleaned = phone.replace(/[\s\-().]/g, '')
  // Must be at least 6 digits, can start with +
  return /^[+]?\d{6,15}$/.test(cleaned)
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string): string {
  if (!phone) return ''
  // Basic cleanup - keep the original format mostly
  return phone.trim()
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false
  return EMAIL_FORMATS.pattern.test(email)
}

/**
 * Get user-friendly validation message
 */
export function getPhoneValidationMessage(): string {
  return `Please enter a valid phone number (e.g., ${PHONE_FORMATS.examples[0]})`
}

/**
 * Get user-friendly email validation message
 */
export function getEmailValidationMessage(): string {
  return `Please enter a valid email address (e.g., ${EMAIL_FORMATS.examples[0]})`
}

/**
 * Sanitize input for display - removes potential XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}
