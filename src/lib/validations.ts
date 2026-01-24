import { z } from 'zod'

// Common validation patterns
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
const passwordMinLength = 8

// Email validation with custom error messages
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim()

// Password validation with strength requirements
export const passwordSchema = z
  .string()
  .min(passwordMinLength, `Password must be at least ${passwordMinLength} characters`)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

// Simple password for login (no strength check)
export const loginPasswordSchema = z
  .string()
  .min(1, 'Password is required')

// Phone validation
export const phoneSchema = z
  .string()
  .regex(phoneRegex, 'Please enter a valid phone number')
  .or(z.literal(''))
  .optional()

// Required phone (for quotes)
export const requiredPhoneSchema = z
  .string()
  .min(1, 'Phone number is required for callbacks')
  .regex(phoneRegex, 'Please enter a valid phone number')

// Name validation
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .trim()

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
})

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: phoneSchema,
  company: z.string().max(200).optional(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
})

// ============================================
// QUOTE SCHEMAS
// ============================================

export const quoteRequestSchema = z.object({
  // Contact info
  name: nameSchema,
  email: emailSchema,
  phone: requiredPhoneSchema,
  company: z.string().max(200).optional(),

  // Property details
  propertyAddress: z
    .string()
    .min(5, 'Please enter a valid address')
    .max(500, 'Address is too long'),
  propertyCity: z.string().min(2, 'City is required').max(100),
  propertyType: z.enum(['residential', 'commercial', 'hospitality', 'industrial', 'other'], {
    errorMap: () => ({ message: 'Please select a property type' }),
  }),
  propertySize: z.enum(['small', 'medium', 'large', 'xlarge'], {
    errorMap: () => ({ message: 'Please select a property size' }),
  }).optional(),

  // Project description
  projectDescription: z
    .string()
    .min(10, 'Please describe your project (at least 10 characters)')
    .max(2000, 'Description is too long'),
  specialRequests: z.string().max(1000).optional(),

  // Pricing plan
  pricingPlanId: z.string().optional(),

  // Callback preferences
  preferredCallTime: z.enum(['morning', 'afternoon', 'evening'], {
    errorMap: () => ({ message: 'Please select your preferred call time' }),
  }),
  preferredCallDate: z.string().optional().refine(
    (date) => {
      if (!date) return true
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    },
    { message: 'Please select a future date' }
  ),
})

export const quoteCallbackSchema = z.object({
  quoteId: z.string().min(1),
  callbackScheduled: z.string().refine(
    (date) => {
      const selectedDate = new Date(date)
      return !isNaN(selectedDate.getTime())
    },
    { message: 'Please select a valid date and time' }
  ),
  callNotes: z.string().max(2000).optional(),
})

export const quoteUpdateSchema = z.object({
  status: z.enum([
    'pending',
    'callback_scheduled',
    'quoted',
    'accepted',
    'declined',
    'expired',
  ]).optional(),
  finalPrice: z.number().positive().optional(),
  callNotes: z.string().max(2000).optional(),
  internalNotes: z.string().max(2000).optional(),
  quoteValidUntil: z.string().optional(),
})

// ============================================
// CONTACT SCHEMAS
// ============================================

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  company: z.string().max(200).optional(),
  service: z.string().optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message is too long'),
})

// ============================================
// BOOKING SCHEMAS
// ============================================

export const bookingRequestSchema = z.object({
  clientName: nameSchema,
  clientEmail: emailSchema,
  clientPhone: phoneSchema,
  companyName: z.string().max(200).optional(),
  propertyAddress: z.string().min(5, 'Address is required'),
  propertyCity: z.string().optional(),
  serviceType: z.string().optional(),
  projectDescription: z.string().max(2000).optional(),
  specialRequests: z.string().max(1000).optional(),
  pricingPlanId: z.string().optional(),
  urgencyTierId: z.string().optional(),
  preferredDate: z.string().optional(),
  alternateDate: z.string().optional(),
  deadlineDate: z.string().optional(),
  isFlexible: z.boolean().default(true),
  travelBundleId: z.string().optional(),
})

// ============================================
// ADMIN SCHEMAS
// ============================================

export const tourSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(5000).optional(),
  shortDesc: z.string().max(500).optional(),
  clientName: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  coverImage: z.string().url('Please enter a valid image URL'),
  images: z.array(z.string().url()).optional(),
  tourUrl: z.string().url().optional().or(z.literal('')),
  tourEmbed: z.string().max(5000).optional(),
  categoryId: z.string().min(1, 'Category is required'),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export const categorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
})

export const testimonialSchema = z.object({
  clientName: z.string().min(2).max(100),
  clientTitle: z.string().max(200).optional(),
  clientImage: z.string().url().optional().or(z.literal('')),
  content: z.string().min(10).max(1000),
  rating: z.number().int().min(1).max(5).default(5),
  tourId: z.string().optional(),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export const pricingPlanSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500),
  price: z.number().positive(),
  priceLabel: z.string().max(50).optional(),
  features: z.array(z.string()),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
})

// ============================================
// UTILITY FUNCTIONS
// ============================================

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type BookingRequestInput = z.infer<typeof bookingRequestSchema>
export type TourInput = z.infer<typeof tourSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type TestimonialInput = z.infer<typeof testimonialSchema>
export type PricingPlanInput = z.infer<typeof pricingPlanSchema>

// Validation helper function
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodIssue[] } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, errors: result.error.issues }
}

// Format Zod errors for API responses
export function formatZodErrors(errors: z.ZodIssue[]): Record<string, string> {
  const formatted: Record<string, string> = {}
  for (const error of errors) {
    const path = error.path.join('.')
    if (!formatted[path]) {
      formatted[path] = error.message
    }
  }
  return formatted
}

// Get first error message
export function getFirstError(errors: z.ZodIssue[]): string {
  return errors[0]?.message || 'Validation failed'
}
