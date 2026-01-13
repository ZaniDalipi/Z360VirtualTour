import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Lazy initialization to avoid build-time errors when DATABASE_URL is not set
function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

// Only create client if DATABASE_URL is available (runtime only, not during build)
export const prisma: PrismaClient = (() => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  // During build time, DATABASE_URL might not be available
  // Return a proxy that will throw a helpful error if used during build
  if (!process.env.DATABASE_URL) {
    return new Proxy({} as PrismaClient, {
      get(_, prop) {
        if (prop === 'then') return undefined // Prevent Promise detection
        throw new Error(
          `Prisma Client cannot be used during build time. DATABASE_URL is not set.`
        )
      },
    })
  }

  const client = createPrismaClient()
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
  }
  return client
})()
