import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
    }

    // Increment view count
    await prisma.tour.update({
      where: { id: tour.id },
      data: { views: tour.views + 1 },
    })

    // Parse images JSON string to array
    let parsedImages: string[] = []
    if (tour.images) {
      try {
        parsedImages = JSON.parse(tour.images)
      } catch {
        // If parsing fails, treat as empty array
        parsedImages = []
      }
    }

    return NextResponse.json({
      ...tour,
      images: parsedImages,
    })
  } catch (error) {
    console.error('Failed to fetch tour:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tour' },
      { status: 500 }
    )
  }
}
