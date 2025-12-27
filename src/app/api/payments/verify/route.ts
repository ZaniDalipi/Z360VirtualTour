import { NextRequest, NextResponse } from 'next/server'
import { stripe, formatAmountFromStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    const bookingId = searchParams.get('booking_id')

    if (!sessionId || !bookingId) {
      return NextResponse.json(
        { error: 'Missing session_id or booking_id' },
        { status: 400 }
      )
    }

    // Get the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Verify the session matches the booking
    if (session.client_reference_id !== bookingId && session.metadata?.bookingId !== bookingId) {
      return NextResponse.json(
        { error: 'Session does not match booking' },
        { status: 400 }
      )
    }

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      bookingId: booking.id,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      amount: formatAmountFromStripe(session.amount_total || 0),
      paymentType: session.metadata?.paymentType || 'deposit',
      status: booking.paymentStatus,
      sessionStatus: session.payment_status,
    })
  } catch (error) {
    console.error('Failed to verify payment:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
