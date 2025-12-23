import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cache, CacheKeys, CacheTTL } from '@/lib/cache'
import { withRetry } from '@/lib/db'

interface TourWithCategory {
  id: string
  title: string
  slug: string
  description: string
  shortDesc: string | null
  clientName: string | null
  location: string | null
  coverImage: string
  images: string | null
  tourUrl: string | null
  tourEmbed: string | null
  categoryId: string
  featured: boolean
  isActive: boolean
  views: number
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
  category: {
    id: string
    name: string
    slug: string
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Try cache first for the tour data
    const cacheKey = CacheKeys.TOUR_BY_SLUG(slug)
    const cached = cache.get<unknown>(cacheKey)
    if (cached) {
      // Still increment view count asynchronously but don't wait for it
      incrementViewCount(slug).catch(console.error)
      return NextResponse.json(cached, {
        headers: { 'X-Cache-Status': 'hit' }
      })
    }

    const tour = await withRetry<TourWithCategory | null>(
      () => prisma.tour.findUnique({
        where: { slug },
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
      { maxRetries: 2 }
    )

    if (!tour || !tour.isActive) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
    }

    // Cache the tour
    cache.set(cacheKey, tour, CacheTTL.MEDIUM)

    // Increment view count asynchronously (fire and forget)
    incrementViewCount(slug).catch(console.error)

    return NextResponse.json(tour)
  } catch (error) {
    console.error('Failed to fetch tour:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tour. Please try again.' },
      { status: 503 }
    )
  }
}

// Helper function to increment view count asynchronously
async function incrementViewCount(slug: string) {
  try {
    await prisma.tour.update({
      where: { slug },
      data: { views: { increment: 1 } },
    })
  } catch (error) {
    // Log but don't throw - view counting is not critical
    console.warn('Failed to increment view count:', error)
  }
}
