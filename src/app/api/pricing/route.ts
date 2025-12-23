import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cache, CacheKeys, CacheTTL } from '@/lib/cache'
import { withRetry, withFallback } from '@/lib/db'

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
    // Try cache first - pricing rarely changes
    const cached = cache.get<unknown[]>(CacheKeys.PRICING_PLANS)
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache-Status': 'hit' }
      })
    }

    const plans = await withFallback<PricingPlan[]>(
      () => withRetry(
        () => prisma.pricingPlan.findMany({
          where: { isActive: true },
          orderBy: { order: 'asc' },
        }),
        { maxRetries: 2 }
      ),
      []
    )

    // Parse features JSON
    const parsedPlans = plans.map((plan) => ({
      ...plan,
      features: JSON.parse(plan.features || '[]'),
    }))

    // Cache for very long since pricing rarely changes
    cache.set(CacheKeys.PRICING_PLANS, parsedPlans, CacheTTL.VERY_LONG)

    return NextResponse.json(parsedPlans)
  } catch (error) {
    console.error('Failed to fetch pricing plans:', error)
    return NextResponse.json([])
  }
}
