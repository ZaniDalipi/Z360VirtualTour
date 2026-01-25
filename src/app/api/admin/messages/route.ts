import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { ContactSubmission } from '@/lib/models'
import { getAdminFromCookies } from '@/lib/auth'

export async function GET() {
  await connectDB()

  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const messages = await ContactSubmission.find().sort({ createdAt: -1 })

    return NextResponse.json(
      messages.map((msg) => ({ ...msg.toObject(), id: msg._id }))
    )
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
