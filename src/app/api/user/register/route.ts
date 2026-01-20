import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone, company } = await request.json()

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate email verification token
    const verifyToken = crypto.randomBytes(32).toString('hex')
    const verifyTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        company: company || null,
        emailVerified: false,
        verifyToken,
        verifyTokenExpiry,
      },
    })

    // In production, send verification email here
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/en/account/verify-email?token=${verifyToken}`
    console.log('Email verification link:', verifyUrl)

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, type: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('user-token', token, {
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
        emailVerified: user.emailVerified,
      },
      message: 'Account created. Please check your email to verify your account.',
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}
