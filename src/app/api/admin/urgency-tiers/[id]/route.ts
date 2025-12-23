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
    const tier = await prisma.urgencyTier.findUnique({ where: { id } })

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

    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.displayName !== undefined) updateData.displayName = data.displayName
    if (data.description !== undefined) updateData.description = data.description
    if (data.minLeadDays !== undefined) updateData.minLeadDays = parseInt(data.minLeadDays)
    if (data.maxLeadDays !== undefined) updateData.maxLeadDays = data.maxLeadDays ? parseInt(data.maxLeadDays) : null
    if (data.surchargePercent !== undefined) updateData.surchargePercent = parseFloat(data.surchargePercent)
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.order !== undefined) updateData.order = parseInt(data.order)

    const tier = await prisma.urgencyTier.update({
      where: { id },
      data: updateData,
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
    await prisma.urgencyTier.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete urgency tier:', error)
    return NextResponse.json(
      { error: 'Failed to delete urgency tier' },
      { status: 500 }
    )
  }
}
