import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('user-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify existing token
    let decoded: { userId: string; email: string; type: string }
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; type: string }
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    if (decoded.type !== 'user') {
      return NextResponse.json(
        { error: 'Invalid token type' },
        { status: 401 }
      )
    }

    // Get user to ensure they still exist and are active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        company: true,
        isActive: true,
      },
    })

    if (!user || !user.isActive) {
      // Clear the cookie if user doesn't exist or is inactive
      cookieStore.delete('user-token')
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      )
    }

    // Create new JWT token with fresh expiry
    const newToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Set new cookie with extended expiry
    cookieStore.set('user-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        company: user.company,
      },
      refreshed: true,
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    )
  }
}
