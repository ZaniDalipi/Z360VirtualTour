import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { tours: { where: { isActive: true } } },
        },
      },
    })

    return NextResponse.json(
      categories.map((cat) => ({
        ...cat,
        tourCount: cat._count.tours,
        _count: undefined,
      }))
    )
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
