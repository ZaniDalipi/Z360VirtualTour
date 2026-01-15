import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('user-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
      type: string
    }

    if (decoded.type !== 'user') {
      return NextResponse.json(
        { error: 'Invalid token type' },
        { status: 401 }
      )
    }

    // Get user's bookings
    const bookings = await prisma.booking.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        pricingPlan: {
          select: {
            name: true,
          },
        },
        urgencyTier: {
          select: {
            displayName: true,
          },
        },
      },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
