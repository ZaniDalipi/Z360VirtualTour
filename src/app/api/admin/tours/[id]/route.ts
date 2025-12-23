import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'
import { cache } from '@/lib/cache'
import { withRetry } from '@/lib/db'
import { deleteImage } from '@/lib/cloudinary'

export const dynamic = 'force-dynamic'

// Type for tour with images
interface TourData {
  id: string
  title: string
  slug: string
  description: string
  shortDesc: string | null
  clientName: string | null
  location: string | null
  coverImage: string
  images: string | null
  tourUrl: string | null
  tourEmbed: string | null
  categoryId: string
  featured: boolean
  isActive: boolean
  views: number
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
  category?: {
    id: string
    name: string
    slug: string
  }
}

// Helper to extract Cloudinary public ID from URL
function extractPublicId(url: string): string | null {
  if (!url || !url.includes('cloudinary.com')) return null
  // URL format: https://res.cloudinary.com/cloud-name/image/upload/v123/folder/filename.ext
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/)
  return match ? match[1] : null
}

// Helper to parse images from JSON string or array
function parseImages(images: string | string[] | null): string[] {
  if (!images) return []
  if (Array.isArray(images)) return images
  try {
    const parsed = JSON.parse(images)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

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
    const tour = await withRetry(
      () => prisma.tour.findUnique({
        where: { id },
        include: { category: true },
      }),
      { maxRetries: 2 }
    ) as TourData | null

    if (!tour) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
    }

    // Parse images JSON to array for frontend
    const tourWithParsedImages = {
      ...tour,
      images: parseImages(tour.images),
    }

    return NextResponse.json(tourWithParsedImages)
  } catch (error) {
    console.error('Failed to fetch tour:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tour. Please try again.' },
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

    // Get current tour to compare images
    const currentTour = await withRetry(
      () => prisma.tour.findUnique({
        where: { id },
        select: { coverImage: true, images: true },
      }),
      { maxRetries: 2 }
    ) as { coverImage: string; images: string | null } | null

    // Check if slug is unique (excluding current tour)
    const existingTour = await withRetry(
      () => prisma.tour.findFirst({
        where: {
          slug: data.slug,
          NOT: { id },
        },
      }),
      { maxRetries: 2 }
    )

    if (existingTour) {
      return NextResponse.json(
        { error: 'A tour with this slug already exists' },
        { status: 400 }
      )
    }

    // Convert images array to JSON string if it's an array
    const newImages = Array.isArray(data.images) ? data.images : []
    const imagesJson = newImages.length > 0 ? JSON.stringify(newImages) : null

    // Clean up removed images from Cloudinary (async, don't block response)
    if (currentTour) {
      const oldImages = parseImages(currentTour.images)
      const removedImages = oldImages.filter((img: string) => !newImages.includes(img))

      // Delete removed gallery images
      removedImages.forEach(async (imgUrl: string) => {
        const publicId = extractPublicId(imgUrl)
        if (publicId) {
          try {
            await deleteImage(publicId)
          } catch (err) {
            console.error('Failed to delete image from Cloudinary:', err)
          }
        }
      })

      // If cover image changed, delete old one
      if (currentTour.coverImage && currentTour.coverImage !== data.coverImage) {
        const oldCoverPublicId = extractPublicId(currentTour.coverImage)
        if (oldCoverPublicId) {
          try {
            await deleteImage(oldCoverPublicId)
          } catch (err) {
            console.error('Failed to delete old cover image:', err)
          }
        }
      }
    }

    const tour = await withRetry(
      () => prisma.tour.update({
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
      }),
      { maxRetries: 2 }
    ) as TourData

    // Invalidate caches
    cache.invalidatePrefix('tours')
    cache.invalidatePrefix('admin:tours')
    cache.invalidatePrefix('stats')

    // Return with parsed images
    return NextResponse.json({
      ...tour,
      images: parseImages(tour.images),
    })
  } catch (error) {
    console.error('Failed to update tour:', error)
    return NextResponse.json(
      { error: 'Failed to update tour. Please try again.' },
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

    // Get tour to clean up images
    const tour = await withRetry(
      () => prisma.tour.findUnique({
        where: { id },
        select: { coverImage: true, images: true },
      }),
      { maxRetries: 2 }
    ) as { coverImage: string; images: string | null } | null

    // Delete tour from database
    await withRetry(
      () => prisma.tour.delete({
        where: { id },
      }),
      { maxRetries: 2 }
    )

    // Clean up images from Cloudinary (async, don't block response)
    if (tour) {
      // Delete cover image
      if (tour.coverImage) {
        const coverPublicId = extractPublicId(tour.coverImage)
        if (coverPublicId) {
          deleteImage(coverPublicId).catch(err =>
            console.error('Failed to delete cover image:', err)
          )
        }
      }

      // Delete gallery images
      const galleryImages = parseImages(tour.images)
      galleryImages.forEach((imgUrl: string) => {
        const publicId = extractPublicId(imgUrl)
        if (publicId) {
          deleteImage(publicId).catch(err =>
            console.error('Failed to delete gallery image:', err)
          )
        }
      })
    }

    // Invalidate caches
    cache.invalidatePrefix('tours')
    cache.invalidatePrefix('admin:tours')
    cache.invalidatePrefix('stats')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete tour:', error)
    return NextResponse.json(
      { error: 'Failed to delete tour. Please try again.' },
      { status: 500 }
    )
  }
}
