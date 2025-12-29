import { NextRequest, NextResponse } from 'next/server'
import { createCheckout } from '@/lib/lemonsqueezy'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { bookingId, paymentType = 'deposit', variantId } = await request.json()

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

    // Determine amount based on payment type (for display purposes)
    let amount: number

    if (paymentType === 'deposit') {
      amount = booking.depositAmount || 0
    } else if (paymentType === 'balance') {
      const paidAmount = booking.paidAmount || 0
      amount = (booking.totalQuote || 0) - paidAmount
    } else {
      amount = booking.totalQuote || 0
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      )
    }

    // Use provided variant ID or get from pricing plan or use default
    // You should create products in LemonSqueezy for each pricing plan
    const productVariantId = variantId || booking.pricingPlan?.lemonSqueezyVariantId || process.env.LEMONSQUEEZY_DEFAULT_VARIANT_ID

    if (!productVariantId) {
      return NextResponse.json(
        { error: 'No payment product configured. Please contact support.' },
        { status: 400 }
      )
    }

    // Create LemonSqueezy checkout
    const checkoutUrl = await createCheckout({
      productId: productVariantId,
      email: booking.clientEmail,
      name: booking.clientName,
      bookingId: booking.id,
      customData: {
        payment_type: paymentType,
        client_name: booking.clientName,
        service: booking.pricingPlan?.name || 'Virtual Tour',
      },
    })

    return NextResponse.json({
      url: checkoutUrl,
      amount,
    })
  } catch (error) {
    console.error('Failed to create checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    )
  }
}
