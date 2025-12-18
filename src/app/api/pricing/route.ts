import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface PricingPlan {
  id: string
  name: string
  description: string | null
  price: number
  priceLabel: string | null
  features: string
  isPopular: boolean
  isActive: boolean
  order: number
}

export async function GET() {
  try {
    const plans = await prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })

    // Parse features JSON
    const parsedPlans = plans.map((plan: PricingPlan) => ({
      ...plan,
      features: JSON.parse(plan.features || '[]'),
    }))

    return NextResponse.json(parsedPlans)
  } catch (error) {
    console.error('Failed to fetch pricing plans:', error)
    return NextResponse.json([])
  }
}
