import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

interface GooglePayload {
  sub: string       // Google user ID
  email: string
  email_verified: boolean
  name: string
  picture?: string
  given_name?: string
  family_name?: string
}

async function verifyGoogleToken(credential: string): Promise<GooglePayload | null> {
  try {
    // Decode and verify the Google ID token
    // Split the JWT and decode the payload
    const parts = credential.split('.')
    if (parts.length !== 3) return null

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8')
    ) as GooglePayload & { iss: string; aud: string; exp: number }

    // Verify issuer
    if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') {
      return null
    }

    // Verify audience matches our client ID
    if (GOOGLE_CLIENT_ID && payload.aud !== GOOGLE_CLIENT_ID) {
      return null
    }

    // Verify token hasn't expired
    if (payload.exp * 1000 < Date.now()) {
      return null
    }

    return {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified,
      name: payload.name,
      picture: payload.picture,
      given_name: payload.given_name,
      family_name: payload.family_name,
    }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()

    if (!credential) {
      return NextResponse.json(
        { error: 'Google credential is required' },
        { status: 400 }
      )
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(credential)

    if (!googleUser) {
      return NextResponse.json(
        { error: 'Invalid Google credential' },
        { status: 401 }
      )
    }

    // Check if user already exists by Google ID or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.sub },
          { email: googleUser.email },
        ],
      },
    })

    if (user) {
      // Update Google ID if user exists by email but hasn't linked Google yet
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.sub,
            authProvider: 'google',
            emailVerified: true,
            avatar: user.avatar || googleUser.picture || null,
          },
        })
      }

      // Check if user is active
      if (!user.isActive) {
        return NextResponse.json(
          { error: 'Your account has been deactivated' },
          { status: 401 }
        )
      }
    } else {
      // Create new user from Google account
      // Generate a random password since Google users won't use password login
      const randomPassword = crypto.randomBytes(32).toString('hex')
      const hashedPassword = await bcrypt.hash(randomPassword, 10)

      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          password: hashedPassword,
          name: googleUser.name,
          googleId: googleUser.sub,
          authProvider: 'google',
          emailVerified: true,
          avatar: googleUser.picture || null,
        },
      })
    }

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
      },
    })
  } catch (error) {
    console.error('Google login error:', error)
    return NextResponse.json(
      { error: 'Failed to login with Google' },
      { status: 500 }
    )
  }
}
