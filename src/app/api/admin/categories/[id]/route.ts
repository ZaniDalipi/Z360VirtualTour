import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'
import { cache } from '@/lib/cache'
import { withRetry } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const category = await withRetry(
      () => prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: { tours: true },
          },
        },
      }),
      { maxRetries: 2 }
    )

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Failed to fetch category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category. Please try again.' },
      { status: 503 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await request.json()

    // Check if slug is unique (excluding current category)
    if (data.slug) {
      const existingCategory = await withRetry(
        () => prisma.category.findFirst({
          where: {
            slug: data.slug,
            NOT: { id },
          },
        }),
        { maxRetries: 2 }
      )

      if (existingCategory) {
        return NextResponse.json(
          { error: 'A category with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const category = await withRetry(
      () => prisma.category.update({
        where: { id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          icon: data.icon || null,
          order: data.order || 0,
          isActive: data.isActive ?? true,
        },
      }),
      { maxRetries: 2 }
    )

    // Invalidate caches
    cache.invalidatePrefix('categories')

    return NextResponse.json(category)
  } catch (error) {
    console.error('Failed to update category:', error)
    return NextResponse.json(
      { error: 'Failed to update category. Please try again.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Check if category has tours
    const category = await withRetry(
      () => prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: { tours: true },
          },
        },
      }),
      { maxRetries: 2 }
    )

    if (category?._count?.tours && category._count.tours > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing tours. Move or delete the tours first.' },
        { status: 400 }
      )
    }

    await withRetry(
      () => prisma.category.delete({
        where: { id },
      }),
      { maxRetries: 2 }
    )

    // Invalidate caches
    cache.invalidatePrefix('categories')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category. Please try again.' },
      { status: 500 }
    )
  }
}
