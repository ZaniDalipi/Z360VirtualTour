import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const settings = await prisma.bookingSettings.findUnique({
      where: { id: 'default' },
    })
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

    const settings = await prisma.bookingSettings.upsert({
      where: { id: 'default' },
      update: {
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
      },
      create: {
        id: 'default',
        defaultMinLeadDays: data.defaultMinLeadDays ?? 3,
        maxAdvanceBookingDays: data.maxAdvanceBookingDays ?? 90,
        businessAddress: data.businessAddress,
        businessCity: data.businessCity ?? 'Skopje',
        businessLatitude: data.businessLatitude,
        businessLongitude: data.businessLongitude,
        includeReturnTrip: data.includeReturnTrip ?? true,
        freeDistanceKm: data.freeDistanceKm ?? 15,
        workOnWeekends: data.workOnWeekends ?? false,
        workOnSunday: data.workOnSunday ?? false,
        quoteValidDays: data.quoteValidDays ?? 14,
        requireDeposit: data.requireDeposit ?? true,
        depositPercent: data.depositPercent ?? 30,
        minBundleParticipants: data.minBundleParticipants ?? 3,
        bundleDiscountPercent: data.bundleDiscountPercent ?? 10,
      },
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
