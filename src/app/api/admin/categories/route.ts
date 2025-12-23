import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'
import { cache, CacheKeys, CacheTTL } from '@/lib/cache'
import { withRetry, withFallback } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Try cache first
    const cached = cache.get<unknown[]>(CacheKeys.CATEGORIES_WITH_COUNT)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Fetch with retry logic
    const categories = await withRetry(
      () => prisma.category.findMany({
        orderBy: { order: 'asc' },
        include: {
          _count: {
            select: { tours: true },
          },
        },
      }),
      { maxRetries: 2, initialDelayMs: 300 }
    )

    // Cache the result
    cache.set(CacheKeys.CATEGORIES_WITH_COUNT, categories, CacheTTL.MEDIUM)

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Failed to fetch categories:', error)

    // Return cached data if available, even if expired
    const staleCache = cache.get<unknown[]>(CacheKeys.CATEGORIES_WITH_COUNT)
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

export async function POST(request: NextRequest) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    const category = await withRetry(
      () => prisma.category.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          icon: data.icon || null,
          order: data.order || 0,
          isActive: data.isActive ?? true,
        },
      }),
      { maxRetries: 2 }
    )

    // Invalidate cache
    cache.invalidatePrefix('categories')

    return NextResponse.json(category)
  } catch (error) {
    console.error('Failed to create category:', error)
    return NextResponse.json(
      { error: 'Failed to create category. Please try again.' },
      { status: 500 }
    )
  }
}
