import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { PricingPlan } from '@/lib/models'

export async function GET() {
  try {
    await connectDB()

    const plans = await PricingPlan.find({ isActive: true }).sort({ order: 1 })

    // Transform to expected format
    const transformedPlans = plans.map((plan) => ({
      id: plan._id.toString(),
      name: plan.name,
      description: plan.description,
      price: plan.price,
      priceLabel: plan.priceLabel,
      features: plan.features, // Already an array in MongoDB
      isPopular: plan.isPopular,
      isActive: plan.isActive,
      order: plan.order,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }))

    return NextResponse.json(transformedPlans)
  } catch (error) {
    console.error('Failed to fetch pricing plans:', error)
    return NextResponse.json([])
  }
}
