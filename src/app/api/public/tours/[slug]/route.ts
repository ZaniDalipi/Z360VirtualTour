import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}

// GET /api/public/tours/[slug] - Get single tour by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const tour = await prisma.tour.findFirst({
      where: {
        slug,
        isActive: true,
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    })

    if (!tour) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Increment view count
    await prisma.tour.update({
      where: { id: tour.id },
      data: { views: { increment: 1 } },
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://z360-virtual-tour.vercel.app'

    // Transform for public API response
    const publicTour = {
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      description: tour.description,
      shortDescription: tour.shortDesc,
      clientName: tour.clientName,
      location: tour.location,
      coverImage: tour.coverImage,
      images: tour.images ? JSON.parse(tour.images) : [],
      tourUrl: tour.tourUrl,
      embedCode: tour.tourEmbed,
      category: tour.category,
      isPremium: tour.premium,
      isHighlight: tour.highlight,
      isFeatured: tour.featured,
      views: tour.views,
      completedAt: tour.completedAt,
      // Generate URLs for this tour
      embedUrl: `${baseUrl}/embed/${tour.slug}`,
      viewUrl: `${baseUrl}/tour/${tour.slug}`,
      // Provide iframe code for easy embedding
      iframeCode: `<iframe src="${baseUrl}/embed/${tour.slug}" width="100%" height="600" frameborder="0" allowfullscreen allow="xr-spatial-tracking; gyroscope; accelerometer"></iframe>`,
    }

    return NextResponse.json(publicTour, { headers: corsHeaders })
  } catch (error) {
    console.error('Failed to fetch tour:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tour' },
      { status: 500, headers: corsHeaders }
    )
  }
}
