import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Helper to format date without timezone issues
const formatDateKey = (date: Date): string => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

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
        const dateKey = formatDateKey(booking.confirmedDate)
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
      date: formatDateKey(bd.date),
      reason: bd.reason || 'Unavailable',
    }))

    // Get active bundles that overlap with the date range
    // A bundle overlaps if its startDate <= endDate filter AND endDate >= startDate filter
    const bundles = await prisma.travelBundle.findMany({
      where: {
        isActive: true,
        OR: [
          // Bundle starts within the range
          { startDate: dateFilter },
          // Bundle ends within the range
          { endDate: dateFilter },
          // Bundle spans the entire range
          {
            AND: [
              { startDate: { lte: dateFilter.gte } },
              { endDate: { gte: dateFilter.lte } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        city: true,
        region: true,
        startDate: true,
        endDate: true,
        scheduledDate: true,
        maxParticipants: true,
        currentCount: true,
        discountPercent: true,
        perPersonTravelFee: true,
        description: true,
        registrationDeadline: true,
        status: true,
      },
      orderBy: {
        startDate: 'asc',
      },
    })

    interface BundleData {
      id: string
      name: string
      city: string
      region: string | null
      startDate: Date
      endDate: Date
      scheduledDate: Date
      maxParticipants: number
      currentCount: number
      discountPercent: number
      perPersonTravelFee: number | null
      description: string | null
      registrationDeadline: Date | null
      status: string
    }

    // Helper to get all dates between start and end
    const getDatesBetween = (start: Date, end: Date): string[] => {
      const dates: string[] = []
      const current = new Date(start)
      const endDate = new Date(end)
      while (current <= endDate) {
        dates.push(formatDateKey(current))
        current.setDate(current.getDate() + 1)
      }
      return dates
    }

    const formattedBundles = bundles.map((b: BundleData) => ({
      id: b.id,
      name: b.name,
      city: b.city,
      region: b.region,
      startDate: formatDateKey(b.startDate),
      endDate: formatDateKey(b.endDate),
      dates: getDatesBetween(b.startDate, b.endDate), // All dates in the bundle range
      scheduledDate: b.scheduledDate,
      maxParticipants: b.maxParticipants,
      currentCount: b.currentCount,
      spotsRemaining: b.maxParticipants - b.currentCount,
      isFull: b.currentCount >= b.maxParticipants,
      discountPercent: b.discountPercent,
      perPersonTravelFee: b.perPersonTravelFee,
      description: b.description,
      registrationDeadline: b.registrationDeadline ? formatDateKey(b.registrationDeadline) : null,
      status: b.status,
    }))

    return NextResponse.json({
      schedule,
      blockedDates: blocked,
      bundles: formattedBundles,
    })
  } catch (error) {
    console.error('Failed to fetch public schedule:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    )
  }
}
