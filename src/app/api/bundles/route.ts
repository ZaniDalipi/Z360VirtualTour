import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { TravelBundle } from '@/lib/models'

// Public endpoint to get open bundles
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')

    const query: Record<string, unknown> = { isActive: true, status: 'open' }
    if (city) {
      query.city = { $regex: city, $options: 'i' }
    }

    const now = new Date()
    // Filter out bundles past registration deadline
    query.$or = [
      { registrationDeadline: null },
      { registrationDeadline: { $gt: now } }
    ]

    const bundles = await TravelBundle.find(query).sort({ scheduledDate: 1 })

    // Only return public-facing data
    return NextResponse.json(bundles.map(b => ({
      id: b._id,
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
