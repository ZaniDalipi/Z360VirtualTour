import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}

// GET /api/public/categories - List all categories with tour counts
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: {
            tours: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    const publicCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      tourCount: category._count.tours,
    }))

    return NextResponse.json({
      categories: publicCategories,
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500, headers: corsHeaders }
    )
  }
}
