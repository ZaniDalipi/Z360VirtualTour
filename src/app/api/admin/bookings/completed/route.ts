import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET all completed bookings with work details
export async function GET(request: NextRequest) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Calculate date range
    const now = new Date()
    let startDate: Date | undefined

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case 'all':
      default:
        startDate = undefined
    }

    const where = {
      status: 'completed',
      ...(startDate && {
        completedAt: { gte: startDate },
      }),
    }

    const [bookings, total, stats] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { completedAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          clientName: true,
          clientEmail: true,
          clientPhone: true,
          companyName: true,
          propertyAddress: true,
          propertyCity: true,
          serviceType: true,
          totalQuote: true,
          depositAmount: true,
          depositPaid: true,
          confirmedDate: true,
          confirmedTime: true,
          completedAt: true,
          workStartedAt: true,
          workEndedAt: true,
          workDurationMinutes: true,
          travelBundleId: true,
          createdAt: true,
        },
      }),
      prisma.booking.count({ where }),
      prisma.booking.aggregate({
        where,
        _sum: {
          totalQuote: true,
          workDurationMinutes: true,
        },
        _avg: {
          totalQuote: true,
          workDurationMinutes: true,
        },
      }),
    ])

    const response = NextResponse.json({
      bookings,
      total,
      stats: {
        totalRevenue: stats._sum.totalQuote || 0,
        totalWorkMinutes: stats._sum.workDurationMinutes || 0,
        avgBookingValue: stats._avg.totalQuote || 0,
        avgWorkMinutes: stats._avg.workDurationMinutes || 0,
      },
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })

    // Short cache for real-time sync
    response.headers.set('Cache-Control', 'private, max-age=5, stale-while-revalidate=10')

    return response
  } catch (error) {
    console.error('Failed to fetch completed bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch completed bookings' },
      { status: 500 }
    )
  }
}
