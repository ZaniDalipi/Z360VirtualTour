import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import { TravelZone } from '@/lib/models'

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
    const zone = await TravelZone.findById(id)

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
    await connectDB()
    const { id } = await params
    const data = await request.json()

    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.minDistanceKm !== undefined) updateData.minDistanceKm = parseFloat(data.minDistanceKm)
    if (data.maxDistanceKm !== undefined) updateData.maxDistanceKm = data.maxDistanceKm ? parseFloat(data.maxDistanceKm) : null
    if (data.flatFee !== undefined) updateData.flatFee = data.flatFee ? parseFloat(data.flatFee) : null
    if (data.perKmRate !== undefined) updateData.perKmRate = data.perKmRate ? parseFloat(data.perKmRate) : null
    if (data.isIncluded !== undefined) updateData.isIncluded = data.isIncluded
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.order !== undefined) updateData.order = parseInt(data.order)

    const zone = await TravelZone.findByIdAndUpdate(id, updateData, { new: true })

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
    await connectDB()
    const { id } = await params
    await TravelZone.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete travel zone:', error)
    return NextResponse.json(
      { error: 'Failed to delete travel zone' },
      { status: 500 }
    )
  }
}
