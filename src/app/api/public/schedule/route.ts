import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Public API to get scheduled work dates with cities (no client details)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build date filter
    const dateFilter: { gte?: Date; lte?: Date } = {}
    if (startDate) {
      dateFilter.gte = new Date(startDate)
    } else {
      // Default to current month start
      const now = new Date()
      dateFilter.gte = new Date(now.getFullYear(), now.getMonth(), 1)
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate)
    } else {
      // Default to 3 months ahead
      const now = new Date()
      dateFilter.lte = new Date(now.getFullYear(), now.getMonth() + 3, 0)
    }

    // Get confirmed/scheduled bookings with only city info (no client details)
    const bookings = await prisma.booking.findMany({
      where: {
        confirmedDate: dateFilter,
        status: {
          in: ['confirmed', 'scheduled', 'in_progress'],
        },
        propertyCity: {
          not: null,
        },
      },
      select: {
        id: true,
        confirmedDate: true,
        propertyCity: true,
      },
      orderBy: {
        confirmedDate: 'asc',
      },
    })

    // Group by date and city (only show city, not specific details)
    const scheduleMap = new Map<string, Set<string>>()

    bookings.forEach((booking: { confirmedDate: Date | null; propertyCity: string | null }) => {
      if (booking.confirmedDate && booking.propertyCity) {
        const dateKey = booking.confirmedDate.toISOString().split('T')[0]
        if (!scheduleMap.has(dateKey)) {
          scheduleMap.set(dateKey, new Set())
        }
        scheduleMap.get(dateKey)!.add(booking.propertyCity)
      }
    })

    // Convert to array format
    const schedule = Array.from(scheduleMap.entries()).map(([date, cities]) => ({
      date,
      cities: Array.from(cities),
    }))

    // Also get blocked dates
    const blockedDates = await prisma.blockedDate.findMany({
      where: {
        date: dateFilter,
      },
      select: {
        date: true,
        reason: true,
      },
    })

    const blocked = blockedDates.map((bd: { date: Date; reason: string | null }) => ({
      date: bd.date.toISOString().split('T')[0],
      reason: bd.reason || 'Unavailable',
    }))

    return NextResponse.json({
      schedule,
      blockedDates: blocked,
    })
  } catch (error) {
    console.error('Failed to fetch public schedule:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
}
