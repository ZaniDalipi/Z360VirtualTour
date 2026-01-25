import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Category, Tour } from '@/lib/models'
import { getAdminFromCookies } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB()

  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const category = await Category.findById(id)

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Get tour count for this category
    const tourCount = await Tour.countDocuments({ categoryId: id })

    return NextResponse.json({
      ...category.toObject(),
      id: category._id,
      _count: { tours: tourCount },
    })
  } catch (error) {
    console.error('Failed to fetch category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB()

  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await request.json()

    // Check if slug is unique (excluding current category)
    if (data.slug) {
      const existingCategory = await Category.findOne({
        slug: data.slug,
        _id: { $ne: id },
      })

      if (existingCategory) {
        return NextResponse.json(
          { error: 'A category with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const category = await Category.findByIdAndUpdate(
      id,
      {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        icon: data.icon || null,
        order: data.order || 0,
        isActive: data.isActive ?? true,
      },
      { new: true }
    )

    return NextResponse.json({ ...category?.toObject(), id: category?._id })
  } catch (error) {
    console.error('Failed to update category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB()

  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Check if category has tours
    const tourCount = await Tour.countDocuments({ categoryId: id })

    if (tourCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with existing tours. Move or delete the tours first.' },
        { status: 400 }
      )
    }

    await Category.findByIdAndDelete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
