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

    // Build base where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      isActive: true,
      status: 'open',
    }

    // Filter by city if provided
    if (city) {
      where.city = { contains: city, mode: 'insensitive' }
    }

    // Fetch bundles with basic filters
    const allBundles = await prisma.travelBundle.findMany({
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

    // Filter out expired bundles in code
    const bundles = allBundles.filter((b: typeof allBundles[number]) => {
      // Check registration deadline
      if (b.registrationDeadline && new Date(b.registrationDeadline) < today) {
        return false
      }
      // Check end date (use scheduledDate if no endDate)
      const endDate = b.endDate || b.scheduledDate
      if (new Date(endDate) < today) {
        return false
      }
      return true
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
