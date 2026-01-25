import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Testimonial } from '@/lib/models'

export async function GET() {
  try {
    await connectDB()

    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ featured: -1, createdAt: -1 })
      .limit(6)

    return NextResponse.json(
      testimonials.map((t) => ({ ...t.toObject(), id: t._id }))
    )
  } catch (error) {
    console.error('Failed to fetch testimonials:', error)
    return NextResponse.json([])
  }
}

// Public testimonial submission - requires admin approval
export async function POST(request: NextRequest) {
  try {
    await connectDB()

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
      const recentSubmissions = await Testimonial.countDocuments({
        clientTitle: { $regex: data.email, $options: 'i' },
        createdAt: { $gte: oneDayAgo },
      })

      if (recentSubmissions >= 3) {
        return NextResponse.json(
          { error: 'Too many submissions. Please try again later.' },
          { status: 429 }
        )
      }
    }

    // Create testimonial with isActive: false (requires admin approval)
    const testimonial = await Testimonial.create({
      clientName: data.clientName,
      clientTitle: data.clientTitle || (data.email ? `Email: ${data.email}` : null),
      content: data.content,
      rating: Math.min(5, Math.max(1, data.rating || 5)),
      featured: false,
      isActive: false, // Requires admin approval
    })

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your testimonial has been submitted and is pending approval.',
      id: testimonial._id,
    })
  } catch (error) {
    console.error('Failed to submit testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to submit testimonial' },
      { status: 500 }
    )
  }
}
