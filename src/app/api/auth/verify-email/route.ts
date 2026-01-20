import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Verify email token
export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find user by verification token
    const user = await prisma.user.findFirst({
      where: {
        verifyToken: token,
        verifyTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Mark email as verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verifyToken: null,
        verifyTokenExpiry: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}

// Resend verification email
export async function PUT(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({ success: true })
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Generate new verification token
    const verifyToken = crypto.randomBytes(32).toString('hex')
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifyToken,
        verifyTokenExpiry,
      },
    })

    // In production, send verification email here
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/en/account/verify-email?token=${verifyToken}`
    console.log('Resent email verification link:', verifyUrl)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    )
  }
}
