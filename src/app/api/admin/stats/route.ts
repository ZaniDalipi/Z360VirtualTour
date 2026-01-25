import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { Tour, Testimonial, ContactSubmission } from '@/lib/models'
import { getAdminFromCookies } from '@/lib/auth'

export async function GET() {
  await connectDB()

  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [
      totalTours,
      totalTestimonials,
      unreadMessages,
      tours,
    ] = await Promise.all([
      Tour.countDocuments(),
      Testimonial.countDocuments(),
      ContactSubmission.countDocuments({ isRead: false }),
      Tour.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('categoryId'),
    ])

    const totalViews = tours.reduce((sum, tour) => sum + (tour.views || 0), 0)

    return NextResponse.json({
      totalTours,
      totalViews,
      totalTestimonials,
      unreadMessages,
      recentTours: tours.map((tour) => {
        const category = tour.categoryId as { name?: string } | null
        return {
          id: tour._id,
          title: tour.title,
          views: tour.views,
          category: category?.name || 'Uncategorized',
        }
      }),
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
