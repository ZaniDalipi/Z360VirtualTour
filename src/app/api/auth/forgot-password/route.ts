import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { forgotPasswordSchema, validateInput, getFirstError } from '@/lib/validations'
import { generateToken, sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateInput(forgotPasswordSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: getFirstError(validation.errors) },
        { status: 400 }
      )
    }

    const { email } = validation.data

    // Find client by email
    const client = await prisma.client.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Always return success to prevent email enumeration
    if (!client) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.',
      })
    }

    // Generate reset token
    const resetToken = generateToken(32)
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Save token
    await prisma.client.update({
      where: { id: client.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    })

    // Send reset email
    await sendPasswordResetEmail(client.email, client.name, resetToken)

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    )
  }
}
