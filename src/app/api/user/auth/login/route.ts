import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signUserToken, checkUserRateLimit, recordUserLoginAttempt } from '@/lib/user-auth'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') ||
                     'unknown'
    const rateLimitKey = `user:${clientIp}:${email.toLowerCase()}`

    // Check rate limit
    const rateLimit = checkUserRateLimit(rateLimitKey)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please try again in ${rateLimit.lockoutRemaining} minutes.`,
          lockout: true,
          lockoutRemaining: rateLimit.lockoutRemaining
        },
        { status: 429 }
      )
    }

    // Find user by email (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'
        },
        isActive: true
      },
    })

    if (!user) {
      recordUserLoginAttempt(rateLimitKey, false)
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          remainingAttempts: rateLimit.remainingAttempts - 1
        },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      recordUserLoginAttempt(rateLimitKey, false)
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          remainingAttempts: rateLimit.remainingAttempts - 1
        },
        { status: 401 }
      )
    }

    // Record successful login
    recordUserLoginAttempt(rateLimitKey, true)

    // Create JWT token
    const token = await signUserToken({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone || undefined,
      company: user.company || undefined,
      avatar: user.avatar || undefined,
    })

    // Set cookie with secure options
    const cookieStore = await cookies()
    cookieStore.set('user-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        company: user.company,
        avatar: user.avatar,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
