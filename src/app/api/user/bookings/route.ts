import { NextResponse } from 'next/server'
import { getUserFromCookies } from '@/lib/user-auth'
import { bookings } from '@/lib/booking-db'

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
    const userBookings = bookings.findByUserId(user.id)

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
