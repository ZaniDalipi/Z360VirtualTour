import { PrismaClient } from '@prisma/client'

// Global test prisma client
let testPrisma: PrismaClient | null = null
let isConnected = false

// Initialize test database connection
export async function initTestDatabase(): Promise<PrismaClient | null> {
  if (testPrisma && isConnected) {
    return testPrisma
  }

  try {
    testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || process.env.TEST_DATABASE_URL,
        },
      },
    })

    // Test the connection
    await testPrisma.$connect()
    isConnected = true
    console.log('    ✓ Database connected for testing')
    return testPrisma
  } catch (error) {
    console.log('    ✗ Database not available for testing')
    console.log('      MongoDB replica set required. Use MongoDB Atlas or configure local replica set.')
    testPrisma = null
    isConnected = false
    return null
  }
}

// Get the test prisma client
export function getTestPrisma(): PrismaClient | null {
  return testPrisma
}

// Check if database is connected
export function isDatabaseConnected(): boolean {
  return isConnected
}

// Cleanup function for after all tests
export async function cleanupTestDatabase(): Promise<void> {
  if (testPrisma) {
    await testPrisma.$disconnect()
    testPrisma = null
    isConnected = false
  }
}

// Global setup
beforeAll(async () => {
  await initTestDatabase()
})

// Global teardown
afterAll(async () => {
  await cleanupTestDatabase()
})
