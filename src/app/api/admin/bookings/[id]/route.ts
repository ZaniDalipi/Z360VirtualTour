import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { Booking, TravelBundle } from '@/lib/models'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()
    const { id } = await params
    const booking = await Booking.findById(id)

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Mark as read
    if (!booking.isRead) {
      await Booking.findByIdAndUpdate(id, { isRead: true })
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
    await connectDB()
    const { id } = await params
    const data = await request.json()

    // If confirming a booking with a bundle, increment bundle count
    const existingBooking = await Booking.findById(id)
    if (data.status === 'confirmed' && existingBooking?.status !== 'confirmed' && data.travelBundleId) {
      await TravelBundle.findByIdAndUpdate(data.travelBundleId, {
        $inc: { currentCount: 1 }
      })
    }

    const updateData: Record<string, unknown> = {}

    // Map all fields
    const fields = [
      'clientName', 'clientEmail', 'clientPhone', 'companyName',
      'propertyAddress', 'propertyCity', 'serviceType', 'projectDescription',
      'specialRequests', 'pricingPlanId', 'urgencyTierId', 'preferredDate',
      'preferredTime', 'alternateDate', 'alternateTime', 'deadlineDate',
      'confirmedDate', 'confirmedTime', 'isFlexible', 'travelZoneId',
      'travelBundleId', 'internalNotes', 'workNotes', 'status',
      'isRead', 'depositPaid', 'quoteSentAt', 'confirmedAt', 'completedAt',
      'workStartedAt', 'workEndedAt'
    ]

    for (const field of fields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }

    // Handle numeric fields
    const numericFields = ['estimatedDistance', 'basePrice', 'urgencySurcharge', 'travelFee', 'bundleDiscount', 'totalQuote', 'depositAmount', 'workDurationMinutes']
    for (const field of numericFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field] !== null ? parseFloat(data[field]) : null
      }
    }

    // Handle work timer status changes
    if (data.status === 'in_progress' && existingBooking?.status !== 'in_progress') {
      // Starting work - record start time
      updateData.workStartedAt = new Date()
    }

    if (data.status === 'completed' && existingBooking?.status === 'in_progress') {
      // Completing work - record end time and calculate duration
      const workEndedAt = new Date()
      updateData.workEndedAt = workEndedAt
      updateData.completedAt = workEndedAt

      if (existingBooking.workStartedAt) {
        const startTime = new Date(existingBooking.workStartedAt).getTime()
        const endTime = workEndedAt.getTime()
        updateData.workDurationMinutes = Math.floor((endTime - startTime) / 60000)
      }
    }

    const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true })

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
    await connectDB()
    const { id } = await params
    await Booking.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete booking:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}
