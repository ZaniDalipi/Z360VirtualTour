import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        clientName: true,
        clientEmail: true,
        totalQuote: true,
        depositAmount: true,
        depositPaid: true,
        paymentStatus: true,
        paidAmount: true,
        balanceAmount: true,
        status: true,
        propertyAddress: true,
        propertyCity: true,
        createdAt: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
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
