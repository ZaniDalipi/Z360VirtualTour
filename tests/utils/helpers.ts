import { testPrisma } from '../setup'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing'

// Helper to create test admin
export async function createTestAdmin(data?: Partial<{
  email: string
  password: string
  name: string
}>) {
  const password = await bcrypt.hash(data?.password || 'testpassword123', 10)
  return testPrisma.admin.create({
    data: {
      email: data?.email || `admin-${Date.now()}@test.com`,
      password,
      name: data?.name || 'Test Admin',
    },
  })
}

// Helper to create test user
export async function createTestUser(data?: Partial<{
  email: string
  password: string
  name: string
  phone: string
  company: string
}>) {
  const password = await bcrypt.hash(data?.password || 'testpassword123', 10)
  return testPrisma.user.create({
    data: {
      email: data?.email || `user-${Date.now()}@test.com`,
      password,
      name: data?.name || 'Test User',
      phone: data?.phone,
      company: data?.company,
    },
  })
}

// Helper to create JWT token for admin
export function createAdminToken(admin: { id: string; email: string; name: string }) {
  return jwt.sign(
    { id: admin.id, email: admin.email, name: admin.name, type: 'admin' },
    JWT_SECRET,
    { expiresIn: '1d' }
  )
}

// Helper to create JWT token for user
export function createUserToken(user: { id: string; email: string; name: string }) {
  return jwt.sign(
    { userId: user.id, email: user.email, type: 'user' },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Helper to create test category
export async function createTestCategory(data?: Partial<{
  name: string
  slug: string
  description: string
}>) {
  const timestamp = Date.now()
  return testPrisma.category.create({
    data: {
      name: data?.name || `Test Category ${timestamp}`,
      slug: data?.slug || `test-category-${timestamp}`,
      description: data?.description || 'Test category description',
      isActive: true,
    },
  })
}

// Helper to create test tour
export async function createTestTour(categoryId: string, data?: Partial<{
  title: string
  slug: string
  description: string
  clientName: string
  location: string
  coverImage: string
  featured: boolean
  premium: boolean
  highlight: boolean
}>) {
  const timestamp = Date.now()
  return testPrisma.tour.create({
    data: {
      title: data?.title || `Test Tour ${timestamp}`,
      slug: data?.slug || `test-tour-${timestamp}`,
      description: data?.description || 'Test tour description',
      clientName: data?.clientName || 'Test Client',
      location: data?.location || 'Test Location',
      coverImage: data?.coverImage || 'https://example.com/image.jpg',
      categoryId,
      featured: data?.featured ?? false,
      premium: data?.premium ?? false,
      highlight: data?.highlight ?? false,
      isActive: true,
    },
  })
}

// Helper to create test booking
export async function createTestBooking(data?: Partial<{
  clientName: string
  clientEmail: string
  clientPhone: string
  propertyAddress: string
  propertyCity: string
  status: string
  totalQuote: number
}>) {
  return testPrisma.booking.create({
    data: {
      clientName: data?.clientName || 'Test Client',
      clientEmail: data?.clientEmail || `client-${Date.now()}@test.com`,
      clientPhone: data?.clientPhone || '+1234567890',
      propertyAddress: data?.propertyAddress || '123 Test Street',
      propertyCity: data?.propertyCity || 'Test City',
      status: data?.status || 'quote_requested',
      totalQuote: data?.totalQuote || 500,
    },
  })
}

// Helper to create test blocked date
export async function createTestBlockedDate(date: Date, reason?: string) {
  return testPrisma.blockedDate.create({
    data: {
      date,
      reason: reason || 'Test blocked date',
      isAllDay: true,
    },
  })
}

// Helper to create test travel bundle
export async function createTestTravelBundle(data?: Partial<{
  name: string
  city: string
  scheduledDate: Date
  maxParticipants: number
}>) {
  return testPrisma.travelBundle.create({
    data: {
      name: data?.name || `Test Bundle ${Date.now()}`,
      city: data?.city || 'Test City',
      scheduledDate: data?.scheduledDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      maxParticipants: data?.maxParticipants || 10,
      status: 'open',
      isActive: true,
    },
  })
}

// Helper to create expense category
export async function createTestExpenseCategory(data?: Partial<{
  name: string
  description: string
  color: string
}>) {
  return testPrisma.expenseCategory.create({
    data: {
      name: data?.name || `Expense Category ${Date.now()}`,
      description: data?.description || 'Test expense category',
      color: data?.color || '#FF5733',
      isActive: true,
    },
  })
}

// Helper to create expense
export async function createTestExpense(categoryId: string, data?: Partial<{
  description: string
  amount: number
  date: Date
  vendor: string
}>) {
  return testPrisma.expense.create({
    data: {
      description: data?.description || 'Test expense',
      amount: data?.amount || 100,
      date: data?.date || new Date(),
      categoryId,
      vendor: data?.vendor || 'Test Vendor',
    },
  })
}

// Helper to create pricing plan
export async function createTestPricingPlan(data?: Partial<{
  name: string
  description: string
  price: number
  features: string[]
  isPopular: boolean
}>) {
  return testPrisma.pricingPlan.create({
    data: {
      name: data?.name || `Test Plan ${Date.now()}`,
      description: data?.description || 'Test pricing plan',
      price: data?.price || 299,
      features: JSON.stringify(data?.features || ['Feature 1', 'Feature 2', 'Feature 3']),
      isPopular: data?.isPopular ?? false,
      isActive: true,
    },
  })
}

// Helper to create urgency tier
export async function createTestUrgencyTier(data?: Partial<{
  name: string
  displayName: string
  minLeadDays: number
  maxLeadDays: number
  surchargePercent: number
}>) {
  return testPrisma.urgencyTier.create({
    data: {
      name: data?.name || `urgency-${Date.now()}`,
      displayName: data?.displayName || 'Test Urgency',
      minLeadDays: data?.minLeadDays ?? 3,
      maxLeadDays: data?.maxLeadDays,
      surchargePercent: data?.surchargePercent ?? 0,
      isActive: true,
    },
  })
}

// Helper to create travel zone
export async function createTestTravelZone(data?: Partial<{
  name: string
  minDistanceKm: number
  maxDistanceKm: number
  flatFee: number
}>) {
  return testPrisma.travelZone.create({
    data: {
      name: data?.name || `Zone ${Date.now()}`,
      minDistanceKm: data?.minDistanceKm ?? 0,
      maxDistanceKm: data?.maxDistanceKm,
      flatFee: data?.flatFee ?? 0,
      isActive: true,
    },
  })
}
