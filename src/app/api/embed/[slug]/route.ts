import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// CORS headers for external embedding
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const tour = await prisma.tour.findUnique({
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
    })

    if (!tour || !tour.isActive) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404, headers: corsHeaders }
      )
    }

    // Parse images JSON
    let images: string[] = []
    if (tour.images) {
      try {
        images = JSON.parse(tour.images)
      } catch {
        images = []
      }
    }

    // Return embed-friendly data
    return NextResponse.json({
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      description: tour.description,
      shortDescription: tour.shortDesc,
      clientName: tour.clientName,
      location: tour.location,
      coverImage: tour.coverImage,
      images,
      tourUrl: tour.tourUrl,
      tourEmbed: tour.tourEmbed,
      category: tour.category,
      embedCode: `<iframe src="${process.env.NEXT_PUBLIC_APP_URL || 'https://z360virtualtours.com'}/embed/${tour.slug}" width="100%" height="500" frameborder="0" allowfullscreen></iframe>`,
      directLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://z360virtualtours.com'}/tour/${tour.slug}`,
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Failed to fetch tour for embed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tour' },
      { status: 500, headers: corsHeaders }
    )
  }
}
