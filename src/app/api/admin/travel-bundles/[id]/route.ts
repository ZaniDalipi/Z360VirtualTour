import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { travelBundles } from '@/lib/booking-db'

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
    const bundle = travelBundles.findUnique(id)

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
    const { id } = await params
    const data = await request.json()

    const bundle = travelBundles.update(id, {
      name: data.name,
      city: data.city,
      region: data.region,
      scheduledDate: data.scheduledDate,
      maxParticipants: data.maxParticipants !== undefined ? parseInt(data.maxParticipants) : undefined,
      currentCount: data.currentCount !== undefined ? parseInt(data.currentCount) : undefined,
      distanceKm: data.distanceKm !== undefined ? (data.distanceKm ? parseFloat(data.distanceKm) : null) : undefined,
      totalTravelCost: data.totalTravelCost !== undefined ? (data.totalTravelCost ? parseFloat(data.totalTravelCost) : null) : undefined,
      perPersonTravelFee: data.perPersonTravelFee !== undefined ? (data.perPersonTravelFee ? parseFloat(data.perPersonTravelFee) : null) : undefined,
      discountPercent: data.discountPercent !== undefined ? parseFloat(data.discountPercent) : undefined,
      description: data.description,
      status: data.status,
      isActive: data.isActive,
      registrationDeadline: data.registrationDeadline,
    })

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
    const { id } = await params
    travelBundles.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete travel bundle:', error)
    return NextResponse.json(
      { error: 'Failed to delete travel bundle' },
      { status: 500 }
    )
  }
}
