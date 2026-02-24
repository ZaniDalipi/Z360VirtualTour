import { NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await getAdminFromCookies()

  if (!admin) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  return NextResponse.json(admin)
}
