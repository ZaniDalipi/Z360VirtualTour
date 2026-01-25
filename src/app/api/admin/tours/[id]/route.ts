import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Tour } from '@/lib/models'
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
    const tour = await Tour.findById(id).populate('categoryId')

    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...tour.toObject(),
      id: tour._id,
      category: tour.categoryId,
    })
  } catch (error) {
    console.error('Failed to fetch tour:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tour' },
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

    // Check if slug is unique (excluding current tour)
    const existingTour = await Tour.findOne({
      slug: data.slug,
      _id: { $ne: id },
    })

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

    const tour = await Tour.findByIdAndUpdate(
      id,
      {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
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
      },
      { new: true }
    ).populate('categoryId')

    return NextResponse.json({
      ...tour?.toObject(),
      id: tour?._id,
      category: tour?.categoryId,
    })
  } catch (error) {
    console.error('Failed to update tour:', error)
    return NextResponse.json(
      { error: 'Failed to update tour' },
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
    await Tour.findByIdAndDelete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete tour:', error)
    return NextResponse.json(
      { error: 'Failed to delete tour' },
      { status: 500 }
    )
  }
}
