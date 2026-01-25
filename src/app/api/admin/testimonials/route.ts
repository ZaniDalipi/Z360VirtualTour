import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Testimonial } from '@/lib/models'
import { getAdminFromCookies } from '@/lib/auth'

export async function GET() {
  await connectDB()

  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 })

    return NextResponse.json(
      testimonials.map((t) => ({ ...t.toObject(), id: t._id }))
    )
  } catch (error) {
    console.error('Failed to fetch testimonials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
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

    const testimonial = await Testimonial.create({
      clientName: data.clientName,
      clientTitle: data.clientTitle || null,
      clientImage: data.clientImage || null,
      content: data.content,
      rating: data.rating || 5,
      tourId: data.tourId || null,
      featured: data.featured || false,
      isActive: data.isActive ?? true,
    })

    return NextResponse.json({ ...testimonial.toObject(), id: testimonial._id }, { status: 201 })
  } catch (error) {
    console.error('Failed to create testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      { status: 500 }
    )
  }
}
