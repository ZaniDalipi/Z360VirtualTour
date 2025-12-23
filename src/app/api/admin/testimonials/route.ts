import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'
import { cache, CacheKeys, CacheTTL } from '@/lib/cache'
import { withRetry } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cacheKey = 'admin:testimonials'
    const cached = cache.get<unknown[]>(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    const testimonials = await withRetry(
      () => prisma.testimonial.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      { maxRetries: 2 }
    )

    cache.set(cacheKey, testimonials, CacheTTL.SHORT)

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('Failed to fetch testimonials:', error)

    const staleCache = cache.get<unknown[]>('admin:testimonials')
    if (staleCache) {
      return NextResponse.json(staleCache, {
        headers: { 'X-Cache-Status': 'stale' }
      })
    }

    return NextResponse.json(
      { error: 'Failed to fetch testimonials. Please try again.' },
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

    const testimonial = await withRetry(
      () => prisma.testimonial.create({
        data: {
          clientName: data.clientName,
          clientTitle: data.clientTitle || null,
          clientImage: data.clientImage || null,
          content: data.content,
          rating: data.rating || 5,
          tourId: data.tourId || null,
          featured: data.featured || false,
          isActive: data.isActive ?? true,
        },
      }),
      { maxRetries: 2 }
    )

    // Invalidate caches
    cache.invalidatePrefix('testimonials')
    cache.invalidatePrefix('admin:testimonials')
    cache.invalidatePrefix('stats')

    return NextResponse.json(testimonial, { status: 201 })
  } catch (error) {
    console.error('Failed to create testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to create testimonial. Please try again.' },
      { status: 500 }
    )
  }
}
