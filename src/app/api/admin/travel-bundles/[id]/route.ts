import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const bundle = await prisma.travelBundle.findUnique({
      where: { id },
      include: {
        bookings: true,
      },
    })

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

    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.city !== undefined) updateData.city = data.city
    if (data.region !== undefined) updateData.region = data.region
    if (data.startDate !== undefined) {
      updateData.startDate = new Date(data.startDate)
      updateData.scheduledDate = new Date(data.startDate) // Keep scheduledDate in sync
    }
    if (data.endDate !== undefined) {
      updateData.endDate = new Date(data.endDate)
    }
    if (data.maxParticipants !== undefined) updateData.maxParticipants = parseInt(data.maxParticipants)
    if (data.currentCount !== undefined) updateData.currentCount = parseInt(data.currentCount)
    if (data.distanceKm !== undefined) updateData.distanceKm = data.distanceKm ? parseFloat(data.distanceKm) : null
    if (data.totalTravelCost !== undefined) updateData.totalTravelCost = data.totalTravelCost ? parseFloat(data.totalTravelCost) : null
    if (data.perPersonTravelFee !== undefined) updateData.perPersonTravelFee = data.perPersonTravelFee ? parseFloat(data.perPersonTravelFee) : null
    if (data.discountPercent !== undefined) updateData.discountPercent = parseFloat(data.discountPercent)
    if (data.description !== undefined) updateData.description = data.description
    if (data.status !== undefined) updateData.status = data.status
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.registrationDeadline !== undefined) updateData.registrationDeadline = data.registrationDeadline ? new Date(data.registrationDeadline) : null

    const bundle = await prisma.travelBundle.update({
      where: { id },
      data: updateData,
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
    await prisma.travelBundle.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete travel bundle:', error)
    return NextResponse.json(
      { error: 'Failed to delete travel bundle' },
      { status: 500 }
    )
  }
}
