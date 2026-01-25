import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Client } from '@/lib/models'
import bcrypt from 'bcryptjs'
import { registerSchema, validateInput, formatZodErrors, getFirstError } from '@/lib/validations'
import { generateToken, sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    // Validate input
    const validation = validateInput(registerSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: getFirstError(validation.errors),
          errors: formatZodErrors(validation.errors),
        },
        { status: 400 }
      )
    }

    const { name, email, password, phone, company } = validation.data

    // Check if client already exists
    const existingClient = await Client.findOne({ email: email.toLowerCase() })

    if (existingClient) {
      if (existingClient.isEmailVerified) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        )
      }

      // If not verified, update the existing record and resend verification
      const verifyToken = generateToken(32)
      const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      const hashedPassword = await bcrypt.hash(password, 12)

      await Client.findByIdAndUpdate(existingClient._id, {
        name,
        password: hashedPassword,
        phone,
        company,
        emailVerifyToken: verifyToken,
        emailVerifyExpires: verifyExpires,
      })

      // Send verification email
      await sendVerificationEmail(email, name, verifyToken)

      return NextResponse.json({
        success: true,
        message: 'Please check your email to verify your account',
        requiresVerification: true,
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Generate verification token
    const verifyToken = generateToken(32)
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create new client
    await Client.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      phone,
      company,
      emailVerifyToken: verifyToken,
      emailVerifyExpires: verifyExpires,
      isEmailVerified: false,
    })

    // Send verification email
    await sendVerificationEmail(email, name, verifyToken)

    return NextResponse.json(
      {
        success: true,
        message: 'Account created! Please check your email to verify your account.',
        requiresVerification: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
