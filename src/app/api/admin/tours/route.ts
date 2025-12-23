import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'
import { cache, CacheTTL } from '@/lib/cache'
import { withRetry } from '@/lib/db'

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

interface TourWithImages {
  id: string
  images: string | null
  [key: string]: unknown
}

export async function GET() {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Try cache first
    const cacheKey = 'admin:tours'
    const cached = cache.get<unknown[]>(cacheKey)
    if (cached) {
      return NextResponse.json(cached)
    }

    // Fetch with retry logic
    const tours = await withRetry(
      () => prisma.tour.findMany({
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
      { maxRetries: 2, initialDelayMs: 300 }
    ) as TourWithImages[]

    // Parse images for each tour
    const toursWithParsedImages = tours.map((tour) => ({
      ...tour,
      images: parseImages(tour.images),
    }))

    // Cache the result
    cache.set(cacheKey, toursWithParsedImages, CacheTTL.SHORT)

    return NextResponse.json(toursWithParsedImages)
  } catch (error) {
    console.error('Failed to fetch tours:', error)

    // Return cached data if available
    const staleCache = cache.get<unknown[]>('admin:tours')
    if (staleCache) {
      return NextResponse.json(staleCache, {
        headers: { 'X-Cache-Status': 'stale' }
      })
    }

    return NextResponse.json(
      { error: 'Failed to fetch tours. Please try again.' },
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

    // Check if slug is unique
    const existingTour = await withRetry(
      () => prisma.tour.findUnique({
        where: { slug: data.slug },
      }),
      { maxRetries: 2 }
    )

    if (existingTour) {
      return NextResponse.json(
        { error: 'A tour with this slug already exists' },
        { status: 400 }
      )
    }

    // Convert images array to JSON string if it's an array
    let imagesJson = null
    if (data.images) {
      if (Array.isArray(data.images)) {
        imagesJson = data.images.length > 0 ? JSON.stringify(data.images) : null
      } else if (typeof data.images === 'string') {
        imagesJson = data.images
      }
    }

    const tour = await withRetry(
      () => prisma.tour.create({
        data: {
          title: data.title,
          slug: data.slug,
          description: data.description || '',
          shortDesc: data.shortDescription || data.shortDesc || null,
          clientName: data.clientName || null,
          location: data.location || null,
          coverImage: data.coverImage,
          images: imagesJson,
          tourUrl: data.tourUrl || null,
          tourEmbed: data.tourEmbed || null,
          categoryId: data.categoryId,
          featured: data.featured || false,
          isActive: data.isActive ?? true,
        },
        include: { category: true },
      }),
      { maxRetries: 2 }
    ) as TourWithImages

    // Invalidate caches
    cache.invalidatePrefix('tours')
    cache.invalidatePrefix('admin:tours')
    cache.invalidatePrefix('stats')

    // Return with parsed images for consistency
    return NextResponse.json({
      ...tour,
      images: parseImages(tour.images),
    })
  } catch (error) {
    console.error('Failed to create tour:', error)
    return NextResponse.json(
      { error: 'Failed to create tour. Please try again.' },
      { status: 500 }
    )
  }
}
