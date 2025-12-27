import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or specify your domain: 'https://balkanestate.ai'
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}

// GET /api/public/tours - List all public tours
// GET /api/public/tours?category=real-estate - Filter by category
// GET /api/public/tours?featured=true - Only featured tours
// GET /api/public/tours?limit=10 - Limit results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const premium = searchParams.get('premium')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query filters
    const where: Record<string, unknown> = {
      isActive: true,
    }

    if (category) {
      where.category = {
        slug: category,
      }
    }

    if (featured === 'true') {
      where.featured = true
    }

    if (premium === 'true') {
      where.premium = true
    }

    const [tours, total] = await Promise.all([
      prisma.tour.findMany({
        where,
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        orderBy: [
          { premium: 'desc' },
          { highlight: 'desc' },
          { featured: 'desc' },
          { createdAt: 'desc' },
        ],
        take: Math.min(limit, 100), // Max 100 per request
        skip: offset,
      }),
      prisma.tour.count({ where }),
    ])

    // Transform for public API response
    const publicTours = tours.map((tour: {
      id: string;
      title: string;
      slug: string;
      description: string | null;
      shortDesc: string | null;
      clientName: string | null;
      location: string | null;
      coverImage: string;
      images: string | null;
      tourUrl: string | null;
      tourEmbed: string | null;
      category: { name: string; slug: string } | null;
      premium: boolean;
      highlight: boolean;
      featured: boolean;
      views: number;
      completedAt: Date | null;
    }) => ({
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
      // Generate embed URL for this tour
      embedUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://z360virtualtours.com'}/embed/${tour.slug}`,
      viewUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://z360virtualtours.com'}/tour/${tour.slug}`,
    }))

    return NextResponse.json({
      tours: publicTours,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + tours.length < total,
      },
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Failed to fetch public tours:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tours' },
      { status: 500, headers: corsHeaders }
    )
  }
}
