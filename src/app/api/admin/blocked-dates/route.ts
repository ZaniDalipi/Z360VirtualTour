import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { blockedDates } from '@/lib/booking-db'

export async function GET(request: NextRequest) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined

    const dates = blockedDates.findMany({ startDate, endDate })
    return NextResponse.json(dates)
  } catch (error) {
    console.error('Failed to fetch blocked dates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blocked dates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    const blockedDate = blockedDates.create({
      date: data.date,
      reason: data.reason,
      isAllDay: data.isAllDay ?? true,
    })

    return NextResponse.json(blockedDate, { status: 201 })
  } catch (error) {
    console.error('Failed to create blocked date:', error)
    return NextResponse.json(
      { error: 'Failed to create blocked date' },
      { status: 500 }
    )
  }
}
