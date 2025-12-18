import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 30 // Cache for 30 seconds

export async function GET() {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Use optimized queries with select to reduce data transfer
    const [
      totalTours,
      totalTestimonials,
      unreadMessages,
      tours,
      viewsAggregate,
    ] = await Promise.all([
      prisma.tour.count(),
      prisma.testimonial.count(),
      prisma.contactSubmission.count({ where: { isRead: false } }),
      prisma.tour.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          views: true,
          category: { select: { name: true } },
        },
      }),
      prisma.tour.aggregate({ _sum: { views: true } }),
    ])

    const response = NextResponse.json({
      totalTours,
      totalViews: viewsAggregate._sum.views || 0,
      totalTestimonials,
      unreadMessages,
      recentTours: tours.map((tour) => ({
        id: tour.id,
        title: tour.title,
        views: tour.views,
        category: tour.category.name,
      })),
    })

    // Add cache headers for faster subsequent loads
    response.headers.set('Cache-Control', 'private, max-age=30, stale-while-revalidate=60')

    return response
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
