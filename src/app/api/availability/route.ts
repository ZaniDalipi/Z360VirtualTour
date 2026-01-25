import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { BlockedDate, Booking, BookingSettings, UrgencyTier, TravelBundle } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // Format: YYYY-MM
    const city = searchParams.get('city') // Optional: filter bundles by city

    // Get settings
    const settings = await BookingSettings.findOne()

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
    const blocked = await BlockedDate.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 })

    // Get confirmed bookings
    const confirmedBookings = await Booking.find({
      status: 'confirmed',
      confirmedDate: { $gte: startDate, $lte: endDate }
    })

    // Get urgency tiers for display
    const tiers = await UrgencyTier.find({ isActive: true }).sort({ order: 1 })

    // Get open bundles
    const bundleQuery: Record<string, unknown> = { isActive: true, status: 'open' }
    if (city) {
      bundleQuery.city = { $regex: city, $options: 'i' }
    }
    const openBundles = await TravelBundle.find(bundleQuery).sort({ scheduledDate: 1 })

    // Calculate minimum booking date based on settings
    const today = new Date()
    const minDate = new Date(today)
    minDate.setDate(minDate.getDate() + (settings?.defaultMinLeadDays || 3))

    // Calculate maximum booking date
    const maxDate = new Date(today)
    maxDate.setDate(maxDate.getDate() + (settings?.maxAdvanceBookingDays || 90))

    return NextResponse.json({
      blockedDates: blocked.map(d => {
        const dateStr = d.date instanceof Date ? d.date.toISOString() : String(d.date)
        return dateStr.split('T')[0]
      }),
      bookedDates: confirmedBookings.map(b => {
        if (!b.confirmedDate) return null
        const dateStr = b.confirmedDate instanceof Date ? b.confirmedDate.toISOString() : String(b.confirmedDate)
        return dateStr.split('T')[0]
      }).filter(Boolean),
      urgencyTiers: tiers,
      bundles: openBundles.map(b => ({
        id: b._id,
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
