import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Client } from '@/lib/models'
import bcrypt from 'bcryptjs'
import { resetPasswordSchema, validateInput, formatZodErrors, getFirstError } from '@/lib/validations'

// Verify reset token
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      )
    }

    // Find client with valid token
    const client = await Client.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    }).select('email name')

    if (!client) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      email: client.email,
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    )
  }
}

// Reset password
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    // Validate input
    const validation = validateInput(resetPasswordSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: getFirstError(validation.errors),
          errors: formatZodErrors(validation.errors),
        },
        { status: 400 }
      )
    }

    const { token, password } = validation.data

    // Find client with valid token
    const client = await Client.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update password and clear reset token
    await Client.findByIdAndUpdate(client._id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    })

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    )
  }
}
