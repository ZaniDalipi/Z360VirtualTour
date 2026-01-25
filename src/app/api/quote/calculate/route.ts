import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { PricingPlan } from '@/lib/models'
import { calculateQuote, getDistanceByCity } from '@/lib/quote-utils'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const data = await request.json()

    // Get pricing plan price if selected
    let basePrice = 0
    let planName = 'Custom'
    if (data.pricingPlanId) {
      const plan = await PricingPlan.findById(data.pricingPlanId)
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
