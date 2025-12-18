import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    const bundles = await prisma.travelBundle.findMany({
      where,
      orderBy: { scheduledDate: 'asc' },
    })

    // Only return public-facing data
    return NextResponse.json(bundles.map(b => ({
      id: b.id,
      name: b.name,
      city: b.city,
      region: b.region,
      scheduledDate: b.scheduledDate,
      spotsRemaining: b.maxParticipants - b.currentCount,
      perPersonTravelFee: b.perPersonTravelFee,
      discountPercent: b.discountPercent,
      description: b.description,
      registrationDeadline: b.registrationDeadline,
    })))
  } catch (error) {
    console.error('Failed to fetch bundles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bundles' },
      { status: 500 }
    )
  }
}
