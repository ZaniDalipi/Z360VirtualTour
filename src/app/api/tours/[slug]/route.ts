import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Tour } from '@/lib/models'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB()

    const { slug } = await params

    const tour = await Tour.findOne({ slug }).populate('categoryId', 'name slug')

    if (!tour || !tour.isActive) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
    }

    // Increment view count
    await Tour.findByIdAndUpdate(tour._id, { views: tour.views + 1 })

    const category = tour.categoryId as { _id: unknown; name?: string; slug?: string } | null

    return NextResponse.json({
      ...tour.toObject(),
      id: tour._id,
      category: category
        ? {
            id: category._id,
            name: category.name,
            slug: category.slug,
          }
        : null,
    })
  } catch (error) {
    console.error('Failed to fetch tour:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tour' },
      { status: 500 }
    )
  }
}
