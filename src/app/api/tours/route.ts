import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Tour, Category } from '@/lib/models'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')

    // Build query
    const query: Record<string, unknown> = { isActive: true }

    if (category) {
      const cat = await Category.findOne({ slug: category })
      if (cat) {
        query.categoryId = cat._id
      }
    }

    if (featured === 'true') {
      query.featured = true
    }

    // Find tours
    let toursQuery = Tour.find(query)
      .populate('categoryId', 'name slug icon')
      .sort({ createdAt: -1 })

    if (limit) {
      toursQuery = toursQuery.limit(parseInt(limit))
    }

    const tours = await toursQuery.exec()

    // Transform the data to match expected format
    const transformedTours = tours.map((tour) => {
      const cat = tour.categoryId as unknown as { _id: { toString: () => string }; name: string; slug: string; icon?: string } | null
      return {
        id: tour._id.toString(),
        title: tour.title,
        slug: tour.slug,
        description: tour.description,
        shortDesc: tour.shortDesc,
        clientName: tour.clientName,
        location: tour.location,
        coverImage: tour.coverImage,
        images: tour.images,
        tourUrl: tour.tourUrl,
        tourEmbed: tour.tourEmbed,
        categoryId: cat?._id?.toString(),
        category: cat ? {
          id: cat._id.toString(),
          name: cat.name,
          slug: cat.slug,
        } : null,
        featured: tour.featured,
        isActive: tour.isActive,
        views: tour.views,
        completedAt: tour.completedAt,
        createdAt: tour.createdAt,
        updatedAt: tour.updatedAt,
      }
    })

    return NextResponse.json(transformedTours)
  } catch (error) {
    console.error('Failed to fetch tours:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tours' },
      { status: 500 }
    )
  }
}
