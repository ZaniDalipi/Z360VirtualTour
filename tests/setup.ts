// Test setup file
// Mock environment variables for testing
process.env.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/z360_test'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing'

// Try to load Prisma client, but don't fail if not available
let PrismaClient: any
let testPrisma: any = null

try {
  const prismaModule = require('@prisma/client')
  PrismaClient = prismaModule.PrismaClient
  testPrisma = new PrismaClient()
} catch (error) {
  console.log('⚠ Prisma client not available - running tests in mock mode')
}

export { testPrisma }

// Clean up function
export async function cleanDatabase() {
  if (!testPrisma) return

  try {
    // Clean up test data in reverse order of dependencies
    await testPrisma.apiLog?.deleteMany({})
    await testPrisma.webhook?.deleteMany({})
    await testPrisma.apiKey?.deleteMany({})
    await testPrisma.expense?.deleteMany({})
    await testPrisma.expenseCategory?.deleteMany({})
    await testPrisma.financialReport?.deleteMany({})
    await testPrisma.booking?.deleteMany({})
    await testPrisma.travelBundle?.deleteMany({})
    await testPrisma.blockedDate?.deleteMany({})
    await testPrisma.travelZone?.deleteMany({})
    await testPrisma.urgencyTier?.deleteMany({})
    await testPrisma.pricingPlan?.deleteMany({})
    await testPrisma.testimonial?.deleteMany({})
    await testPrisma.contactSubmission?.deleteMany({})
    await testPrisma.tour?.deleteMany({})
    await testPrisma.category?.deleteMany({})
    await testPrisma.user?.deleteMany({})
    await testPrisma.admin?.deleteMany({})
    await testPrisma.siteSetting?.deleteMany({})
    await testPrisma.bookingSettings?.deleteMany({})
  } catch (error) {
    // Ignore cleanup errors
  }
}

// Setup and teardown
beforeAll(async () => {
  if (testPrisma) {
    try {
      await testPrisma.$connect()
      console.log('✓ Database connected for testing')
    } catch (error) {
      console.log('⚠ Database connection skipped (not available)')
      testPrisma = null
    }
  }
})

afterAll(async () => {
  if (testPrisma) {
    await testPrisma.$disconnect()
  }
})
