import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cache, CacheTTL } from '@/lib/cache'
import { withRetry } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Helper to parse images from JSON string or array
function parseImages(images: string | string[] | null): string[] {
  if (!images) return []
  if (Array.isArray(images)) return images
  try {
    const parsed = JSON.parse(images)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

interface TourResult {
  id: string
  images: string | null
  [key: string]: unknown
}

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
      // Use select for faster category lookup with retry
      const cat = await withRetry<{ id: string } | null>(
        () => prisma.category.findUnique({
          where: { slug: category },
          select: { id: true },
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

    // Use select for faster queries - only fetch needed fields, with retry
    const tours = await withRetry(
      () => prisma.tour.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit ? parseInt(limit) : 50, // Default limit for faster loads
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          shortDesc: true,
          clientName: true,
          location: true,
          coverImage: true,
          images: true,
          tourUrl: true,
          tourEmbed: true,
          categoryId: true,
          views: true,
          premium: true,
          highlight: true,
          featured: true,
          isActive: true,
          completedAt: true,
          createdAt: true,
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

    // Parse images for each tour
    const toursWithParsedImages = (tours as TourResult[]).map((tour) => ({
      ...tour,
      images: parseImages(tour.images),
    }))

    // Cache the result - longer TTL for featured tours
    const ttl = featured === 'true' ? CacheTTL.LONG : CacheTTL.MEDIUM
    cache.set(cacheKey, toursWithParsedImages, ttl)

    const response = NextResponse.json(toursWithParsedImages)

    // Cache for 30 seconds
    response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')

    return response
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
