import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering since we use cookies
export const dynamic = 'force-dynamic'

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
    await prisma.blockedDate.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete blocked date:', error)
    return NextResponse.json(
      { error: 'Failed to delete blocked date' },
      { status: 500 }
    )
  }
}
