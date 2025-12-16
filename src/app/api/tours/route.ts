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
      const cat = await prisma.category.findUnique({
        where: { slug: category },
      })
      if (cat) {
        where.categoryId = cat.id
      }
    }

    if (featured === 'true') {
      where.featured = true
    }

    const tours = await prisma.tour.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
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

    return NextResponse.json(tours)
  } catch (error) {
    console.error('Failed to fetch tours:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tours' },
      { status: 500 }
    )
  }
}
