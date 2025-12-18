import { NextResponse } from 'next/server'
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
