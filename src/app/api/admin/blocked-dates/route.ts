import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { BlockedDate } from '@/lib/models'

export async function GET(request: NextRequest) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const query: Record<string, unknown> = {}
    if (startDate || endDate) {
      query.date = {}
      if (startDate) (query.date as Record<string, string>).$gte = startDate
      if (endDate) (query.date as Record<string, string>).$lte = endDate
    }

    const dates = await BlockedDate.find(query).sort({ date: 1 })
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
    await connectDB()
    const data = await request.json()

    const blockedDate = await BlockedDate.create({
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
