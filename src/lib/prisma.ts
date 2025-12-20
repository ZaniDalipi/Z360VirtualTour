import { PrismaClient } from '@prisma/client'

// Enhanced Prisma configuration for better connection resilience
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['error', 'warn']
      : ['error'],
    // Connection handling is managed through DATABASE_URL parameters
  })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

// Graceful shutdown handling
const handleShutdown = async () => {
  await prisma.$disconnect()
}

if (typeof process !== 'undefined') {
  process.on('beforeExit', handleShutdown)
}

export { prisma }
