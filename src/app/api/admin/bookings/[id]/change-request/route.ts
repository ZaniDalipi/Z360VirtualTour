import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

async function verifyAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin-token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch {
    return null
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const { action, adminResponse, newConfirmedDate, newConfirmedTime } = await request.json()

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        clientName: true,
        clientEmail: true,
        propertyAddress: true,
        changeRequestType: true,
        changeRequestStatus: true,
        confirmedDate: true,
        confirmedTime: true,
        status: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (!booking.changeRequestType || booking.changeRequestStatus !== 'pending') {
      return NextResponse.json({ error: 'No pending change request' }, { status: 400 })
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      changeRequestStatus: action === 'approve' ? 'approved' : 'rejected',
    }

    // Handle specific request types
    if (action === 'approve') {
      if (booking.changeRequestType === 'cancellation') {
        updateData.status = 'cancelled'
      } else if (booking.changeRequestType === 'date_change' && newConfirmedDate) {
        updateData.confirmedDate = new Date(newConfirmedDate)
        updateData.confirmedTime = newConfirmedTime || null
      }
    }

    // Update the booking
    await prisma.booking.update({
      where: { id },
      data: updateData,
    })

    // Send email to user
    const emailData = {
      clientName: booking.clientName,
      bookingId: booking.id,
      requestType: booking.changeRequestType as 'date_change' | 'cancellation' | 'other',
      approved: action === 'approve',
      adminMessage: adminResponse || undefined,
      propertyAddress: booking.propertyAddress,
      newConfirmedDate: action === 'approve' && booking.changeRequestType === 'date_change' && newConfirmedDate
        ? new Date(newConfirmedDate).toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        : undefined,
      newConfirmedTime: action === 'approve' && booking.changeRequestType === 'date_change' && newConfirmedTime
        ? newConfirmedTime
        : undefined,
    }

    await sendEmail(
      booking.clientEmail,
      emailTemplates.changeRequestResponse(emailData)
    )

    return NextResponse.json({
      success: true,
      message: `Change request ${action}ed successfully`,
    })
  } catch (error) {
    console.error('Failed to process change request:', error)
    return NextResponse.json(
      { error: 'Failed to process change request' },
      { status: 500 }
    )
  }
}
