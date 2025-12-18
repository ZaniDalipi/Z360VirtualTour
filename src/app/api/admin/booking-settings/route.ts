import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { bookingSettings } from '@/lib/booking-db'

export async function GET() {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const settings = bookingSettings.get()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to fetch booking settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    const settings = bookingSettings.upsert({
      defaultMinLeadDays: data.defaultMinLeadDays,
      maxAdvanceBookingDays: data.maxAdvanceBookingDays,
      businessAddress: data.businessAddress,
      businessCity: data.businessCity,
      businessLatitude: data.businessLatitude,
      businessLongitude: data.businessLongitude,
      includeReturnTrip: data.includeReturnTrip,
      freeDistanceKm: data.freeDistanceKm,
      workOnWeekends: data.workOnWeekends,
      workOnSunday: data.workOnSunday,
      quoteValidDays: data.quoteValidDays,
      requireDeposit: data.requireDeposit,
      depositPercent: data.depositPercent,
      minBundleParticipants: data.minBundleParticipants,
      bundleDiscountPercent: data.bundleDiscountPercent,
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to update booking settings:', error)
    return NextResponse.json(
      { error: 'Failed to update booking settings' },
      { status: 500 }
    )
  }
}
