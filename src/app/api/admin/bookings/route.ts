import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    // Validate required fields
    if (!data.clientName || !data.clientEmail || !data.propertyAddress) {
      return NextResponse.json(
        { error: 'Client name, email, and property address are required' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.create({
      data: {
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone || null,
        companyName: data.companyName || null,
        propertyAddress: data.propertyAddress,
        propertyCity: data.propertyCity || null,
        estimatedDistance: data.estimatedDistance || null,
        serviceType: data.serviceType || null,
        projectDescription: data.projectDescription || null,
        specialRequests: data.specialRequests || null,
        preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
        alternateDate: data.alternateDate ? new Date(data.alternateDate) : null,
        deadlineDate: data.deadlineDate ? new Date(data.deadlineDate) : null,
        basePrice: data.basePrice || null,
        totalQuote: data.totalQuote || null,
        depositAmount: data.depositAmount || null,
        internalNotes: data.internalNotes || null,
        status: data.status || 'quote_requested',
        isRead: true, // Admin-created bookings are already "read"
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Failed to create booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const isRead = searchParams.get('isRead')
    const limit = searchParams.get('limit') || '20' // Default limit for faster loads
    const offset = searchParams.get('offset')

    const where = {
      ...(status && { status }),
      ...(isRead !== null && { isRead: isRead === 'true' }),
    }

    const [allBookings, total, unreadCount] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: offset ? parseInt(offset) : undefined,
        select: {
          id: true,
          clientName: true,
          clientEmail: true,
          clientPhone: true,
          companyName: true,
          propertyAddress: true,
          propertyCity: true,
          serviceType: true,
          preferredDate: true,
          preferredTime: true,
          alternateDate: true,
          alternateTime: true,
          confirmedDate: true,
          confirmedTime: true,
          totalQuote: true,
          depositAmount: true,
          depositPaid: true,
          status: true,
          isRead: true,
          createdAt: true,
          travelBundleId: true,
          pricingPlanId: true,
          urgencyTierId: true,
          workStartedAt: true,
          workEndedAt: true,
          workDurationMinutes: true,
          // Change request fields
          changeRequestType: true,
          changeRequestMessage: true,
          changeRequestDate: true,
          changeRequestStatus: true,
          requestedNewDate: true,
          requestedNewTime: true,
        },
      }),
      prisma.booking.count({ where }),
      prisma.booking.count({ where: { isRead: false } }),
    ])

    const response = NextResponse.json({
      bookings: allBookings,
      total,
      unreadCount,
    })

    // Cache for 10 seconds
    response.headers.set('Cache-Control', 'private, max-age=10, stale-while-revalidate=30')

    return response
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
