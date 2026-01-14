import { NextRequest } from 'next/server'
import { prisma } from './prisma'
import crypto from 'crypto'

export interface ApiKeyData {
  id: string
  name: string
  appName: string
  permissions: string[]
  rateLimit: number
}

/**
 * Hash an API key for storage
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

/**
 * Generate a new API key
 */
export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const prefix = 'z360_pk_'
  const randomPart = crypto.randomBytes(24).toString('base64url')
  const key = `${prefix}${randomPart}`
  const hash = hashApiKey(key)
  return { key, prefix, hash }
}

/**
 * Validate an API key from request headers
 */
export async function validateApiKey(request: NextRequest): Promise<ApiKeyData | null> {
  const authHeader = request.headers.get('Authorization')
  const apiKeyHeader = request.headers.get('X-API-Key')

  let apiKey: string | null = null

  // Check Authorization header (Bearer token)
  if (authHeader?.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7)
  }
  // Check X-API-Key header
  else if (apiKeyHeader) {
    apiKey = apiKeyHeader
  }

  if (!apiKey) {
    return null
  }

  // Hash the provided key and look it up
  const hashedKey = hashApiKey(apiKey)

  try {
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: hashedKey },
    })

    if (!keyRecord) {
      return null
    }

    // Check if key is active
    if (!keyRecord.isActive) {
      return null
    }

    // Check if key has expired
    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      return null
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() },
    })

    // Parse permissions
    let permissions: string[] = ['read']
    try {
      permissions = JSON.parse(keyRecord.permissions)
    } catch {
      permissions = [keyRecord.permissions]
    }

    return {
      id: keyRecord.id,
      name: keyRecord.name,
      appName: keyRecord.appName,
      permissions,
      rateLimit: keyRecord.rateLimit,
    }
  } catch (error) {
    console.error('Error validating API key:', error)
    return null
  }
}

/**
 * Check if API key has specific permission
 */
export function hasPermission(apiKey: ApiKeyData, permission: string): boolean {
  return apiKey.permissions.includes(permission) || apiKey.permissions.includes('admin')
}

/**
 * Log API request
 */
export async function logApiRequest(
  apiKeyId: string | null,
  method: string,
  endpoint: string,
  statusCode: number,
  responseTime: number,
  request: NextRequest,
  error?: string
): Promise<void> {
  try {
    await prisma.apiLog.create({
      data: {
        apiKeyId,
        method,
        endpoint,
        statusCode,
        responseTime,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent'),
        error,
      },
    })
  } catch (err) {
    console.error('Failed to log API request:', err)
  }
}

/**
 * CORS headers for API responses
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
}

/**
 * Create error response with proper format
 */
export function apiError(message: string, status: number = 400, code?: string) {
  return {
    error: {
      message,
      code: code || `ERR_${status}`,
      status,
    },
  }
}

/**
 * Create success response with proper format
 */
export function apiSuccess<T>(data: T, meta?: Record<string, unknown>) {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  }
}
