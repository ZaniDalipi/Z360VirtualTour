import { NextRequest, NextResponse } from 'next/server'
import { calculateQuote, getDistanceByCity } from '@/lib/quote-utils'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Get pricing plan price if selected
    let basePrice = 0
    let planName = 'Custom'
    if (data.pricingPlanId) {
      const plan = await prisma.pricingPlan.findUnique({
        where: { id: data.pricingPlanId },
      })
      if (plan) {
        basePrice = plan.price
        planName = plan.name
      }
    } else if (data.basePrice) {
      basePrice = parseFloat(data.basePrice)
    }

    // Calculate distance from city if not provided
    let distanceKm = data.distanceKm
    if (!distanceKm && data.city) {
      distanceKm = getDistanceByCity(data.city)
    }

    // Calculate quote
    const quote = await calculateQuote({
      pricingPlanPrice: basePrice,
      urgencyTierId: data.urgencyTierId,
      distanceKm,
      bundleId: data.bundleId,
      userCity: data.city,  // Pass user's city for bundle eligibility check
      scheduledCities: data.scheduledCities,  // Cities where photographer is already scheduled (for same-city discount)
    })

    return NextResponse.json({
      planName,
      ...quote,
    })
  } catch (error) {
    console.error('Failed to calculate quote:', error)
    return NextResponse.json(
      { error: 'Failed to calculate quote' },
      { status: 500 }
    )
  }
}
