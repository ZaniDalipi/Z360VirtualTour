import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const plans = await prisma.pricingPlan.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error('Failed to fetch pricing plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing plans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    // Convert features array to JSON string
    const features = Array.isArray(data.features)
      ? JSON.stringify(data.features)
      : data.features || '[]'

    const plan = await prisma.pricingPlan.create({
      data: {
        name: data.name,
        description: data.description || '',
        price: parseFloat(data.price) || 0,
        priceLabel: data.priceLabel || null,
        features: features,
        isPopular: data.isPopular || false,
        isActive: data.isActive ?? true,
        order: data.order || 0,
      },
    })

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error('Failed to create pricing plan:', error)
    return NextResponse.json(
      { error: 'Failed to create pricing plan' },
      { status: 500 }
    )
  }
}
