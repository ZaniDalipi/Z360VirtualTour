import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { PricingPlan } from '@/lib/models'
import { getAdminFromCookies } from '@/lib/auth'

export async function GET() {
  await connectDB()

  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const plans = await PricingPlan.find().sort({ order: 1 })

    return NextResponse.json(
      plans.map((plan) => ({ ...plan.toObject(), id: plan._id }))
    )
  } catch (error) {
    console.error('Failed to fetch pricing plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing plans' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  await connectDB()

  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    // Convert features - MongoDB stores as array, no need for JSON.stringify
    const features = Array.isArray(data.features)
      ? data.features
      : typeof data.features === 'string'
      ? JSON.parse(data.features)
      : []

    const plan = await PricingPlan.create({
      name: data.name,
      description: data.description || '',
      price: parseFloat(data.price) || 0,
      priceLabel: data.priceLabel || null,
      features: features,
      isPopular: data.isPopular || false,
      isActive: data.isActive ?? true,
      order: data.order || 0,
    })

    return NextResponse.json({ ...plan.toObject(), id: plan._id }, { status: 201 })
  } catch (error) {
    console.error('Failed to create pricing plan:', error)
    return NextResponse.json(
      { error: 'Failed to create pricing plan' },
      { status: 500 }
    )
  }
}
