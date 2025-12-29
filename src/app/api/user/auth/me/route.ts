import { NextResponse } from 'next/server'
import { getUserFromCookies } from '@/lib/user-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const userPayload = await getUserFromCookies()

    if (!userPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: userPayload.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        company: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      }
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
