import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken, checkRateLimit, recordLoginAttempt } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

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
    const rateLimitKey = `${clientIp}:${email.toLowerCase()}`

    // Check rate limit
    const rateLimit = checkRateLimit(rateLimitKey)
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

    // Find admin by email (case-insensitive for SQLite compatibility)
    const admin = await prisma.admin.findFirst({
      where: {
        email: email.toLowerCase()
      },
    })

    if (!admin) {
      recordLoginAttempt(rateLimitKey, false)
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          remainingAttempts: rateLimit.remainingAttempts - 1
        },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password)

    if (!isValidPassword) {
      recordLoginAttempt(rateLimitKey, false)
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          remainingAttempts: rateLimit.remainingAttempts - 1
        },
        { status: 401 }
      )
    }

    // Record successful login
    recordLoginAttempt(rateLimitKey, true)

    // Create JWT token
    const token = await signToken({
      id: admin.id,
      email: admin.email,
      name: admin.name || undefined,
    })

    // Set cookie with secure options
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // More secure than 'lax'
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
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
