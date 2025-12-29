import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'z360-secret-key-change-in-production'
)

export interface UserPayload {
  id: string
  email: string
  name: string
  phone?: string
  company?: string
  avatar?: string
  iat?: number
}

// Rate limiting for login attempts (in-memory, resets on server restart)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

export function checkUserRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number; lockoutRemaining?: number } {
  const now = Date.now()
  const attempts = loginAttempts.get(identifier)

  if (!attempts) {
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS }
  }

  // Reset if lockout period has passed
  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(identifier)
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS }
  }

  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    const lockoutRemaining = Math.ceil((LOCKOUT_DURATION - (now - attempts.lastAttempt)) / 1000 / 60)
    return { allowed: false, remainingAttempts: 0, lockoutRemaining }
  }

  return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - attempts.count }
}

export function recordUserLoginAttempt(identifier: string, success: boolean): void {
  if (success) {
    loginAttempts.delete(identifier)
    return
  }

  const now = Date.now()
  const attempts = loginAttempts.get(identifier)

  if (!attempts) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now })
  } else {
    loginAttempts.set(identifier, { count: attempts.count + 1, lastAttempt: now })
  }
}

export async function signUserToken(payload: UserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyUserToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as UserPayload
  } catch {
    return null
  }
}

export async function getUserFromCookies(): Promise<UserPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('user-token')?.value
  if (!token) return null
  return verifyUserToken(token)
}

export async function isUserAuthenticated(): Promise<boolean> {
  const user = await getUserFromCookies()
  return user !== null
}
