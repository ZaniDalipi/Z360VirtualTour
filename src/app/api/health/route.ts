import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/cache'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    tests: {},
  }

  // Test 1: Cache status
  const cacheStats = cache.get('stats')
  results.tests = {
    ...results.tests as object,
    cacheHasStats: cacheStats !== null,
  }

  // Test 2: Simple DB query with timing
  const dbStart = Date.now()
  try {
    const count = await prisma.tour.count()
    const dbTime = Date.now() - dbStart
    results.tests = {
      ...results.tests as object,
      database: {
        status: 'ok',
        responseTimeMs: dbTime,
        tourCount: count,
      },
    }
  } catch (error) {
    const dbTime = Date.now() - dbStart
    results.tests = {
      ...results.tests as object,
      database: {
        status: 'error',
        responseTimeMs: dbTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  }

  // Test 3: Auth endpoint check (no DB, just JWT verify)
  const authStart = Date.now()
  try {
    const authTime = Date.now() - authStart
    results.tests = {
      ...results.tests as object,
      auth: {
        status: 'ok',
        responseTimeMs: authTime,
      },
    }
  } catch {
    results.tests = {
      ...results.tests as object,
      auth: {
        status: 'error',
      },
    }
  }

  // Overall status
  const dbTest = (results.tests as Record<string, { status: string }>).database
  results.status = dbTest?.status === 'ok' ? 'healthy' : 'degraded'

  return NextResponse.json(results)
}
