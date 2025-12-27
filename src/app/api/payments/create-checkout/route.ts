import { NextRequest, NextResponse } from 'next/server'
import { stripe, formatAmountForStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { bookingId, paymentType = 'deposit' } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        pricingPlan: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Determine amount based on payment type
    let amount: number
    let description: string

    if (paymentType === 'deposit') {
      amount = booking.depositAmount || 0
      description = `Deposit for 360° Virtual Tour - Booking #${booking.id.slice(-8).toUpperCase()}`
    } else if (paymentType === 'balance') {
      const paidAmount = booking.paidAmount || 0
      amount = (booking.totalQuote || 0) - paidAmount
      description = `Balance Payment for 360° Virtual Tour - Booking #${booking.id.slice(-8).toUpperCase()}`
    } else {
      amount = booking.totalQuote || 0
      description = `Full Payment for 360° Virtual Tour - Booking #${booking.id.slice(-8).toUpperCase()}`
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'http://localhost:4000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: booking.clientEmail,
      client_reference_id: booking.id,
      metadata: {
        bookingId: booking.id,
        paymentType,
        clientName: booking.clientName,
      },
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: booking.pricingPlan?.name || '360° Virtual Tour',
              description,
              images: [], // Can add logo here
            },
            unit_amount: formatAmountForStripe(amount),
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
      cancel_url: `${baseUrl}/payment/cancel?booking_id=${booking.id}`,
    })

    // Update booking with session ID
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        stripeSessionId: session.id,
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Failed to create checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    )
  }
}
