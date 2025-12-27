import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/lemonsqueezy'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// LemonSqueezy webhook event types
interface LemonSqueezyWebhookEvent {
  meta: {
    event_name: string
    custom_data?: {
      booking_id?: string
      payment_type?: string
    }
  }
  data: {
    id: string
    type: string
    attributes: {
      status: string
      total: number
      currency: string
      first_order_item?: {
        product_name: string
        variant_name: string
        price: number
      }
      user_email: string
      user_name: string
      created_at: string
      refunded_at?: string
      refunded?: boolean
    }
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-signature') || ''

  // Verify webhook signature
  if (!verifyWebhookSignature(body, signature)) {
    console.error('Invalid webhook signature')
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    )
  }

  let event: LemonSqueezyWebhookEvent

  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    )
  }

  const eventName = event.meta.event_name

  try {
    switch (eventName) {
      case 'order_created':
        await handleOrderCreated(event)
        break

      case 'order_refunded':
        await handleOrderRefunded(event)
        break

      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_cancelled':
        // Handle subscription events if needed in the future
        console.log(`Subscription event: ${eventName}`)
        break

      default:
        console.log(`Unhandled event type: ${eventName}`)
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

async function handleOrderCreated(event: LemonSqueezyWebhookEvent) {
  const bookingId = event.meta.custom_data?.booking_id
  const paymentType = event.meta.custom_data?.payment_type || 'deposit'
  const order = event.data.attributes

  if (!bookingId) {
    console.error('No booking ID in webhook data')
    return
  }

  // Only process paid orders
  if (order.status !== 'paid') {
    console.log(`Order status is ${order.status}, skipping...`)
    return
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  })

  if (!booking) {
    console.error('Booking not found:', bookingId)
    return
  }

  // Amount is in cents
  const paidAmount = order.total / 100
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
    lemonSqueezyOrderId: event.data.id,
    paymentStatus,
    paidAmount: totalPaid,
    paidAt: new Date(),
    paymentMethod: 'lemonsqueezy',
  }

  if (paymentType === 'deposit') {
    updateData.depositPaid = true
    updateData.balanceAmount = totalQuote - totalPaid
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

  // Send payment confirmation email
  try {
    const { sendEmail, emailTemplates } = await import('@/lib/email')
    const template = emailTemplates.paymentReceived({
      clientName: booking.clientName,
      bookingId: booking.id,
      amount: paidAmount,
      paymentType: paymentType as 'deposit' | 'balance' | 'full',
      totalQuote: totalQuote,
      remainingBalance: totalQuote - totalPaid,
    })
    await sendEmail(booking.clientEmail, template)
  } catch (err) {
    console.error('Failed to send payment confirmation email:', err)
  }
}

async function handleOrderRefunded(event: LemonSqueezyWebhookEvent) {
  const bookingId = event.meta.custom_data?.booking_id
  const order = event.data.attributes

  if (!bookingId) {
    console.error('No booking ID in refund webhook')
    return
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  })

  if (!booking) {
    console.error('Booking not found:', bookingId)
    return
  }

  const refundedAmount = order.total / 100
  const newPaidAmount = (booking.paidAmount || 0) - refundedAmount

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: newPaidAmount <= 0 ? 'refunded' : 'partial',
      paidAmount: Math.max(0, newPaidAmount),
      depositPaid: newPaidAmount > 0,
    },
  })

  console.log(`Refund processed for booking ${bookingId}: €${refundedAmount}`)
}
