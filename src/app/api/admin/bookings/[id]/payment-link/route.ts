import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function getAdmin() {
  const { cookies } = await import('next/headers')
  const { verifyToken } = await import('@/lib/auth')

  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const admin = await getAdmin()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = context.params
    const { paymentType = 'deposit' } = await request.json()

    const booking = await prisma.booking.findUnique({
      where: { id },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Generate payment link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'
    const paymentUrl = `${baseUrl}/payment/checkout?booking_id=${booking.id}&type=${paymentType}`

    // In a real implementation, you would send this via email
    // For now, just return the link
    return NextResponse.json({
      success: true,
      paymentUrl,
      booking: {
        id: booking.id,
        clientEmail: booking.clientEmail,
        depositAmount: booking.depositAmount,
        totalQuote: booking.totalQuote,
      },
    })
  } catch (error) {
    console.error('Failed to generate payment link:', error)
    return NextResponse.json(
      { error: 'Failed to generate payment link' },
      { status: 500 }
    )
  }
}
