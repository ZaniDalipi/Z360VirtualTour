import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Client } from '@/lib/models'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Find client with this token
    const client = await Client.findOne({
      emailVerifyToken: token,
      emailVerifyExpires: { $gt: new Date() },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Update client as verified
    await Client.findByIdAndUpdate(client._id, {
      isEmailVerified: true,
      emailVerifyToken: null,
      emailVerifyExpires: null,
    })

    // Send welcome email
    await sendWelcomeEmail(client.email, client.name)

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify email. Please try again.' },
      { status: 500 }
    )
  }
}

// Resend verification email
export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const client = await Client.findOne({ email: email.toLowerCase() })

    if (!client) {
      // Don't reveal if email exists
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a verification email has been sent.',
      })
    }

    if (client.isEmailVerified) {
      return NextResponse.json(
        { error: 'This email is already verified' },
        { status: 400 }
      )
    }

    // Generate new token
    const { generateToken, sendVerificationEmail } = await import('@/lib/email')
    const verifyToken = generateToken(32)
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await Client.findByIdAndUpdate(client._id, {
      emailVerifyToken: verifyToken,
      emailVerifyExpires: verifyExpires,
    })

    await sendVerificationEmail(client.email, client.name, verifyToken)

    return NextResponse.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
    })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification email. Please try again.' },
      { status: 500 }
    )
  }
}
