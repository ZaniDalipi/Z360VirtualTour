import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering since we use cookies
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: { date?: { gte?: Date; lte?: Date } } = {}
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const dates = await prisma.blockedDate.findMany({
      where,
      orderBy: { date: 'asc' },
    })

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

    const blockedDate = await prisma.blockedDate.create({
      data: {
        date: new Date(data.date),
        reason: data.reason || null,
        isAllDay: data.isAllDay ?? true,
      },
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
