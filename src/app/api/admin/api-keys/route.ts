import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateApiKey, hashApiKey } from '@/lib/api-auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/api-keys
 * List all API keys (admin only)
 */
export async function GET() {
  const admin = await getAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const apiKeys = await prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        appName: true,
        appUrl: true,
        permissions: true,
        rateLimit: true,
        isActive: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
        _count: {
          select: {
            webhooks: true,
            apiLogs: true,
          },
        },
      },
    })

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 })
  }
}

/**
 * POST /api/admin/api-keys
 * Create a new API key (admin only)
 */
export async function POST(request: NextRequest) {
  const admin = await getAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.appName) {
      return NextResponse.json(
        { error: 'Name and appName are required' },
        { status: 400 }
      )
    }

    // Generate new API key
    const { key, prefix, hash } = generateApiKey()

    // Parse permissions
    const permissions = body.permissions || ['read']
    const permissionsJson = Array.isArray(permissions)
      ? JSON.stringify(permissions)
      : permissions

    // Create the API key record
    const apiKey = await prisma.apiKey.create({
      data: {
        name: body.name,
        key: hash,
        keyPrefix: prefix,
        appName: body.appName,
        appUrl: body.appUrl || null,
        permissions: permissionsJson,
        rateLimit: body.rateLimit || 1000,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        appName: true,
        appUrl: true,
        permissions: true,
        rateLimit: true,
        isActive: true,
        createdAt: true,
      },
    })

    // Return the plain text key (only shown once!)
    return NextResponse.json({
      apiKey: {
        ...apiKey,
        key, // The actual key - only shown on creation!
      },
      warning: 'Save this API key securely. It will not be shown again.',
    })
  } catch (error) {
    console.error('Error creating API key:', error)
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
  }
}
