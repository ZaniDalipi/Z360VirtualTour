import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { bookings, travelBundles } from '@/lib/booking-db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const booking = bookings.findUnique(id)

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Mark as read
    if (!booking.isRead) {
      bookings.update(id, { isRead: true })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Failed to fetch booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await request.json()

    // If confirming a booking with a bundle, increment bundle count
    const existingBooking = bookings.findUnique(id)
    if (data.status === 'confirmed' && existingBooking?.status !== 'confirmed' && data.travelBundleId) {
      travelBundles.incrementCount(data.travelBundleId)
    }

    const booking = bookings.update(id, {
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      companyName: data.companyName,
      propertyAddress: data.propertyAddress,
      propertyCity: data.propertyCity,
      estimatedDistance: data.estimatedDistance !== undefined ? parseFloat(data.estimatedDistance) : undefined,
      serviceType: data.serviceType,
      projectDescription: data.projectDescription,
      specialRequests: data.specialRequests,
      pricingPlanId: data.pricingPlanId,
      urgencyTierId: data.urgencyTierId,
      preferredDate: data.preferredDate,
      alternateDate: data.alternateDate,
      deadlineDate: data.deadlineDate,
      confirmedDate: data.confirmedDate,
      isFlexible: data.isFlexible,
      travelZoneId: data.travelZoneId,
      travelBundleId: data.travelBundleId,
      basePrice: data.basePrice !== undefined ? parseFloat(data.basePrice) : undefined,
      urgencySurcharge: data.urgencySurcharge !== undefined ? parseFloat(data.urgencySurcharge) : undefined,
      travelFee: data.travelFee !== undefined ? parseFloat(data.travelFee) : undefined,
      bundleDiscount: data.bundleDiscount !== undefined ? parseFloat(data.bundleDiscount) : undefined,
      totalQuote: data.totalQuote !== undefined ? parseFloat(data.totalQuote) : undefined,
      depositAmount: data.depositAmount !== undefined ? parseFloat(data.depositAmount) : undefined,
      depositPaid: data.depositPaid,
      internalNotes: data.internalNotes,
      status: data.status,
      isRead: data.isRead,
      quoteSentAt: data.quoteSentAt,
      confirmedAt: data.confirmedAt,
      completedAt: data.completedAt,
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Failed to update booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    bookings.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete booking:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}
