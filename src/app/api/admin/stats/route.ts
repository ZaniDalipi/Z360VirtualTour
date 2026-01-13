import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'
import { cache, CacheKeys, CacheTTL } from '@/lib/cache'

export const dynamic = 'force-dynamic'

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
    // Check cache first
    const cached = cache.get<StatsData>(CacheKeys.STATS)
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache-Status': 'hit' }
      })
    }

    const [
      totalTours,
      totalTestimonials,
      unreadMessages,
      tours,
      viewsAggregate,
    ] = await Promise.all([
      prisma.tour.count(),
      prisma.testimonial.count(),
      prisma.contactSubmission.count({ where: { isRead: false } }),
      prisma.tour.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
      prisma.tour.aggregate({
        _sum: { views: true },
      }),
    ])

    const stats: StatsData = {
      totalTours,
      totalViews: viewsAggregate._sum.views || 0,
      totalTestimonials,
      unreadMessages,
      recentTours: tours.map((tour: { id: string; title: string; views: number; category: { name: string } }) => ({
        id: tour.id,
        title: tour.title,
        views: tour.views,
        category: tour.category.name,
      })),
    }

    // Cache the result
    cache.set(CacheKeys.STATS, stats, CacheTTL.SHORT)

    const response = NextResponse.json(stats)

    // Add cache headers for faster subsequent loads
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60')

    return response
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
