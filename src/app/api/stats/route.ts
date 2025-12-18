import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get total tours count
    const totalTours = await prisma.tour.count({
      where: { isActive: true },
    })

    // Get total categories count
    const totalCategories = await prisma.category.count({
      where: { isActive: true },
    })

    // Get total views
    const viewsResult = await prisma.tour.aggregate({
      _sum: { views: true },
      where: { isActive: true },
    })
    const totalViews = viewsResult._sum.views || 0

    return NextResponse.json({
      totalTours,
      totalCategories,
      totalViews,
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { totalTours: 0, totalCategories: 0, totalViews: 0 },
      { status: 200 }
    )
  }
}
