import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromCookies } from '@/lib/auth'

export async function GET() {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('Failed to fetch testimonials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
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

    const testimonial = await prisma.testimonial.create({
      data: {
        clientName: data.clientName,
        clientTitle: data.clientTitle || null,
        clientImage: data.clientImage || null,
        content: data.content,
        rating: data.rating || 5,
        tourId: data.tourId || null,
        featured: data.featured || false,
        isActive: data.isActive ?? true,
      },
    })

    return NextResponse.json(testimonial, { status: 201 })
  } catch (error) {
    console.error('Failed to create testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to create testimonial' },
      { status: 500 }
    )
  }
}
