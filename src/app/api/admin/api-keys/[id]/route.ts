import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromCookies } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/api-keys/:id
 * Get API key details with usage stats
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const admin = await getAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: { id },
      include: {
        webhooks: {
          select: {
            id: true,
            url: true,
            events: true,
            isActive: true,
            lastTriggered: true,
            lastStatus: true,
            failureCount: true,
          },
        },
        _count: {
          select: {
            apiLogs: true,
          },
        },
      },
    })

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 })
    }

    // Get recent logs
    const recentLogs = await prisma.apiLog.findMany({
      where: { apiKeyId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        method: true,
        endpoint: true,
        statusCode: true,
        responseTime: true,
        createdAt: true,
        error: true,
      },
    })

    return NextResponse.json({
      apiKey: {
        ...apiKey,
        key: undefined, // Never expose the hashed key
      },
      recentLogs,
    })
  } catch (error) {
    console.error('Error fetching API key:', error)
    return NextResponse.json({ error: 'Failed to fetch API key' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/api-keys/:id
 * Update API key settings
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const admin = await getAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  try {
    const body = await request.json()

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.appUrl !== undefined) updateData.appUrl = body.appUrl
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.rateLimit !== undefined) updateData.rateLimit = body.rateLimit
    if (body.expiresAt !== undefined) {
      updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
    }
    if (body.permissions !== undefined) {
      updateData.permissions = Array.isArray(body.permissions)
        ? JSON.stringify(body.permissions)
        : body.permissions
    }

    const apiKey = await prisma.apiKey.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        appName: true,
        appUrl: true,
        permissions: true,
        rateLimit: true,
        isActive: true,
        expiresAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ apiKey })
  } catch (error) {
    console.error('Error updating API key:', error)
    return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/api-keys/:id
 * Delete an API key
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const admin = await getAdminFromCookies()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  try {
    // Delete associated webhooks and logs first
    await prisma.webhook.deleteMany({ where: { apiKeyId: id } })
    await prisma.apiLog.deleteMany({ where: { apiKeyId: id } })

    // Delete the API key
    await prisma.apiKey.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 })
  }
}
