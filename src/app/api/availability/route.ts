import { NextRequest, NextResponse } from 'next/server'
import { blockedDates, bookings, bookingSettings, urgencyTiers, travelBundles } from '@/lib/booking-db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // Format: YYYY-MM
    const city = searchParams.get('city') // Optional: filter bundles by city

    // Get settings
    const settings = bookingSettings.get()

    // Calculate date range for the month
    let startDate: string
    let endDate: string

    if (month) {
      startDate = `${month}-01`
      const [year, monthNum] = month.split('-').map(Number)
      const lastDay = new Date(year, monthNum, 0).getDate()
      endDate = `${month}-${lastDay.toString().padStart(2, '0')}`
    } else {
      // Default to next 3 months
      const today = new Date()
      startDate = today.toISOString().split('T')[0]
      const future = new Date(today)
      future.setMonth(future.getMonth() + 3)
      endDate = future.toISOString().split('T')[0]
    }

    // Get blocked dates
    const blocked = blockedDates.findMany({ startDate, endDate })

    // Get confirmed bookings
    const confirmedBookings = bookings.findMany({
      where: { status: 'confirmed' },
    }).filter(b => {
      if (!b.confirmedDate) return false
      return b.confirmedDate >= startDate && b.confirmedDate <= endDate
    })

    // Get urgency tiers for display
    const tiers = urgencyTiers.findMany({ where: { isActive: true } })

    // Get open bundles
    let openBundles = travelBundles.findMany({
      where: { isActive: true, status: 'open' },
    })

    // Filter by city if provided
    if (city) {
      openBundles = openBundles.filter(b =>
        b.city.toLowerCase().includes(city.toLowerCase())
      )
    }

    // Calculate minimum booking date based on settings
    const today = new Date()
    const minDate = new Date(today)
    minDate.setDate(minDate.getDate() + (settings?.defaultMinLeadDays || 3))

    // Calculate maximum booking date
    const maxDate = new Date(today)
    maxDate.setDate(maxDate.getDate() + (settings?.maxAdvanceBookingDays || 90))

    return NextResponse.json({
      blockedDates: blocked.map(d => d.date.split('T')[0]),
      bookedDates: confirmedBookings.map(b => b.confirmedDate?.split('T')[0]).filter(Boolean),
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
