import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { urgencyTiers } from '@/lib/booking-db'

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
    const tier = urgencyTiers.findUnique(id)

    if (!tier) {
      return NextResponse.json({ error: 'Tier not found' }, { status: 404 })
    }

    return NextResponse.json(tier)
  } catch (error) {
    console.error('Failed to fetch urgency tier:', error)
    return NextResponse.json(
      { error: 'Failed to fetch urgency tier' },
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

    const tier = urgencyTiers.update(id, {
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      minLeadDays: data.minLeadDays !== undefined ? parseInt(data.minLeadDays) : undefined,
      maxLeadDays: data.maxLeadDays !== undefined ? (data.maxLeadDays ? parseInt(data.maxLeadDays) : null) : undefined,
      surchargePercent: data.surchargePercent !== undefined ? parseFloat(data.surchargePercent) : undefined,
      isActive: data.isActive,
      order: data.order !== undefined ? parseInt(data.order) : undefined,
    })

    return NextResponse.json(tier)
  } catch (error) {
    console.error('Failed to update urgency tier:', error)
    return NextResponse.json(
      { error: 'Failed to update urgency tier' },
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
    urgencyTiers.delete(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete urgency tier:', error)
    return NextResponse.json(
      { error: 'Failed to delete urgency tier' },
      { status: 500 }
    )
  }
}
