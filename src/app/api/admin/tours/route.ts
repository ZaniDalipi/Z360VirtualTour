import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Tour } from '@/lib/models'
import { getAdminFromCookies } from '@/lib/auth'

export async function GET() {
  await connectDB()

  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const tours = await Tour.find().sort({ createdAt: -1 }).populate('categoryId')

    return NextResponse.json(
      tours.map((tour) => ({
        ...tour.toObject(),
        id: tour._id,
        category: tour.categoryId,
      }))
    )
  } catch (error) {
    console.error('Failed to fetch tours:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tours' },
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

    // Check if slug is unique
    const existingTour = await Tour.findOne({ slug: data.slug })

    if (existingTour) {
      return NextResponse.json(
        { error: 'A tour with this slug already exists' },
        { status: 400 }
      )
    }

    // Convert images array - MongoDB stores as array directly
    let images: string[] | null = null
    if (data.images) {
      if (Array.isArray(data.images)) {
        images = data.images.length > 0 ? data.images : null
      } else if (typeof data.images === 'string') {
        try {
          images = JSON.parse(data.images)
        } catch {
          images = null
        }
      }
    }

    const tour = await Tour.create({
      title: data.title,
      slug: data.slug,
      description: data.description || '',
      shortDesc: data.shortDescription || data.shortDesc || null,
      clientName: data.clientName || null,
      location: data.location || null,
      coverImage: data.coverImage,
      images: images,
      tourUrl: data.tourUrl || null,
      tourEmbed: data.tourEmbed || null,
      categoryId: data.categoryId,
      featured: data.featured || false,
      isActive: data.isActive ?? true,
    })

    const populatedTour = await Tour.findById(tour._id).populate('categoryId')

    return NextResponse.json({
      ...populatedTour?.toObject(),
      id: populatedTour?._id,
      category: populatedTour?.categoryId,
    })
  } catch (error) {
    console.error('Failed to create tour:', error)
    return NextResponse.json(
      { error: 'Failed to create tour' },
      { status: 500 }
    )
  }
}
