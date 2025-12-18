import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { bookings } from '@/lib/booking-db'

export async function GET(request: NextRequest) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const isRead = searchParams.get('isRead')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    const allBookings = bookings.findMany({
      where: {
        status,
        isRead: isRead !== null ? isRead === 'true' : undefined,
      },
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    })

    const total = bookings.count({
      where: {
        status,
        isRead: isRead !== null ? isRead === 'true' : undefined,
      },
    })

    const unreadCount = bookings.count({ where: { isRead: false } })

    return NextResponse.json({
      bookings: allBookings,
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
