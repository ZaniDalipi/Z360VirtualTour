import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { PricingPlan } from '@/lib/models'
import { getAdminFromCookies } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB()

  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const plan = await PricingPlan.findById(id)

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    return NextResponse.json({ ...plan.toObject(), id: plan._id })
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
  await connectDB()

  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await request.json()

    // Convert features - MongoDB stores as array, no need for JSON.stringify
    const features = Array.isArray(data.features)
      ? data.features
      : typeof data.features === 'string'
      ? JSON.parse(data.features)
      : []

    const plan = await PricingPlan.findByIdAndUpdate(
      id,
      {
        name: data.name,
        description: data.description || '',
        price: parseFloat(data.price) || 0,
        priceLabel: data.priceLabel || null,
        features: features,
        isPopular: data.isPopular || false,
        isActive: data.isActive ?? true,
        order: data.order || 0,
      },
      { new: true }
    )

    return NextResponse.json({ ...plan?.toObject(), id: plan?._id })
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
  await connectDB()

  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    await PricingPlan.findByIdAndDelete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete pricing plan:', error)
    return NextResponse.json(
      { error: 'Failed to delete pricing plan' },
      { status: 500 }
    )
  }
}
