import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  validateApiKey,
  hasPermission,
  corsHeaders,
  apiError,
  apiSuccess,
  logApiRequest,
} from '@/lib/api-auth'
import { triggerWebhooks } from '@/lib/webhooks'

export const dynamic = 'force-dynamic'

/**
 * GET /api/v1/bookings
 * List bookings (filtered by external app's bookings)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const apiKey = await validateApiKey(request)

  if (!apiKey) {
    await logApiRequest(null, 'GET', '/api/v1/bookings', 401, Date.now() - startTime, request, 'Invalid API key')
    return NextResponse.json(
      apiError('Invalid or missing API key', 401, 'UNAUTHORIZED'),
      { status: 401, headers: corsHeaders }
    )
  }

  if (!hasPermission(apiKey, 'read') && !hasPermission(apiKey, 'bookings')) {
    await logApiRequest(apiKey.id, 'GET', '/api/v1/bookings', 403, Date.now() - startTime, request, 'Permission denied')
    return NextResponse.json(
      apiError('Permission denied', 403, 'FORBIDDEN'),
      { status: 403, headers: corsHeaders }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const externalId = searchParams.get('external_id')
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query - only show bookings from this app
    const where: Record<string, unknown> = {
      externalSource: apiKey.appName,
    }

    if (externalId) {
      where.externalId = externalId
    }

    if (status) {
      where.status = status
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          externalId: true,
          clientName: true,
          clientEmail: true,
          propertyAddress: true,
          propertyCity: true,
          serviceType: true,
          status: true,
          totalQuote: true,
          confirmedDate: true,
          confirmedTime: true,
          preferredDate: true,
          createdAt: true,
          updatedAt: true,
          completedAt: true,
          deliverables: true,
        },
      }),
      prisma.booking.count({ where }),
    ])

    await logApiRequest(apiKey.id, 'GET', '/api/v1/bookings', 200, Date.now() - startTime, request)

    return NextResponse.json(
      apiSuccess(bookings, {
        total,
        limit,
        offset,
        hasMore: offset + bookings.length < total,
      }),
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Error fetching bookings:', error)
    await logApiRequest(apiKey.id, 'GET', '/api/v1/bookings', 500, Date.now() - startTime, request, String(error))
    return NextResponse.json(
      apiError('Internal server error', 500),
      { status: 500, headers: corsHeaders }
    )
  }
}

/**
 * POST /api/v1/bookings
 * Create a new booking from external app
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const apiKey = await validateApiKey(request)

  if (!apiKey) {
    await logApiRequest(null, 'POST', '/api/v1/bookings', 401, Date.now() - startTime, request, 'Invalid API key')
    return NextResponse.json(
      apiError('Invalid or missing API key', 401, 'UNAUTHORIZED'),
      { status: 401, headers: corsHeaders }
    )
  }

  if (!hasPermission(apiKey, 'write') && !hasPermission(apiKey, 'bookings')) {
    await logApiRequest(apiKey.id, 'POST', '/api/v1/bookings', 403, Date.now() - startTime, request, 'Permission denied')
    return NextResponse.json(
      apiError('Permission denied', 403, 'FORBIDDEN'),
      { status: 403, headers: corsHeaders }
    )
  }

  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['clientName', 'clientEmail', 'propertyAddress']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          apiError(`Missing required field: ${field}`, 400, 'VALIDATION_ERROR'),
          { status: 400, headers: corsHeaders }
        )
      }
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        // External reference
        externalId: body.externalId || body.external_id || null,
        externalSource: apiKey.appName,

        // Client info
        clientName: body.clientName || body.client_name,
        clientEmail: body.clientEmail || body.client_email,
        clientPhone: body.clientPhone || body.client_phone || null,
        companyName: body.companyName || body.company_name || null,

        // Property details
        propertyAddress: body.propertyAddress || body.property_address,
        propertyCity: body.propertyCity || body.property_city || null,
        serviceType: body.serviceType || body.service_type || 'real-estate',
        projectDescription: body.projectDescription || body.description || null,
        specialRequests: body.specialRequests || body.special_requests || null,

        // Scheduling preferences
        preferredDate: body.preferredDate ? new Date(body.preferredDate) : null,
        preferredTime: body.preferredTime || body.preferred_time || null,
        alternateDate: body.alternateDate ? new Date(body.alternateDate) : null,
        alternateTime: body.alternateTime || body.alternate_time || null,
        isFlexible: body.isFlexible ?? body.is_flexible ?? true,

        // Initial status
        status: 'quote_requested',
      },
      select: {
        id: true,
        externalId: true,
        clientName: true,
        clientEmail: true,
        propertyAddress: true,
        propertyCity: true,
        serviceType: true,
        status: true,
        preferredDate: true,
        createdAt: true,
      },
    })

    // Trigger webhook
    await triggerWebhooks('booking.created', {
      bookingId: booking.id,
      externalId: booking.externalId,
      clientName: booking.clientName,
      propertyAddress: booking.propertyAddress,
      status: booking.status,
    })

    await logApiRequest(apiKey.id, 'POST', '/api/v1/bookings', 201, Date.now() - startTime, request)

    return NextResponse.json(
      apiSuccess(booking, { message: 'Booking created successfully' }),
      { status: 201, headers: corsHeaders }
    )
  } catch (error) {
    console.error('Error creating booking:', error)
    await logApiRequest(apiKey.id, 'POST', '/api/v1/bookings', 500, Date.now() - startTime, request, String(error))
    return NextResponse.json(
      apiError('Internal server error', 500),
      { status: 500, headers: corsHeaders }
    )
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Access-Control-Max-Age': '86400',
    },
  })
}
