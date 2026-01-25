import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { TravelZone } from '@/lib/models'

export async function GET() {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()
    const zones = await TravelZone.find().sort({ order: 1 })
    return NextResponse.json(zones)
  } catch (error) {
    console.error('Failed to fetch travel zones:', error)
    return NextResponse.json(
      { error: 'Failed to fetch travel zones' },
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
    await connectDB()
    const data = await request.json()

    const zone = await TravelZone.create({
      name: data.name,
      description: data.description,
      minDistanceKm: parseFloat(data.minDistanceKm) || 0,
      maxDistanceKm: data.maxDistanceKm ? parseFloat(data.maxDistanceKm) : null,
      flatFee: data.flatFee ? parseFloat(data.flatFee) : null,
      perKmRate: data.perKmRate ? parseFloat(data.perKmRate) : null,
      isIncluded: data.isIncluded ?? false,
      isActive: data.isActive ?? true,
      order: parseInt(data.order) || 0,
    })

    return NextResponse.json(zone, { status: 201 })
  } catch (error) {
    console.error('Failed to create travel zone:', error)
    return NextResponse.json(
      { error: 'Failed to create travel zone' },
      { status: 500 }
    )
  }
}
