import { NextRequest, NextResponse } from 'next/server'
import { getUserFromCookies, signUserToken } from '@/lib/user-auth'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// GET: Get user profile
export async function GET() {
  try {
    const userPayload = await getUserFromCookies()

    if (!userPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        company: true,
        avatar: true,
        createdAt: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT: Update user profile
export async function PUT(request: NextRequest) {
  try {
    const userPayload = await getUserFromCookies()

    if (!userPayload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { name, phone, company, avatar, currentPassword, newPassword } = data

    // Build update object
    const updateData: {
      name?: string
      phone?: string | null
      company?: string | null
      avatar?: string | null
      password?: string
    } = {}

    if (name) updateData.name = name
    if (phone !== undefined) updateData.phone = phone || null
    if (company !== undefined) updateData.company = company || null
    if (avatar !== undefined) updateData.avatar = avatar || null

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to change password' },
          { status: 400 }
        )
      }

      // Verify current password
      const user = await prisma.user.findUnique({
        where: { id: userPayload.id }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters long' },
          { status: 400 }
        )
      }

      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userPayload.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        company: true,
        avatar: true,
      }
    })

    // Refresh token with updated info
    const token = await signUserToken({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      phone: updatedUser.phone || undefined,
      company: updatedUser.company || undefined,
      avatar: updatedUser.avatar || undefined,
    })

    const cookieStore = await cookies()
    cookieStore.set('user-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error('Failed to update profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
