import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        pricingPlan: true,
        urgencyTier: true,
        travelZone: true,
        travelBundle: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Mark as read
    if (!booking.isRead) {
      await prisma.booking.update({
        where: { id },
        data: { isRead: true },
      })
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

    // Get existing booking to check for status changes and bundle updates
    const existingBooking = await prisma.booking.findUnique({ where: { id } })

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Handle bundle participant count updates
    const bundleId = existingBooking.travelBundleId
    if (bundleId) {
      // If confirming a booking with a bundle, increment bundle count
      if (data.status === 'confirmed' && existingBooking.status !== 'confirmed') {
        await prisma.travelBundle.update({
          where: { id: bundleId },
          data: { currentCount: { increment: 1 } },
        })
      }
      // If cancelling a confirmed booking, decrement bundle count
      if (data.status === 'cancelled' && existingBooking.status === 'confirmed') {
        await prisma.travelBundle.update({
          where: { id: bundleId },
          data: { currentCount: { decrement: 1 } },
        })
      }
    }

    // Set confirmedAt timestamp when status changes to confirmed
    if (data.status === 'confirmed' && existingBooking.status !== 'confirmed') {
      data.confirmedAt = new Date().toISOString()
    }

    // Set completedAt timestamp when status changes to completed
    if (data.status === 'completed' && existingBooking.status !== 'completed') {
      data.completedAt = new Date().toISOString()
    }

    // Build update data object, only including defined values
    const updateData: Record<string, unknown> = {}

    if (data.clientName !== undefined) updateData.clientName = data.clientName
    if (data.clientEmail !== undefined) updateData.clientEmail = data.clientEmail
    if (data.clientPhone !== undefined) updateData.clientPhone = data.clientPhone
    if (data.companyName !== undefined) updateData.companyName = data.companyName
    if (data.propertyAddress !== undefined) updateData.propertyAddress = data.propertyAddress
    if (data.propertyCity !== undefined) updateData.propertyCity = data.propertyCity
    if (data.estimatedDistance !== undefined) updateData.estimatedDistance = parseFloat(data.estimatedDistance)
    if (data.serviceType !== undefined) updateData.serviceType = data.serviceType
    if (data.projectDescription !== undefined) updateData.projectDescription = data.projectDescription
    if (data.specialRequests !== undefined) updateData.specialRequests = data.specialRequests
    if (data.pricingPlanId !== undefined) updateData.pricingPlanId = data.pricingPlanId
    if (data.urgencyTierId !== undefined) updateData.urgencyTierId = data.urgencyTierId
    if (data.preferredDate !== undefined) updateData.preferredDate = data.preferredDate ? new Date(data.preferredDate) : null
    if (data.preferredTime !== undefined) updateData.preferredTime = data.preferredTime || null
    if (data.alternateDate !== undefined) updateData.alternateDate = data.alternateDate ? new Date(data.alternateDate) : null
    if (data.alternateTime !== undefined) updateData.alternateTime = data.alternateTime || null
    if (data.deadlineDate !== undefined) updateData.deadlineDate = data.deadlineDate ? new Date(data.deadlineDate) : null
    if (data.confirmedDate !== undefined) updateData.confirmedDate = data.confirmedDate ? new Date(data.confirmedDate) : null
    if (data.confirmedTime !== undefined) updateData.confirmedTime = data.confirmedTime || null
    if (data.isFlexible !== undefined) updateData.isFlexible = data.isFlexible
    if (data.travelZoneId !== undefined) updateData.travelZoneId = data.travelZoneId
    if (data.travelBundleId !== undefined) updateData.travelBundleId = data.travelBundleId
    if (data.basePrice !== undefined) updateData.basePrice = parseFloat(data.basePrice)
    if (data.urgencySurcharge !== undefined) updateData.urgencySurcharge = parseFloat(data.urgencySurcharge)
    if (data.travelFee !== undefined) updateData.travelFee = parseFloat(data.travelFee)
    if (data.bundleDiscount !== undefined) updateData.bundleDiscount = parseFloat(data.bundleDiscount)
    if (data.totalQuote !== undefined) updateData.totalQuote = parseFloat(data.totalQuote)
    if (data.depositAmount !== undefined) updateData.depositAmount = parseFloat(data.depositAmount)
    if (data.depositPaid !== undefined) updateData.depositPaid = data.depositPaid
    if (data.internalNotes !== undefined) updateData.internalNotes = data.internalNotes
    if (data.status !== undefined) updateData.status = data.status
    if (data.isRead !== undefined) updateData.isRead = data.isRead
    if (data.quoteSentAt !== undefined) updateData.quoteSentAt = data.quoteSentAt ? new Date(data.quoteSentAt) : null
    if (data.confirmedAt !== undefined) updateData.confirmedAt = data.confirmedAt ? new Date(data.confirmedAt) : null
    if (data.completedAt !== undefined) updateData.completedAt = data.completedAt ? new Date(data.completedAt) : null

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
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

    // Get booking to check if we need to update bundle count
    const booking = await prisma.booking.findUnique({ where: { id } })

    if (booking) {
      // If deleting a confirmed booking with a bundle, decrement bundle count
      if (booking.status === 'confirmed' && booking.travelBundleId) {
        await prisma.travelBundle.update({
          where: { id: booking.travelBundleId },
          data: { currentCount: { decrement: 1 } },
        })
      }
    }

    await prisma.booking.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete booking:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}
