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

/**
 * GET /api/v1/tours
 * List all published tours
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const apiKey = await validateApiKey(request)

  if (!apiKey) {
    await logApiRequest(null, 'GET', '/api/v1/tours', 401, Date.now() - startTime, request, 'Invalid API key')
    return NextResponse.json(
      apiError('Invalid or missing API key', 401, 'UNAUTHORIZED'),
      { status: 401, headers: corsHeaders }
    )
  }

  if (!hasPermission(apiKey, 'read') && !hasPermission(apiKey, 'tours')) {
    await logApiRequest(apiKey.id, 'GET', '/api/v1/tours', 403, Date.now() - startTime, request, 'Permission denied')
    return NextResponse.json(
      apiError('Permission denied', 403, 'FORBIDDEN'),
      { status: 403, headers: corsHeaders }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const clientName = searchParams.get('client_name')
    const location = searchParams.get('location')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    const where: Record<string, unknown> = {
      isActive: true,
    }

    if (category) {
      where.category = { slug: category }
    }

    if (clientName) {
      where.clientName = { contains: clientName, mode: 'insensitive' }
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' }
    }

    const [tours, total] = await Promise.all([
      prisma.tour.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [
          { premium: 'desc' },
          { highlight: 'desc' },
          { featured: 'desc' },
          { createdAt: 'desc' },
        ],
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          shortDesc: true,
          clientName: true,
          location: true,
          coverImage: true,
          tourUrl: true,
          premium: true,
          highlight: true,
          featured: true,
          views: true,
          completedAt: true,
          createdAt: true,
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.tour.count({ where }),
    ])

    // Generate embed URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://z360-virtual-tour.vercel.app'
    const toursWithUrls = tours.map((tour: typeof tours[number]) => ({
      ...tour,
      urls: {
        view: `${baseUrl}/tour/${tour.slug}`,
        embed: `${baseUrl}/embed/${tour.slug}`,
        embedCode: `<iframe src="${baseUrl}/embed/${tour.slug}" width="100%" height="600" frameborder="0" allowfullscreen allow="xr-spatial-tracking; gyroscope; accelerometer"></iframe>`,
      },
    }))

    await logApiRequest(apiKey.id, 'GET', '/api/v1/tours', 200, Date.now() - startTime, request)

    return NextResponse.json(
      apiSuccess(toursWithUrls, {
        total,
        limit,
        offset,
        hasMore: offset + tours.length < total,
      }),
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Error fetching tours:', error)
    await logApiRequest(apiKey.id, 'GET', '/api/v1/tours', 500, Date.now() - startTime, request, String(error))
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
