import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Quote } from '@/lib/models'
import { getAdminFromCookies } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

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
    const filter: Record<string, unknown> = {}

    if (status && status !== 'all') {
      filter.status = status
    }

    if (isRead === 'true') {
      filter.isRead = true
    } else if (isRead === 'false') {
      filter.isRead = false
    }

    if (search) {
      filter.$or = [
        { quoteNumber: { $regex: search, $options: 'i' } },
        { guestName: { $regex: search, $options: 'i' } },
        { guestEmail: { $regex: search, $options: 'i' } },
        { propertyAddress: { $regex: search, $options: 'i' } },
        { propertyCity: { $regex: search, $options: 'i' } },
      ]
    }

    // Get quotes with pagination
    const [quotes, total] = await Promise.all([
      Quote.find(filter)
        .populate('clientId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Quote.countDocuments(filter),
    ])

    // Get status counts using aggregation
    const statusCounts = await Quote.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])

    const unreadCount = await Quote.countDocuments({ isRead: false })

    return NextResponse.json({
      quotes: quotes.map((q) => {
        const client = q.clientId as { name?: string; email?: string; phone?: string } | null
        return {
          id: q._id,
          quoteNumber: q.quoteNumber,
          clientName: client?.name || q.guestName,
          clientEmail: client?.email || q.guestEmail,
          clientPhone: client?.phone || q.guestPhone,
          company: client ? null : q.guestCompany,
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
          hasAccount: !!client,
        }
      }),
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
          (acc, s) => ({ ...acc, [s._id]: s.count }),
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
