import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Public endpoint to get open bundles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    const now = new Date()
    // Set to start of today for date comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Build where clause - only show bundles that:
    // 1. Are active and open
    // 2. Registration deadline hasn't passed (or no deadline)
    // 3. End date hasn't passed (use scheduledDate if no endDate)
    const where: {
      isActive: boolean
      status: string
      city?: { contains: string; mode: 'insensitive' }
      AND?: Array<{
        OR: Array<{ registrationDeadline: null } | { registrationDeadline: { gte: Date } } | { endDate: null } | { endDate: { gte: Date } } | { scheduledDate: { gte: Date } }>
      }>
    } = {
      isActive: true,
      status: 'open',
      AND: [
        // Registration deadline check
        {
          OR: [
            { registrationDeadline: null },
            { registrationDeadline: { gte: today } },
          ],
        },
        // End date check (bundle period hasn't ended)
        {
          OR: [
            { endDate: { gte: today } },
            // If no endDate, use scheduledDate
            {
              AND: [
                { endDate: null },
                { scheduledDate: { gte: today } },
              ],
            } as { AND: Array<{ endDate: null } | { scheduledDate: { gte: Date } }> },
          ],
        },
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
