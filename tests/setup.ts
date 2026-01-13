import { PrismaClient } from '@prisma/client'

// Global test prisma client
let testPrisma: PrismaClient | null = null
let isConnected = false
let isWritable = false

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

    // Test if we can actually write (requires replica set for MongoDB)
    try {
      // Try a simple write operation to verify replica set is available
      const testSetting = await testPrisma.siteSetting.upsert({
        where: { key: '__test_connection__' },
        update: { value: new Date().toISOString() },
        create: { key: '__test_connection__', value: new Date().toISOString() },
      })
      // Clean up test record
      await testPrisma.siteSetting.delete({ where: { id: testSetting.id } })
      isWritable = true
      console.log('    ✓ Database is writable (replica set available)')
    } catch (writeError: any) {
      if (writeError.message?.includes('replica set')) {
        console.log('    ✗ MongoDB replica set not configured - tests will be skipped')
        console.log('      Use MongoDB Atlas or configure local MongoDB as replica set')
        isWritable = false
      } else {
        throw writeError
      }
    }

    return testPrisma
  } catch (error: any) {
    console.log('    ✗ Database not available for testing:', error.message)
    testPrisma = null
    isConnected = false
    isWritable = false
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

// Check if database is writable (replica set available for MongoDB)
export function isDatabaseWritable(): boolean {
  return isConnected && isWritable
}

// Cleanup function for after all tests
export async function cleanupTestDatabase(): Promise<void> {
  if (testPrisma) {
    await testPrisma.$disconnect()
    testPrisma = null
    isConnected = false
    isWritable = false
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
