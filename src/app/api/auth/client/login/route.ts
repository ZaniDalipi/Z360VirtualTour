import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find client by email
    const client = await prisma.client.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if client has a password set
    if (!client.password) {
      return NextResponse.json(
        { error: 'Please set up your password first. Check your email for the setup link.' },
        { status: 401 }
      )
    }

    // Check if email is verified
    if (!client.isEmailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email address first. Check your inbox for the verification link.' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, client.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Update last login
    await prisma.client.update({
      where: { id: client.id },
      data: { lastLoginAt: new Date() },
    })

    // Generate JWT token
    const token = await new SignJWT({
      id: client.id,
      email: client.email,
      name: client.name,
      type: 'client',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('client-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({
      success: true,
      user: {
        id: client.id,
        email: client.email,
        name: client.name,
        company: client.company,
      },
    })
  } catch (error) {
    console.error('Client login error:', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}
