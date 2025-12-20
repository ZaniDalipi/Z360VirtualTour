import { NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/admin/bundles/sync - Sync all bundle participant counts
export async function POST() {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get all active bundles
    const bundles = await prisma.travelBundle.findMany({
      where: { isActive: true },
      select: { id: true, currentCount: true },
    })

    const updates: { bundleId: string; oldCount: number; newCount: number }[] = []

    // For each bundle, count confirmed bookings
    for (const bundle of bundles) {
      const confirmedCount = await prisma.booking.count({
        where: {
          travelBundleId: bundle.id,
          status: { in: ['confirmed', 'scheduled', 'in_progress', 'completed'] },
        },
      })

      // Update if counts don't match
      if (confirmedCount !== bundle.currentCount) {
        await prisma.travelBundle.update({
          where: { id: bundle.id },
          data: { currentCount: confirmedCount },
        })

        updates.push({
          bundleId: bundle.id,
          oldCount: bundle.currentCount,
          newCount: confirmedCount,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${updates.length} bundles`,
      updates,
    })
  } catch (error) {
    console.error('Failed to sync bundles:', error)
    return NextResponse.json(
      { error: 'Failed to sync bundle counts' },
      { status: 500 }
    )
  }
}
