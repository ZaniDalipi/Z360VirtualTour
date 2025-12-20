import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'
import { cache, CacheKeys, CacheTTL } from '@/lib/cache'
import { withRetry, withFallback } from '@/lib/db'

interface StatsData {
  totalTours: number
  totalViews: number
  totalTestimonials: number
  unreadMessages: number
  recentTours: Array<{
    id: string
    title: string
    views: number
    category: string
  }>
}

// Default stats for fallback
const DEFAULT_STATS: StatsData = {
  totalTours: 0,
  totalViews: 0,
  totalTestimonials: 0,
  unreadMessages: 0,
  recentTours: [],
}

export async function GET() {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Try cache first
    const cached = cache.get<StatsData>(CacheKeys.STATS)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Fetch all stats with individual retry logic for resilience
    const [totalTours, totalTestimonials, unreadMessages, tours] = await Promise.all([
      withFallback(
        () => withRetry(() => prisma.tour.count(), { maxRetries: 2 }),
        0
      ),
      withFallback(
        () => withRetry(() => prisma.testimonial.count(), { maxRetries: 2 }),
        0
      ),
      withFallback(
        () => withRetry(() => prisma.contactSubmission.count({ where: { isRead: false } }), { maxRetries: 2 }),
        0
      ),
      withFallback(
        () => withRetry(
          () => prisma.tour.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { category: true },
          }),
          { maxRetries: 2 }
        ),
        []
      ),
    ])

    const totalViews = tours.reduce((sum, tour) => sum + tour.views, 0)

    const stats: StatsData = {
      totalTours,
      totalViews,
      totalTestimonials,
      unreadMessages,
      recentTours: tours.map((tour) => ({
        id: tour.id,
        title: tour.title,
        views: tour.views,
        category: tour.category.name,
      })),
    }

    // Cache the result
    cache.set(CacheKeys.STATS, stats, CacheTTL.SHORT)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to fetch stats:', error)

    // Return cached data if available
    const staleCache = cache.get<StatsData>(CacheKeys.STATS)
    if (staleCache) {
      return NextResponse.json(staleCache, {
        headers: { 'X-Cache-Status': 'stale' }
      })
    }

    // Return default stats as last resort
    return NextResponse.json(DEFAULT_STATS, {
      headers: { 'X-Cache-Status': 'fallback' }
    })
  }
}
