import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cache, CacheKeys, CacheTTL } from '@/lib/cache'
import { withRetry, withFallback } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')

    // Build cache key based on query params
    const cacheKey = `tours:public:${category || 'all'}:${featured || 'all'}:${limit || 'all'}`

    // Try cache first
    const cached = cache.get<unknown[]>(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache-Status': 'hit' }
      })
    }

    const where: {
      isActive: boolean
      categoryId?: string
      featured?: boolean
    } = {
      isActive: true,
    }

    if (category) {
      const cat = await withRetry(
        () => prisma.category.findUnique({
          where: { slug: category },
        }),
        { maxRetries: 2 }
      )
      if (cat) {
        where.categoryId = cat.id
      }
    }

    if (featured === 'true') {
      where.featured = true
    }

    const tours = await withRetry(
      () => prisma.tour.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit ? parseInt(limit) : undefined,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      { maxRetries: 2, initialDelayMs: 300 }
    )

    // Cache the result - longer TTL for featured tours
    const ttl = featured === 'true' ? CacheTTL.LONG : CacheTTL.MEDIUM
    cache.set(cacheKey, tours, ttl)

    return NextResponse.json(tours)
  } catch (error) {
    console.error('Failed to fetch tours:', error)

    // Try to return any cached tours data as fallback
    const fallbackCache = cache.get<unknown[]>('tours:public:all:all:all')
    if (fallbackCache) {
      return NextResponse.json(fallbackCache, {
        headers: { 'X-Cache-Status': 'stale-fallback' }
      })
    }

    return NextResponse.json(
      { error: 'Failed to fetch tours. Please try again.' },
      { status: 503 }
    )
  }
}
