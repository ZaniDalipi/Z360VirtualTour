import { NextResponse } from 'next/server'
import { getUserFromCookies } from '@/lib/user-auth'
import { findUserById } from '@/lib/user-db'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Fetch all bookings for the authenticated user
export async function GET() {
  try {
    const userPayload = await getUserFromCookies()

    if (!userPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get full user data to get email for fallback query
    const user = await findUserById(userPayload.id)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // Get all bookings for this user - try userId first, fallback to email match
    let userBookings
    try {
      // Try to find by userId (if schema is up to date)
      userBookings = await prisma.booking.findMany({
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
    } catch {
      // Fallback: find by email if userId field not available
      userBookings = await prisma.booking.findMany({
        where: { clientEmail: { equals: user.email, mode: 'insensitive' } },
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
    }

    // Calculate stats
    const stats = {
      total: userBookings.length,
      pending: userBookings.filter((b: { status: string }) =>
        ['quote_requested', 'quote_sent', 'pending_confirmation'].includes(b.status)
      ).length,
      confirmed: userBookings.filter((b: { status: string }) =>
        ['confirmed', 'scheduled', 'in_progress'].includes(b.status)
      ).length,
      completed: userBookings.filter((b: { status: string }) => b.status === 'completed').length,
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
