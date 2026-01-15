import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        clientName: true,
        clientEmail: true,
        propertyAddress: true,
        propertyCity: true,
        serviceType: true,
        totalQuote: true,
        depositAmount: true,
        depositPaid: true,
        paymentStatus: true,
        paidAmount: true,
        balanceAmount: true,
        status: true,
        confirmedDate: true,
        confirmedTime: true,
        preferredDate: true,
        preferredTime: true,
        createdAt: true,
        pricingPlan: {
          select: {
            name: true,
          }
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Format response
    return NextResponse.json({
      id: booking.id,
      clientName: booking.clientName,
      clientEmail: booking.clientEmail,
      propertyAddress: booking.propertyAddress,
      propertyCity: booking.propertyCity,
      serviceType: booking.serviceType,
      totalQuote: booking.totalQuote,
      depositAmount: booking.depositAmount,
      depositPaid: booking.depositPaid,
      paymentStatus: booking.paymentStatus,
      paidAmount: booking.paidAmount,
      balanceAmount: booking.balanceAmount,
      status: booking.status,
      confirmedDate: booking.confirmedDate,
      confirmedTime: booking.confirmedTime,
      preferredDate: booking.preferredDate,
      preferredTime: booking.preferredTime,
      createdAt: booking.createdAt,
      pricingPlanName: booking.pricingPlan?.name || null,
    })
  } catch (error) {
    console.error('Failed to fetch booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}
