import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('booking_id')

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Missing booking_id' },
        { status: 400 }
      )
    }

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        pricingPlan: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Determine payment type from status
    let paymentType = 'deposit'
    if (booking.depositPaid && booking.paymentStatus !== 'paid') {
      paymentType = 'balance'
    } else if (booking.paymentStatus === 'paid') {
      paymentType = 'full'
    }

    return NextResponse.json({
      bookingId: booking.id,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      serviceName: booking.pricingPlan?.name || 'Virtual Tour',
      totalQuote: booking.totalQuote,
      paidAmount: booking.paidAmount || 0,
      balanceAmount: booking.balanceAmount || 0,
      paymentType,
      status: booking.paymentStatus,
      depositPaid: booking.depositPaid,
      paidAt: booking.paidAt,
    })
  } catch (error) {
    console.error('Failed to verify payment:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
