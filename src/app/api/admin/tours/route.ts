import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'

export async function GET() {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const tours = await prisma.tour.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    })

    return NextResponse.json(tours)
  } catch (error) {
    console.error('Failed to fetch tours:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tours' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()

    // Check if slug is unique
    const existingTour = await prisma.tour.findUnique({
      where: { slug: data.slug },
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

    const tour = await prisma.tour.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || '',
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
    console.error('Failed to create tour:', error)
    return NextResponse.json(
      { error: 'Failed to create tour' },
      { status: 500 }
    )
  }
}
