import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'
import { cache, CacheKeys } from '@/lib/cache'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const plan = await prisma.pricingPlan.findUnique({
      where: { id },
    })

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Failed to fetch pricing plan:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing plan' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await request.json()

    // Convert features array to JSON string
    const features = Array.isArray(data.features)
      ? JSON.stringify(data.features)
      : data.features || '[]'

    const plan = await prisma.pricingPlan.update({
      where: { id },
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

    // Invalidate cache so changes reflect immediately
    cache.delete(CacheKeys.PRICING_PLANS)

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Failed to update pricing plan:', error)
    return NextResponse.json(
      { error: 'Failed to update pricing plan' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.pricingPlan.delete({
      where: { id },
    })

    // Invalidate cache so changes reflect immediately
    cache.delete(CacheKeys.PRICING_PLANS)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete pricing plan:', error)
    return NextResponse.json(
      { error: 'Failed to delete pricing plan' },
      { status: 500 }
    )
  }
}
