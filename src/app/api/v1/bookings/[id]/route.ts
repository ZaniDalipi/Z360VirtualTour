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

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/v1/bookings/:id
 * Get a specific booking by ID or external ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const startTime = Date.now()
  const { id } = await context.params
  const endpoint = `/api/v1/bookings/${id}`

  const apiKey = await validateApiKey(request)

  if (!apiKey) {
    await logApiRequest(null, 'GET', endpoint, 401, Date.now() - startTime, request, 'Invalid API key')
    return NextResponse.json(
      apiError('Invalid or missing API key', 401, 'UNAUTHORIZED'),
      { status: 401, headers: corsHeaders }
    )
  }

  if (!hasPermission(apiKey, 'read') && !hasPermission(apiKey, 'bookings')) {
    await logApiRequest(apiKey.id, 'GET', endpoint, 403, Date.now() - startTime, request, 'Permission denied')
    return NextResponse.json(
      apiError('Permission denied', 403, 'FORBIDDEN'),
      { status: 403, headers: corsHeaders }
    )
  }

  try {
    // Try to find by Z360 ID first, then by external ID
    let booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { id, externalSource: apiKey.appName },
          { externalId: id, externalSource: apiKey.appName },
        ],
      },
      select: {
        id: true,
        externalId: true,
        externalSource: true,
        clientName: true,
        clientEmail: true,
        clientPhone: true,
        companyName: true,
        propertyAddress: true,
        propertyCity: true,
        serviceType: true,
        projectDescription: true,
        specialRequests: true,
        status: true,
        totalQuote: true,
        depositAmount: true,
        depositPaid: true,
        paymentStatus: true,
        preferredDate: true,
        preferredTime: true,
        confirmedDate: true,
        confirmedTime: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        deliveredAt: true,
        deliverables: true,
        clientFeedback: true,
        rating: true,
      },
    })

    if (!booking) {
      await logApiRequest(apiKey.id, 'GET', endpoint, 404, Date.now() - startTime, request, 'Booking not found')
      return NextResponse.json(
        apiError('Booking not found', 404, 'NOT_FOUND'),
        { status: 404, headers: corsHeaders }
      )
    }

    // Parse deliverables if present
    let deliverables = null
    if (booking.deliverables) {
      try {
        deliverables = JSON.parse(booking.deliverables)
      } catch {
        deliverables = booking.deliverables
      }
    }

    const response = {
      ...booking,
      deliverables,
    }

    await logApiRequest(apiKey.id, 'GET', endpoint, 200, Date.now() - startTime, request)

    return NextResponse.json(apiSuccess(response), { headers: corsHeaders })
  } catch (error) {
    console.error('Error fetching booking:', error)
    await logApiRequest(apiKey.id, 'GET', endpoint, 500, Date.now() - startTime, request, String(error))
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
