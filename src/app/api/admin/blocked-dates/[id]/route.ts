import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function getAdmin() {
  const { cookies } = await import('next/headers')
  const { verifyToken } = await import('@/lib/auth')

  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const admin = await getAdmin()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = context.params
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
