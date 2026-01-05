import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Public endpoint to get open bundles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    const now = new Date()

    // Build where clause
    const where: {
      isActive: boolean
      status: string
      city?: { contains: string; mode: 'insensitive' }
      OR?: Array<{ registrationDeadline: null } | { registrationDeadline: { gt: Date } }>
    } = {
      isActive: true,
      status: 'open',
      OR: [
        { registrationDeadline: null },
        { registrationDeadline: { gt: now } },
      ],
    }

    // Filter by city if provided
    if (city) {
      where.city = { contains: city, mode: 'insensitive' }
    }

    // Use select for faster queries
    const bundles = await prisma.travelBundle.findMany({
      where,
      orderBy: { scheduledDate: 'asc' },
      select: {
        id: true,
        name: true,
        city: true,
        region: true,
        startDate: true,
        endDate: true,
        scheduledDate: true,
        maxParticipants: true,
        currentCount: true,
        perPersonTravelFee: true,
        discountPercent: true,
        description: true,
        registrationDeadline: true,
      },
    })

    interface BundleData {
      id: string
      name: string
      city: string
      region: string | null
      startDate: Date | null
      endDate: Date | null
      scheduledDate: Date
      maxParticipants: number
      currentCount: number
      perPersonTravelFee: number | null
      discountPercent: number
      description: string | null
      registrationDeadline: Date | null
    }

    const response = NextResponse.json(bundles.map((b: BundleData) => ({
      id: b.id,
      name: b.name,
      city: b.city,
      region: b.region,
      startDate: b.startDate || b.scheduledDate,
      endDate: b.endDate || b.scheduledDate,
      scheduledDate: b.scheduledDate,
      spotsRemaining: b.maxParticipants - b.currentCount,
      perPersonTravelFee: b.perPersonTravelFee,
      discountPercent: b.discountPercent,
      description: b.description,
      registrationDeadline: b.registrationDeadline,
    })))

    // Cache for 60 seconds (bundles don't change frequently)
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120')

    return response
  } catch (error) {
    console.error('Failed to fetch bundles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bundles' },
      { status: 500 }
    )
  }
}
