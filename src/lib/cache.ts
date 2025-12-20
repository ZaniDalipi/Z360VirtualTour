/**
 * In-memory cache with TTL support for reducing database load
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Run cleanup every 60 seconds
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
    }
  }

  /**
   * Get a cached value
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set a cached value with TTL in seconds
   */
  set<T>(key: string, data: T, ttlSeconds: number = 60): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    })
  }

  /**
   * Delete a cached value
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Delete all cached values matching a prefix
   */
  invalidatePrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cached values
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Get or set a cached value using a factory function
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds: number = 60
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await factory()
    this.set(key, data, ttlSeconds)
    return data
  }
}

// Singleton cache instance
export const cache = new MemoryCache()

// Cache keys for common data
export const CacheKeys = {
  CATEGORIES: 'categories',
  CATEGORIES_WITH_COUNT: 'categories:with-count',
  TOURS: 'tours',
  TOURS_FEATURED: 'tours:featured',
  TOURS_BY_CATEGORY: (slug: string) => `tours:category:${slug}`,
  TOUR_BY_SLUG: (slug: string) => `tour:${slug}`,
  TESTIMONIALS: 'testimonials',
  TESTIMONIALS_FEATURED: 'testimonials:featured',
  PRICING_PLANS: 'pricing:plans',
  STATS: 'stats',
  BOOKING_SETTINGS: 'booking:settings',
  URGENCY_TIERS: 'urgency:tiers',
  TRAVEL_ZONES: 'travel:zones',
  TRAVEL_BUNDLES: 'travel:bundles',
}

// Cache TTLs in seconds
export const CacheTTL = {
  SHORT: 30,      // 30 seconds for frequently changing data
  MEDIUM: 120,    // 2 minutes for semi-static data
  LONG: 300,      // 5 minutes for rarely changing data
  VERY_LONG: 600, // 10 minutes for static-ish data
}
