import { NextResponse } from 'next/server'
import { getUserFromCookies } from '@/lib/user-auth'
import { findUserById } from '@/lib/user-db'

export const dynamic = 'force-dynamic'

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
    const user = await findUserById(userPayload.id)

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        company: user.company,
        avatar: user.avatar,
        isActive: user.isActive,
        createdAt: user.createdAt,
      }
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
