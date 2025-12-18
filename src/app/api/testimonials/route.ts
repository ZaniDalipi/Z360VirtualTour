import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 6,
    })

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
      const recentSubmissions = await prisma.testimonial.count({
        where: {
          clientTitle: { contains: data.email },
          createdAt: { gte: oneDayAgo },
        },
      })

      if (recentSubmissions >= 3) {
        return NextResponse.json(
          { error: 'Too many submissions. Please try again later.' },
          { status: 429 }
        )
      }
    }

    // Create testimonial with isActive: false (requires admin approval)
    const testimonial = await prisma.testimonial.create({
      data: {
        clientName: data.clientName,
        clientTitle: data.clientTitle || (data.email ? `Email: ${data.email}` : null),
        content: data.content,
        rating: Math.min(5, Math.max(1, data.rating || 5)),
        featured: false,
        isActive: false, // Requires admin approval
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your testimonial has been submitted and is pending approval.',
      id: testimonial.id,
    })
  } catch (error) {
    console.error('Failed to submit testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to submit testimonial' },
      { status: 500 }
    )
  }
}
