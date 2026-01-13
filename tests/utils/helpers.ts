import { PrismaClient } from '@prisma/client'
import { getTestPrisma, isDatabaseConnected } from '../setup'

// Get test prisma client with connection check
export function requireDatabase(): PrismaClient {
  const prisma = getTestPrisma()
  if (!prisma || !isDatabaseConnected()) {
    throw new Error('Database not available')
  }
  return prisma
}

// Skip test if database not available
export function skipIfNoDatabase(): boolean {
  return !isDatabaseConnected()
}

// Clean up test data for a specific collection
export async function cleanupCollection(collection: string): Promise<void> {
  const prisma = getTestPrisma()
  if (!prisma) return

  try {
    switch (collection) {
      case 'booking':
        await prisma.booking.deleteMany({})
        break
      case 'blockedDate':
        await prisma.blockedDate.deleteMany({})
        break
      case 'travelBundle':
        await prisma.travelBundle.deleteMany({})
        break
      case 'urgencyTier':
        await prisma.urgencyTier.deleteMany({})
        break
      case 'travelZone':
        await prisma.travelZone.deleteMany({})
        break
      case 'pricingPlan':
        await prisma.pricingPlan.deleteMany({})
        break
      case 'changeRequest':
        await prisma.changeRequest.deleteMany({})
        break
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}

// Clean up all test data
export async function cleanupAllTestData(): Promise<void> {
  const prisma = getTestPrisma()
  if (!prisma) return

  try {
    // Delete in order of dependencies
    await prisma.changeRequest.deleteMany({})
    await prisma.booking.deleteMany({})
    await prisma.blockedDate.deleteMany({})
    await prisma.travelBundle.deleteMany({})
    await prisma.urgencyTier.deleteMany({})
    await prisma.travelZone.deleteMany({})
    await prisma.pricingPlan.deleteMany({})
  } catch (error) {
    // Ignore cleanup errors
  }
}

// Helper to create test booking
export async function createTestBooking(data: Partial<{
  clientName: string
  clientEmail: string
  clientPhone: string
  propertyAddress: string
  propertyCity: string
  status: string
  totalQuote: number
  pricingPlanId: string
  urgencyTierId: string
  travelZoneId: string
  travelBundleId: string
  preferredDate: Date
  alternateDate: Date
  deadlineDate: Date
  confirmedDate: Date
  basePrice: number
  urgencySurcharge: number
  travelFee: number
}> = {}) {
  const prisma = requireDatabase()

  return prisma.booking.create({
    data: {
      clientName: data.clientName || 'Test Client',
      clientEmail: data.clientEmail || 'test@example.com',
      clientPhone: data.clientPhone || '+389 70 123 456',
      propertyAddress: data.propertyAddress || '123 Test Street, Skopje',
      propertyCity: data.propertyCity || 'Skopje',
      status: data.status || 'quote_requested',
      totalQuote: data.totalQuote,
      pricingPlanId: data.pricingPlanId,
      urgencyTierId: data.urgencyTierId,
      travelZoneId: data.travelZoneId,
      travelBundleId: data.travelBundleId,
      preferredDate: data.preferredDate,
      alternateDate: data.alternateDate,
      deadlineDate: data.deadlineDate,
      confirmedDate: data.confirmedDate,
      basePrice: data.basePrice,
      urgencySurcharge: data.urgencySurcharge,
      travelFee: data.travelFee,
    },
  })
}

// Helper to create test blocked date
export async function createTestBlockedDate(date: Date, reason?: string) {
  const prisma = requireDatabase()

  return prisma.blockedDate.create({
    data: {
      date,
      reason: reason || 'Test blocked date',
      isAllDay: true,
    },
  })
}

// Helper to create test travel bundle
export async function createTestTravelBundle(data: Partial<{
  name: string
  city: string
  region: string
  scheduledDate: Date
  maxParticipants: number
  currentCount: number
  totalTravelCost: number
  perPersonTravelFee: number
  status: string
}> = {}) {
  const prisma = requireDatabase()

  return prisma.travelBundle.create({
    data: {
      name: data.name || 'Test Bundle',
      city: data.city || 'Ohrid',
      region: data.region || 'Southwest',
      scheduledDate: data.scheduledDate || new Date('2025-02-01'),
      maxParticipants: data.maxParticipants || 10,
      currentCount: data.currentCount || 0,
      totalTravelCost: data.totalTravelCost,
      perPersonTravelFee: data.perPersonTravelFee,
      status: data.status || 'open',
    },
  })
}

// Helper to create test pricing plan
export async function createTestPricingPlan(data: Partial<{
  name: string
  description: string
  price: number
  features: string[]
  isPopular: boolean
}> = {}) {
  const prisma = requireDatabase()

  return prisma.pricingPlan.create({
    data: {
      name: data.name || 'Test Plan',
      description: data.description || 'Test pricing plan',
      price: data.price || 299,
      features: JSON.stringify(data.features || ['Feature 1', 'Feature 2']),
      isPopular: data.isPopular || false,
    },
  })
}

// Helper to create test urgency tier
export async function createTestUrgencyTier(data: Partial<{
  name: string
  displayName: string
  description: string
  minLeadDays: number
  maxLeadDays: number
  surchargePercent: number
}> = {}) {
  const prisma = requireDatabase()

  return prisma.urgencyTier.create({
    data: {
      name: data.name || `tier-${Date.now()}`,
      displayName: data.displayName || 'Test Tier',
      description: data.description || 'Test urgency tier',
      minLeadDays: data.minLeadDays ?? 7,
      maxLeadDays: data.maxLeadDays,
      surchargePercent: data.surchargePercent ?? 0,
    },
  })
}

// Helper to create test travel zone
export async function createTestTravelZone(data: Partial<{
  name: string
  description: string
  minDistanceKm: number
  maxDistanceKm: number
  flatFee: number
  perKmRate: number
  isIncluded: boolean
}> = {}) {
  const prisma = requireDatabase()

  return prisma.travelZone.create({
    data: {
      name: data.name || 'Test Zone',
      description: data.description || 'Test travel zone',
      minDistanceKm: data.minDistanceKm ?? 0,
      maxDistanceKm: data.maxDistanceKm,
      flatFee: data.flatFee,
      perKmRate: data.perKmRate,
      isIncluded: data.isIncluded ?? false,
    },
  })
}

// Helper to create test change request
export async function createTestChangeRequest(bookingId: string, data: Partial<{
  requestType: string
  originalValue: string
  requestedValue: string
  reason: string
  status: string
}> = {}) {
  const prisma = requireDatabase()

  return prisma.changeRequest.create({
    data: {
      bookingId,
      requestType: data.requestType || 'date_change',
      originalValue: data.originalValue,
      requestedValue: data.requestedValue,
      reason: data.reason || 'Test reason',
      status: data.status || 'pending',
    },
  })
}

// Calculate urgency surcharge
export function calculateSurcharge(basePrice: number, surchargePercent: number): number {
  return basePrice * (surchargePercent / 100)
}

// Calculate per-person travel fee
export function calculatePerPersonTravelFee(totalCost: number, participants: number): number {
  if (participants <= 0) return totalCost
  return totalCost / participants
}
