import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Tour, Category } from '@/lib/models'

export async function GET() {
  try {
    await connectDB()

    // Get total tours count
    const totalTours = await Tour.countDocuments({ isActive: true })

    // Get total categories count
    const totalCategories = await Category.countDocuments({ isActive: true })

    // Get total views using aggregation
    const viewsResult = await Tour.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } },
    ])
    const totalViews = viewsResult[0]?.totalViews || 0

    return NextResponse.json({
      totalTours,
      totalCategories,
      totalViews,
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { totalTours: 0, totalCategories: 0, totalViews: 0 },
      { status: 200 }
    )
  }
}
