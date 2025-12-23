import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const bundles = await prisma.travelBundle.findMany({
      orderBy: { scheduledDate: 'asc' },
    })
    return NextResponse.json(bundles)
  } catch (error) {
    console.error('Failed to fetch travel bundles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch travel bundles' },
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

    const bundle = await prisma.travelBundle.create({
      data: {
        name: data.name,
        city: data.city,
        region: data.region || null,
        scheduledDate: new Date(data.scheduledDate),
        maxParticipants: parseInt(data.maxParticipants) || 10,
        currentCount: 0,
        distanceKm: data.distanceKm ? parseFloat(data.distanceKm) : null,
        totalTravelCost: data.totalTravelCost ? parseFloat(data.totalTravelCost) : null,
        perPersonTravelFee: data.perPersonTravelFee ? parseFloat(data.perPersonTravelFee) : null,
        discountPercent: parseFloat(data.discountPercent) || 0,
        description: data.description || null,
        status: data.status || 'open',
        isActive: data.isActive ?? true,
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
      },
    })

    return NextResponse.json(bundle, { status: 201 })
  } catch (error) {
    console.error('Failed to create travel bundle:', error)
    return NextResponse.json(
      { error: 'Failed to create travel bundle' },
      { status: 500 }
    )
  }
}
