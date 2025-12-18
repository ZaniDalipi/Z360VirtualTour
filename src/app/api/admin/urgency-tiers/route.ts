import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const tiers = await prisma.urgencyTier.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(tiers)
  } catch (error) {
    console.error('Failed to fetch urgency tiers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch urgency tiers' },
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

    const tier = await prisma.urgencyTier.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description || null,
        minLeadDays: parseInt(data.minLeadDays) || 1,
        maxLeadDays: data.maxLeadDays ? parseInt(data.maxLeadDays) : null,
        surchargePercent: parseFloat(data.surchargePercent) || 0,
        isActive: data.isActive ?? true,
        order: parseInt(data.order) || 0,
      },
    })

    return NextResponse.json(tier, { status: 201 })
  } catch (error) {
    console.error('Failed to create urgency tier:', error)
    return NextResponse.json(
      { error: 'Failed to create urgency tier' },
      { status: 500 }
    )
  }
}
