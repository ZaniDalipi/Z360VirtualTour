import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { TravelBundle } from '@/lib/models'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()
    const { id } = await params
    const bundle = await TravelBundle.findById(id)

    if (!bundle) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
    }

    return NextResponse.json(bundle)
  } catch (error) {
    console.error('Failed to fetch travel bundle:', error)
    return NextResponse.json(
      { error: 'Failed to fetch travel bundle' },
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
    await connectDB()
    const { id } = await params
    const data = await request.json()

    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.city !== undefined) updateData.city = data.city
    if (data.region !== undefined) updateData.region = data.region
    if (data.scheduledDate !== undefined) updateData.scheduledDate = data.scheduledDate
    if (data.maxParticipants !== undefined) updateData.maxParticipants = parseInt(data.maxParticipants)
    if (data.currentCount !== undefined) updateData.currentCount = parseInt(data.currentCount)
    if (data.distanceKm !== undefined) updateData.distanceKm = data.distanceKm ? parseFloat(data.distanceKm) : null
    if (data.totalTravelCost !== undefined) updateData.totalTravelCost = data.totalTravelCost ? parseFloat(data.totalTravelCost) : null
    if (data.perPersonTravelFee !== undefined) updateData.perPersonTravelFee = data.perPersonTravelFee ? parseFloat(data.perPersonTravelFee) : null
    if (data.discountPercent !== undefined) updateData.discountPercent = parseFloat(data.discountPercent)
    if (data.description !== undefined) updateData.description = data.description
    if (data.status !== undefined) updateData.status = data.status
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.registrationDeadline !== undefined) updateData.registrationDeadline = data.registrationDeadline

    const bundle = await TravelBundle.findByIdAndUpdate(id, updateData, { new: true })

    return NextResponse.json(bundle)
  } catch (error) {
    console.error('Failed to update travel bundle:', error)
    return NextResponse.json(
      { error: 'Failed to update travel bundle' },
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
    await connectDB()
    const { id } = await params
    await TravelBundle.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete travel bundle:', error)
    return NextResponse.json(
      { error: 'Failed to delete travel bundle' },
      { status: 500 }
    )
  }
}
