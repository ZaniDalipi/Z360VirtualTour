import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'

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
    const tour = await prisma.tour.findUnique({
      where: { id },
      include: { category: true },
    })

    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
    }

    return NextResponse.json(tour)
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
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await request.json()

    // Check if slug is unique (excluding current tour)
    const existingTour = await prisma.tour.findFirst({
      where: {
        slug: data.slug,
        NOT: { id },
      },
    })

    if (existingTour) {
      return NextResponse.json(
        { error: 'A tour with this slug already exists' },
        { status: 400 }
      )
    }

    // Convert images array to JSON string if it's an array
    let imagesJson = null
    if (data.images) {
      if (Array.isArray(data.images)) {
        imagesJson = data.images.length > 0 ? JSON.stringify(data.images) : null
      } else if (typeof data.images === 'string') {
        imagesJson = data.images
      }
    }

    const tour = await prisma.tour.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        shortDesc: data.shortDescription || data.shortDesc || null,
        clientName: data.clientName || null,
        location: data.location || null,
        coverImage: data.coverImage,
        images: imagesJson,
        tourUrl: data.tourUrl || null,
        tourEmbed: data.tourEmbed || null,
        categoryId: data.categoryId,
        featured: data.featured || false,
        isActive: data.isActive ?? true,
      },
      include: { category: true },
    })

    return NextResponse.json(tour)
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
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.tour.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete tour:', error)
    return NextResponse.json(
      { error: 'Failed to delete tour' },
      { status: 500 }
    )
  }
}
