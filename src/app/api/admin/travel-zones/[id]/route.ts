import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { travelZones } from '@/lib/booking-db'

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
    const zone = travelZones.findUnique(id)

    if (!zone) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 })
    }

    return NextResponse.json(zone)
  } catch (error) {
    console.error('Failed to fetch travel zone:', error)
    return NextResponse.json(
      { error: 'Failed to fetch travel zone' },
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

    const zone = travelZones.update(id, {
      name: data.name,
      description: data.description,
      minDistanceKm: data.minDistanceKm !== undefined ? parseFloat(data.minDistanceKm) : undefined,
      maxDistanceKm: data.maxDistanceKm !== undefined ? (data.maxDistanceKm ? parseFloat(data.maxDistanceKm) : null) : undefined,
      flatFee: data.flatFee !== undefined ? (data.flatFee ? parseFloat(data.flatFee) : null) : undefined,
      perKmRate: data.perKmRate !== undefined ? (data.perKmRate ? parseFloat(data.perKmRate) : null) : undefined,
      isIncluded: data.isIncluded,
      isActive: data.isActive,
      order: data.order !== undefined ? parseInt(data.order) : undefined,
    })

    return NextResponse.json(zone)
  } catch (error) {
    console.error('Failed to update travel zone:', error)
    return NextResponse.json(
      { error: 'Failed to update travel zone' },
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
    travelZones.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete travel zone:', error)
    return NextResponse.json(
      { error: 'Failed to delete travel zone' },
      { status: 500 }
    )
  }
}
