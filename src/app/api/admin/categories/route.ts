import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Category, Tour } from '@/lib/models'
import { getAdminFromCookies } from '@/lib/auth'

export async function GET() {
  await connectDB()

  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const categories = await Category.find().sort({ order: 1 })

    // Get tour counts for all categories
    const tourCounts = await Tour.aggregate([
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ])
    const tourCountMap = tourCounts.reduce(
      (acc, item) => ({ ...acc, [item._id.toString()]: item.count }),
      {} as Record<string, number>
    )

    return NextResponse.json(
      categories.map((cat) => ({
        ...cat.toObject(),
        id: cat._id,
        _count: { tours: tourCountMap[cat._id.toString()] || 0 },
      }))
    )
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  await connectDB()

  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    const category = await Category.create({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      icon: data.icon || null,
      order: data.order || 0,
      isActive: data.isActive ?? true,
    })

    return NextResponse.json({ ...category.toObject(), id: category._id })
  } catch (error) {
    console.error('Failed to create category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
