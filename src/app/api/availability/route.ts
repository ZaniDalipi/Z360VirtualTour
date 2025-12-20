import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // Format: YYYY-MM
    const city = searchParams.get('city') // Optional: filter bundles by city

    // Get settings
    const settings = await prisma.bookingSettings.findUnique({
      where: { id: 'default' },
    })

    // Calculate date range for the month
    let startDate: Date
    let endDate: Date

    if (month) {
      startDate = new Date(`${month}-01`)
      const [year, monthNum] = month.split('-').map(Number)
      const lastDay = new Date(year, monthNum, 0).getDate()
      endDate = new Date(`${month}-${lastDay.toString().padStart(2, '0')}`)
    } else {
      // Default to next 3 months
      startDate = new Date()
      endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 3)
    }

    // Get blocked dates
    const blocked = await prisma.blockedDate.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    })

    // Get confirmed bookings
    const confirmedBookings = await prisma.booking.findMany({
      where: {
        status: 'confirmed',
        confirmedDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Get urgency tiers for display
    const tiers = await prisma.urgencyTier.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })

    // Get open bundles
    let bundleWhere: {
      isActive: boolean
      status: string
      city?: { contains: string; mode: 'insensitive' }
    } = {
      isActive: true,
      status: 'open',
    }

    // Filter by city if provided
    if (city) {
      bundleWhere.city = { contains: city, mode: 'insensitive' }
    }

    const openBundles = await prisma.travelBundle.findMany({
      where: bundleWhere,
      orderBy: { scheduledDate: 'asc' },
    })

    // Calculate minimum booking date based on settings
    const today = new Date()
    const minDate = new Date(today)
    minDate.setDate(minDate.getDate() + (settings?.defaultMinLeadDays || 3))

    // Calculate maximum booking date
    const maxDate = new Date(today)
    maxDate.setDate(maxDate.getDate() + (settings?.maxAdvanceBookingDays || 90))

    return NextResponse.json({
      blockedDates: blocked.map(d => d.date.toISOString().split('T')[0]),
      bookedDates: confirmedBookings
        .filter(b => b.confirmedDate)
        .map(b => b.confirmedDate!.toISOString().split('T')[0]),
      urgencyTiers: tiers,
      bundles: openBundles.map(b => ({
        id: b.id,
        name: b.name,
        city: b.city,
        scheduledDate: b.scheduledDate,
        spotsRemaining: b.maxParticipants - b.currentCount,
        perPersonFee: b.perPersonTravelFee,
        discountPercent: b.discountPercent,
        registrationDeadline: b.registrationDeadline,
      })),
      settings: {
        minBookingDate: minDate.toISOString().split('T')[0],
        maxBookingDate: maxDate.toISOString().split('T')[0],
        workOnWeekends: settings?.workOnWeekends || false,
        workOnSunday: settings?.workOnSunday || false,
      },
    })
  } catch (error) {
    console.error('Failed to fetch availability:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}
