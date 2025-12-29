import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// DELETE: Remove an admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentAdmin = await getAdminFromCookies()
    if (!currentAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Prevent deleting yourself
    if (id === currentAdmin.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      )
    }

    // Check if this is the last admin
    const adminCount = await prisma.admin.count()
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last admin account' },
        { status: 400 }
      )
    }

    // Delete the admin
    await prisma.admin.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete admin:', error)
    return NextResponse.json(
      { error: 'Failed to delete admin' },
      { status: 500 }
    )
  }
}

// PUT: Update an admin
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentAdmin = await getAdminFromCookies()
    if (!currentAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { name, email, password } = await request.json()

    // Build update data
    const updateData: { name?: string; email?: string; password?: string } = {}

    if (name) updateData.name = name
    if (email) {
      // Check if email is already taken by another admin
      const existingAdmin = await prisma.admin.findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' },
          NOT: { id }
        }
      })
      if (existingAdmin) {
        return NextResponse.json(
          { error: 'Email is already in use by another admin' },
          { status: 409 }
        )
      }
      updateData.email = email.toLowerCase()
    }
    if (password) {
      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters' },
          { status: 400 }
        )
      }
      updateData.password = await bcrypt.hash(password, 12)
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      admin: updatedAdmin,
    })
  } catch (error) {
    console.error('Failed to update admin:', error)
    return NextResponse.json(
      { error: 'Failed to update admin' },
      { status: 500 }
    )
  }
}
