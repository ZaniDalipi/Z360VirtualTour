import { NextRequest, NextResponse } from 'next/server'
import { getUserFromCookies } from '@/lib/user-auth'
import { findUserById } from '@/lib/user-db'
import { prisma } from '@/lib/prisma'
import { sendEmail, sendAdminNotification, emailTemplates, getStatusLabel } from '@/lib/email'

export const dynamic = 'force-dynamic'

// GET: Fetch a specific booking for the authenticated user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userPayload = await getUserFromCookies()

    if (!userPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get full user data for email fallback
    const user = await findUserById(userPayload.id)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    const { id } = await params
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        companyName: true,
        propertyAddress: true,
        propertyCity: true,
        serviceType: true,
        projectDescription: true,
        specialRequests: true,
        status: true,
        basePrice: true,
        urgencySurcharge: true,
        travelFee: true,
        bundleDiscount: true,
        sameCityDiscount: true,
        totalQuote: true,
        depositAmount: true,
        depositPaid: true,
        confirmedDate: true,
        confirmedTime: true,
        preferredDate: true,
        preferredTime: true,
        alternateDate: true,
        alternateTime: true,
        deadlineDate: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if this booking belongs to the user (by email match)
    if (booking.clientEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Failed to fetch booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

// POST: Submit a change request for a booking (users cannot edit directly)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userPayload = await getUserFromCookies()

    if (!userPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get full user data for email fallback
    const user = await findUserById(userPayload.id)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { requestType, message, newPreferredDate, newPreferredTime } = await request.json()

    // Validate request type
    const validRequestTypes = ['date_change', 'cancellation', 'other']
    if (!validRequestTypes.includes(requestType)) {
      return NextResponse.json(
        { error: 'Invalid request type' },
        { status: 400 }
      )
    }

    // Find the booking and verify ownership
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        propertyAddress: true,
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check ownership by email
    if (booking.clientEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Check if booking can be modified (not completed or cancelled)
    if (['completed', 'cancelled'].includes(booking.status)) {
      return NextResponse.json(
        { error: 'This booking cannot be modified' },
        { status: 400 }
      )
    }

    // Update booking with change request
    await prisma.booking.update({
      where: { id },
      data: {
        changeRequestType: requestType,
        changeRequestMessage: message || null,
        changeRequestDate: new Date(),
        ...(requestType === 'date_change' && newPreferredDate && {
          requestedNewDate: new Date(newPreferredDate),
          requestedNewTime: newPreferredTime || null,
        }),
      }
    })

    // Send confirmation email to user
    const userEmailData = {
      clientName: booking.clientName,
      bookingId: booking.id,
      requestType: requestType as 'date_change' | 'cancellation' | 'other',
      message: message || undefined,
      newPreferredDate: newPreferredDate || undefined,
      newPreferredTime: newPreferredTime || undefined,
      propertyAddress: booking.propertyAddress,
      currentStatus: getStatusLabel(booking.status),
    }

    await sendEmail(
      booking.clientEmail,
      emailTemplates.changeRequestConfirmation(userEmailData)
    )

    // Send notification email to admin
    const adminEmailData = {
      ...userEmailData,
      clientEmail: booking.clientEmail,
      clientPhone: booking.clientPhone || undefined,
    }

    await sendAdminNotification(
      emailTemplates.changeRequestAdmin(adminEmailData)
    )

    return NextResponse.json({
      success: true,
      message: requestType === 'cancellation'
        ? 'Cancellation request submitted. We will contact you shortly. A confirmation has been sent to your email.'
        : 'Change request submitted. We will review and contact you shortly. A confirmation has been sent to your email.'
    })
  } catch (error) {
    console.error('Failed to submit change request:', error)
    return NextResponse.json(
      { error: 'Failed to submit request' },
      { status: 500 }
    )
  }
}
