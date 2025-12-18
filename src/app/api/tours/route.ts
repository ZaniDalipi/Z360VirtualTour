import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')

    const where: {
      isActive: boolean
      categoryId?: string
      featured?: boolean
    } = {
      isActive: true,
    }

    if (category) {
      // Use select for faster category lookup
      const cat = await prisma.category.findUnique({
        where: { slug: category },
        select: { id: true },
      })
      if (cat) {
        where.categoryId = cat.id
      }
    }

    if (featured === 'true') {
      where.featured = true
    }

    // Use select for faster queries - only fetch needed fields
    const tours = await prisma.tour.findMany({
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
    })

    const response = NextResponse.json(tours)

    // Cache for 30 seconds
    response.headers.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60')

    return response
  } catch (error) {
    console.error('Failed to fetch tours:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tours' },
      { status: 500 }
    )
  }
}
