import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { Booking } from '@/lib/models'

export async function GET(request: NextRequest) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const isRead = searchParams.get('isRead')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    // Build query
    const query: Record<string, unknown> = {}
    if (status) query.status = status
    if (isRead !== null) query.isRead = isRead === 'true'

    const allBookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(offset ? parseInt(offset) : 0)
      .limit(limit ? parseInt(limit) : 100)
      .lean()

    const total = await Booking.countDocuments(query)
    const unreadCount = await Booking.countDocuments({ isRead: false })

    // Map MongoDB _id to id for frontend compatibility
    const bookingsWithId = allBookings.map(booking => ({
      ...booking,
      id: booking._id.toString(),
    }))

    return NextResponse.json({
      bookings: bookingsWithId,
      total,
      unreadCount,
    })
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
