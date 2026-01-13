import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cache, CacheKeys, CacheTTL } from '@/lib/cache'
import { withRetry } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface CategoryWithCount {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count: { tours: number }
}

export async function GET() {
  try {
    // Try cache first
    const cached = cache.get<unknown[]>(CacheKeys.CATEGORIES)
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache-Status': 'hit' }
      })
    }

    const categories = await withRetry<CategoryWithCount[]>(
      () => prisma.category.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          _count: {
            select: { tours: { where: { isActive: true } } },
          },
        },
      }),
      { maxRetries: 2, initialDelayMs: 300 }
    )

    return NextResponse.json(
      categories.map((cat: CategoryWithCount) => ({
        ...cat,
        tourCount: cat._count.tours,
        _count: undefined,
      }))
    )
  } catch (error) {
    console.error('Failed to fetch categories:', error)

    // Return cached data if available
    const staleCache = cache.get<unknown[]>(CacheKeys.CATEGORIES)
    if (staleCache) {
      return NextResponse.json(staleCache, {
        headers: { 'X-Cache-Status': 'stale' }
      })
    }

    return NextResponse.json(
      { error: 'Failed to fetch categories. Please try again.' },
      { status: 503 }
    )
  }
}
