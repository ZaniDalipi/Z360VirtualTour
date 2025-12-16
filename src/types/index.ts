// Database model types (matching Prisma schema)
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  order: number
  isActive: boolean
  tours?: Tour[]
  createdAt: Date
  updatedAt: Date
}

export interface Tour {
  id: string
  title: string
  slug: string
  description: string
  shortDesc: string | null
  clientName: string | null
  location: string | null
  coverImage: string
  images: string | null
  tourUrl: string | null
  tourEmbed: string | null
  categoryId: string
  category?: Category
  featured: boolean
  isActive: boolean
  views: number
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Testimonial {
  id: string
  clientName: string
  clientTitle: string | null
  clientImage: string | null
  content: string
  rating: number
  tourId: string | null
  featured: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  priceLabel: string | null
  features: string // JSON array
  isPopular: boolean
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  service: string | null
  message: string
  isRead: boolean
  createdAt: Date
}

export interface SiteSetting {
  id: string
  key: string
  value: string
  updatedAt: Date
}

export interface Admin {
  id: string
  email: string
  name: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Form types
export interface ContactFormData {
  name: string
  email: string
  phone?: string
  company?: string
  service?: string
  message: string
}
