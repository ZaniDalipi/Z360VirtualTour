import { NextResponse } from 'next/server'
import { getUserFromCookies } from '@/lib/user-auth'
import { prisma } from '@/lib/prisma'

// GET: Fetch all bookings for the authenticated user
export async function GET() {
  try {
    const user = await getUserFromCookies()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all bookings for this user
    const userBookings = await prisma.booking.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        companyName: true,
        propertyAddress: true,
        propertyCity: true,
        serviceType: true,
        projectDescription: true,
        specialRequests: true,
        status: true,
        basePrice: true,
        urgencySurcharge: true,
        travelFee: true,
        bundleDiscount: true,
        sameCityDiscount: true,
        totalQuote: true,
        depositAmount: true,
        depositPaid: true,
        confirmedDate: true,
        confirmedTime: true,
        preferredDate: true,
        preferredTime: true,
        alternateDate: true,
        alternateTime: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // Calculate stats
    const stats = {
      total: userBookings.length,
      pending: userBookings.filter(b =>
        ['quote_requested', 'quote_sent', 'pending_confirmation'].includes(b.status)
      ).length,
      confirmed: userBookings.filter(b =>
        ['confirmed', 'scheduled', 'in_progress'].includes(b.status)
      ).length,
      completed: userBookings.filter(b => b.status === 'completed').length,
    }

    return NextResponse.json({
      bookings: userBookings,
      stats,
    })
  } catch (error) {
    console.error('Failed to fetch user bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
