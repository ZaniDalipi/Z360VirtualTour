import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Category, Tour } from '@/lib/models'

export async function GET() {
  try {
    await connectDB()

    const categories = await Category.find({ isActive: true }).sort({ order: 1 })

    // Get tour counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const tourCount = await Tour.countDocuments({
          categoryId: cat._id,
          isActive: true,
        })
        return {
          id: cat._id.toString(),
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          icon: cat.icon,
          order: cat.order,
          isActive: cat.isActive,
          tourCount,
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt,
        }
      })
    )

    return NextResponse.json(categoriesWithCounts)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
