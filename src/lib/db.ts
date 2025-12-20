/**
 * Database utilities with retry logic for handling transient failures
 */

import { Prisma } from '@prisma/client'

// Error codes that indicate transient/retryable failures
const RETRYABLE_ERROR_CODES = [
  'P2024', // Timed out while waiting for connection from pool
  'P2010', // Raw query failed (includes connection issues)
  'P1001', // Can't reach database server
  'P1002', // Database server was reached but timed out
  'P1008', // Operations timed out
  'P1017', // Server has closed the connection
]

/**
 * Check if an error is retryable (transient network/connection issue)
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return RETRYABLE_ERROR_CODES.includes(error.code)
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true // Connection initialization errors are usually transient
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('server selection') ||
      message.includes('no available servers')
    )
  }

  return false
}

interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 2,
  initialDelayMs: 200,
  maxDelayMs: 1000,
  backoffMultiplier: 2,
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Execute a database operation with exponential backoff retry
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: unknown
  let delay = opts.initialDelayMs

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      // Don't retry if it's not a retryable error
      if (!isRetryableError(error)) {
        throw error
      }

      // Don't retry if we've exhausted retries
      if (attempt === opts.maxRetries) {
        console.error(`Database operation failed after ${opts.maxRetries + 1} attempts:`, error)
        throw error
      }

      console.warn(`Database operation failed (attempt ${attempt + 1}/${opts.maxRetries + 1}), retrying in ${delay}ms...`)
      await sleep(delay)
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelayMs)
    }
  }

  throw lastError
}

/**
 * Execute a database operation with a timeout
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 10000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Database operation timed out after ${timeoutMs}ms`))
    }, timeoutMs)
  })

  return Promise.race([operation(), timeoutPromise])
}

/**
 * Execute a database operation with both retry and timeout
 */
export async function dbOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions & { timeoutMs?: number } = {}
): Promise<T> {
  const { timeoutMs = 15000, ...retryOptions } = options

  return withRetry(
    () => withTimeout(operation, timeoutMs),
    retryOptions
  )
}

/**
 * Fallback wrapper - returns fallback value on failure
 */
export async function withFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
  options: RetryOptions = {}
): Promise<T> {
  try {
    return await withRetry(operation, options)
  } catch (error) {
    console.error('Database operation failed, using fallback:', error)
    return fallback
  }
}
