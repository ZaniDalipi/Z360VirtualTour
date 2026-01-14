import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Public API endpoint for fetching client tours
 * This can be used by external websites (like balkanestateai.com) to display
 * tours for their clients
 *
 * Query Parameters:
 * - email: Client's email address (for authorized access)
 * - name: Client name to search for (partial match)
 * - limit: Maximum number of tours to return (default: 10)
 *
 * Returns:
 * - Array of tours with embed information
 *
 * CORS is enabled for cross-origin requests
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email')
  const name = searchParams.get('name')
  const limit = parseInt(searchParams.get('limit') || '10')

  // Validate required parameters
  if (!email && !name) {
    return NextResponse.json(
      { error: 'Either email or name parameter is required' },
      {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    )
  }

  try {
    // Build search conditions
    const whereConditions: Record<string, unknown>[] = [
      { isActive: true },
    ]

    if (name) {
      whereConditions.push({
        clientName: {
          contains: name,
          mode: 'insensitive',
        },
      })
    }

    // Find tours matching the client
    const tours = await prisma.tour.findMany({
      where: {
        AND: whereConditions,
      },
      take: Math.min(limit, 50), // Max 50 tours
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
        shortDesc: true,
        clientName: true,
        location: true,
        coverImage: true,
        tourUrl: true,
        premium: true,
        highlight: true,
        featured: true,
        completedAt: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    })

    // Get the base URL for generating links
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://z360-virtual-tour.vercel.app'

    // Transform tours with integration-friendly data
    const toursWithLinks = tours.map((tour: typeof tours[number]) => ({
      ...tour,
      links: {
        view: `${baseUrl}/tour/${tour.slug}`,
        embed: `${baseUrl}/embed/${tour.slug}`,
        embedCode: `<iframe src="${baseUrl}/embed/${tour.slug}" width="100%" height="600" frameborder="0" allowfullscreen allow="xr-spatial-tracking; gyroscope; accelerometer"></iframe>`,
      },
    }))

    return NextResponse.json(
      {
        success: true,
        count: toursWithLinks.length,
        tours: toursWithLinks,
        _links: {
          self: `${baseUrl}/api/public/client/tours`,
          documentation: `${baseUrl}/integration`,
        },
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching client tours:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tours' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    )
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}
