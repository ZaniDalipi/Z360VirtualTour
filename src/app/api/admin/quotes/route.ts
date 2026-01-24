import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const admin = await getAdminFromCookies()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const isRead = searchParams.get('isRead')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const search = searchParams.get('search')

    // Build filter
    const where: Record<string, unknown> = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (isRead === 'true') {
      where.isRead = true
    } else if (isRead === 'false') {
      where.isRead = false
    }

    if (search) {
      where.OR = [
        { quoteNumber: { contains: search } },
        { guestName: { contains: search } },
        { guestEmail: { contains: search } },
        { propertyAddress: { contains: search } },
        { propertyCity: { contains: search } },
      ]
    }

    // Get quotes with pagination
    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.quote.count({ where }),
    ])

    // Get status counts
    const statusCounts = await prisma.quote.groupBy({
      by: ['status'],
      _count: { status: true },
    })

    const unreadCount = await prisma.quote.count({
      where: { isRead: false },
    })

    return NextResponse.json({
      quotes: quotes.map((q) => ({
        id: q.id,
        quoteNumber: q.quoteNumber,
        clientName: q.client?.name || q.guestName,
        clientEmail: q.client?.email || q.guestEmail,
        clientPhone: q.client?.phone || q.guestPhone,
        company: q.client ? null : q.guestCompany,
        propertyAddress: q.propertyAddress,
        propertyCity: q.propertyCity,
        propertyType: q.propertyType,
        propertySize: q.propertySize,
        preferredCallTime: q.preferredCallTime,
        preferredCallDate: q.preferredCallDate,
        callbackScheduled: q.callbackScheduled,
        status: q.status,
        estimatedPrice: q.estimatedPrice,
        finalPrice: q.finalPrice,
        isRead: q.isRead,
        createdAt: q.createdAt,
        hasAccount: !!q.client,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total,
        unread: unreadCount,
        byStatus: statusCounts.reduce(
          (acc, s) => ({ ...acc, [s.status]: s._count.status }),
          {} as Record<string, number>
        ),
      },
    })
  } catch (error) {
    console.error('Quotes fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}
