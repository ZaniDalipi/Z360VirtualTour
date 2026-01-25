import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { BookingSettings } from '@/lib/models'

export async function GET() {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()
    let settings = await BookingSettings.findOne()

    // Create default settings if none exist
    if (!settings) {
      settings = await BookingSettings.create({
        defaultMinLeadDays: 3,
        maxAdvanceBookingDays: 90,
        businessCity: 'Skopje',
        includeReturnTrip: true,
        freeDistanceKm: 15,
        workOnWeekends: false,
        workOnSunday: false,
        quoteValidDays: 14,
        requireDeposit: true,
        depositPercent: 30,
        minBundleParticipants: 3,
        bundleDiscountPercent: 10,
      })
    }

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
    await connectDB()
    const data = await request.json()

    const updateData: Record<string, unknown> = {}
    const fields = [
      'defaultMinLeadDays', 'maxAdvanceBookingDays', 'businessAddress',
      'businessCity', 'businessLatitude', 'businessLongitude',
      'includeReturnTrip', 'freeDistanceKm', 'workOnWeekends',
      'workOnSunday', 'quoteValidDays', 'requireDeposit',
      'depositPercent', 'minBundleParticipants', 'bundleDiscountPercent'
    ]

    for (const field of fields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }

    let settings = await BookingSettings.findOne()
    if (settings) {
      settings = await BookingSettings.findByIdAndUpdate(settings._id, updateData, { new: true })
    } else {
      settings = await BookingSettings.create(updateData)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to update booking settings:', error)
    return NextResponse.json(
      { error: 'Failed to update booking settings' },
      { status: 500 }
    )
  }
}
