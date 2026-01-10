import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'

export async function GET() {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [
      totalTours,
      totalTestimonials,
      unreadMessages,
      tours,
    ] = await Promise.all([
      prisma.tour.count(),
      prisma.testimonial.count(),
      prisma.contactSubmission.count({ where: { isRead: false } }),
      prisma.tour.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
    ])

    const totalViews = tours.reduce((sum: number, tour: { views: number }) => sum + tour.views, 0)

    return NextResponse.json({
      totalTours,
      totalViews,
      totalTestimonials,
      unreadMessages,
      recentTours: tours.map((tour: { id: string; title: string; views: number; category: { name: string } }) => ({
        id: tour.id,
        title: tour.title,
        views: tour.views,
        category: tour.category.name,
      })),
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
