import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  validateApiKey,
  hasPermission,
  corsHeaders,
  apiError,
  apiSuccess,
  logApiRequest,
} from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ slug: string }>
}

/**
 * GET /api/v1/tours/:slug
 * Get a specific tour by slug or ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const startTime = Date.now()
  const { slug } = await context.params
  const endpoint = `/api/v1/tours/${slug}`

  const apiKey = await validateApiKey(request)

  if (!apiKey) {
    await logApiRequest(null, 'GET', endpoint, 401, Date.now() - startTime, request, 'Invalid API key')
    return NextResponse.json(
      apiError('Invalid or missing API key', 401, 'UNAUTHORIZED'),
      { status: 401, headers: corsHeaders }
    )
  }

  if (!hasPermission(apiKey, 'read') && !hasPermission(apiKey, 'tours')) {
    await logApiRequest(apiKey.id, 'GET', endpoint, 403, Date.now() - startTime, request, 'Permission denied')
    return NextResponse.json(
      apiError('Permission denied', 403, 'FORBIDDEN'),
      { status: 403, headers: corsHeaders }
    )
  }

  try {
    // Try to find by slug first, then by ID
    const tour = await prisma.tour.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        isActive: true,
      },
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
        premium: true,
        highlight: true,
        featured: true,
        views: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    if (!tour) {
      await logApiRequest(apiKey.id, 'GET', endpoint, 404, Date.now() - startTime, request, 'Tour not found')
      return NextResponse.json(
        apiError('Tour not found', 404, 'NOT_FOUND'),
        { status: 404, headers: corsHeaders }
      )
    }

    // Increment view count (fire and forget)
    prisma.tour.update({
      where: { id: tour.id },
      data: { views: { increment: 1 } },
    }).catch(() => {})

    // Parse images if JSON
    let images: string[] = []
    if (tour.images) {
      try {
        images = JSON.parse(tour.images)
      } catch {
        images = []
      }
    }

    // Generate URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://z360-virtual-tour.vercel.app'
    const response = {
      ...tour,
      images,
      urls: {
        view: `${baseUrl}/tour/${tour.slug}`,
        embed: `${baseUrl}/embed/${tour.slug}`,
        embedCode: `<iframe src="${baseUrl}/embed/${tour.slug}" width="100%" height="600" frameborder="0" allowfullscreen allow="xr-spatial-tracking; gyroscope; accelerometer"></iframe>`,
      },
    }

    await logApiRequest(apiKey.id, 'GET', endpoint, 200, Date.now() - startTime, request)

    return NextResponse.json(apiSuccess(response), { headers: corsHeaders })
  } catch (error) {
    console.error('Error fetching tour:', error)
    await logApiRequest(apiKey.id, 'GET', endpoint, 500, Date.now() - startTime, request, String(error))
    return NextResponse.json(
      apiError('Internal server error', 500),
      { status: 500, headers: corsHeaders }
    )
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Access-Control-Max-Age': '86400',
    },
  })
}
