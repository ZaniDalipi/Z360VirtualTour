import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cache, CacheKeys, CacheTTL } from '@/lib/cache'
import { withRetry, withFallback } from '@/lib/db'

interface Testimonial {
  id: string
  clientName: string
  clientTitle: string | null
  clientImage: string | null
  content: string
  rating: number
  tourId: string | null
  featured: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export async function GET() {
  try {
    // Try cache first
    const cached = cache.get<Testimonial[]>(CacheKeys.TESTIMONIALS)
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache-Status': 'hit' }
      })
    }

    const testimonials = await withFallback<Testimonial[]>(
      () => withRetry(
        () => prisma.testimonial.findMany({
          where: { isActive: true },
          orderBy: [
            { featured: 'desc' },
            { createdAt: 'desc' },
          ],
          take: 6,
        }),
        { maxRetries: 2 }
      ),
      []
    )

    // Cache for longer since testimonials rarely change
    cache.set(CacheKeys.TESTIMONIALS, testimonials, CacheTTL.LONG)

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('Failed to fetch testimonials:', error)
    return NextResponse.json([])
  }
}

// Public testimonial submission - requires admin approval
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Basic validation
    if (!data.clientName || !data.content) {
      return NextResponse.json(
        { error: 'Name and testimonial content are required' },
        { status: 400 }
      )
    }

    // Rate limiting check - max 3 testimonials per email per day
    if (data.email) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const recentSubmissions = await withRetry<number>(
        () => prisma.testimonial.count({
          where: {
            clientTitle: { contains: data.email },
            createdAt: { gte: oneDayAgo },
          },
        }),
        { maxRetries: 2 }
      )

      if (recentSubmissions >= 3) {
        return NextResponse.json(
          { error: 'Too many submissions. Please try again later.' },
          { status: 429 }
        )
      }
    }

    // Create testimonial with isActive: false (requires admin approval)
    const testimonial = await withRetry<Testimonial>(
      () => prisma.testimonial.create({
        data: {
          clientName: data.clientName,
          clientTitle: data.clientTitle || (data.email ? `Email: ${data.email}` : null),
          content: data.content,
          rating: Math.min(5, Math.max(1, data.rating || 5)),
          featured: false,
          isActive: false, // Requires admin approval
        },
      }),
      { maxRetries: 2 }
    )

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your testimonial has been submitted and is pending approval.',
      id: testimonial.id,
    })
  } catch (error) {
    console.error('Failed to submit testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to submit testimonial. Please try again.' },
      { status: 500 }
    )
  }
}
