import { NextRequest, NextResponse } from 'next/server'
import { stripe, formatAmountFromStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

// Stripe requires the raw body for webhook signature verification
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.payment_status === 'paid') {
          await handleSuccessfulPayment(session)
        }
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment intent succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handleFailedPayment(paymentIntent)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await handleRefund(charge)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.bookingId || session.client_reference_id
  const paymentType = session.metadata?.paymentType || 'deposit'

  if (!bookingId) {
    console.error('No booking ID in session')
    return
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  })

  if (!booking) {
    console.error('Booking not found:', bookingId)
    return
  }

  const paidAmount = formatAmountFromStripe(session.amount_total || 0)
  const previousPaid = booking.paidAmount || 0
  const totalPaid = previousPaid + paidAmount
  const totalQuote = booking.totalQuote || 0

  // Determine new payment status
  let paymentStatus = 'partial'
  if (totalPaid >= totalQuote) {
    paymentStatus = 'paid'
  } else if (paymentType === 'deposit') {
    paymentStatus = 'partial'
  }

  // Update booking
  const updateData: Record<string, unknown> = {
    stripePaymentIntentId: session.payment_intent as string,
    paymentStatus,
    paidAmount: totalPaid,
    paidAt: new Date(),
    paymentMethod: 'card',
  }

  if (paymentType === 'deposit') {
    updateData.depositPaid = true
    updateData.balanceAmount = totalQuote - totalPaid
    updateData.status = 'pending_deposit' // Move to confirmed stage
  } else if (paymentType === 'balance') {
    updateData.balancePaidAt = new Date()
    updateData.balanceAmount = 0
  }

  // If deposit is now paid, move status to confirmed
  if (paymentType === 'deposit' && booking.status === 'pending_deposit') {
    updateData.status = 'confirmed'
    updateData.confirmedAt = new Date()
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: updateData,
  })

  console.log(`Payment successful for booking ${bookingId}: €${paidAmount}`)
}

async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata?.bookingId

  if (!bookingId) {
    return
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: 'failed',
    },
  })

  console.log(`Payment failed for booking ${bookingId}`)
}

async function handleRefund(charge: Stripe.Charge) {
  // Find booking by payment intent
  const paymentIntentId = charge.payment_intent as string

  if (!paymentIntentId) {
    return
  }

  const booking = await prisma.booking.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
  })

  if (!booking) {
    return
  }

  const refundedAmount = formatAmountFromStripe(charge.amount_refunded)
  const newPaidAmount = (booking.paidAmount || 0) - refundedAmount

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: newPaidAmount <= 0 ? 'refunded' : 'partial',
      paidAmount: Math.max(0, newPaidAmount),
      depositPaid: newPaidAmount > 0,
    },
  })

  console.log(`Refund processed for booking ${booking.id}: €${refundedAmount}`)
}
