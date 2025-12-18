import { NextRequest, NextResponse } from 'next/server'
import { travelBundles } from '@/lib/booking-db'

// Public endpoint to get open bundles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    let bundles = travelBundles.findMany({
      where: { isActive: true, status: 'open' },
    })

    // Filter by city if provided
    if (city) {
      bundles = bundles.filter(b =>
        b.city.toLowerCase().includes(city.toLowerCase())
      )
    }

    // Filter out bundles past registration deadline
    const now = new Date().toISOString()
    bundles = bundles.filter(b =>
      !b.registrationDeadline || b.registrationDeadline > now
    )

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
