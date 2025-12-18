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
    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    })

    if (!testimonial) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
    }

    return NextResponse.json(testimonial)
  } catch (error) {
    console.error('Failed to fetch testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonial' },
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

    const testimonial = await prisma.testimonial.update({
      where: { id },
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

    return NextResponse.json(testimonial)
  } catch (error) {
    console.error('Failed to update testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to update testimonial' },
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
    await prisma.testimonial.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to delete testimonial' },
      { status: 500 }
    )
  }
}
