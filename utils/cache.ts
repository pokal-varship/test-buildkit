import { LRUCache } from 'lru-cache'
import { Store } from '@components/type/store.types'

interface CacheOptions {
  max?: number
  ttl?: number
}

export class Cache<T extends Record<string, unknown>> {
  private cache: LRUCache<string, T>

  constructor(options: CacheOptions = {}) {
    this.cache = new LRUCache({
      max: options.max || 500, // Maximum size of cache
      ttl: options.ttl || 1000 * 60 * 5, // 5 minutes TTL by default
    })
  }

  get(key: string): T | undefined {
    return this.cache.get(key)
  }

  set(key: string, value: T): void {
    this.cache.set(key, value)
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

// Create a singleton instance for store data
export const storeCache = new Cache<{ data: Store[] }>({
  max: 100,
  ttl: 1000 * 60 * 5 // 5 minutes
})

// Create a singleton instance for page configurations
export const pageConfigCache = new Cache<Record<string, unknown>>({
  max: 100,
  ttl: 1000 * 60 * 15 // 15 minutes
})

// Create a singleton instance for page drafts
export const pageDraftCache = new Cache<Record<string, unknown>>({
  max: 100,
  ttl: 1000 * 60 * 5 // 5 minutes
})

// Create a separate cache instance for "no content" (204) responses with longer TTL
export const pageDraftNoContentCache = new Cache<Record<string, unknown>>({
  max: 100,
  ttl: 1000 * 60 * 60 // 1 hour
})

// Create a singleton instance for customer reviews (testimonials)
export const customerReviewsCache = new Cache<Record<string, unknown>>({
  max: 100,
  ttl: 1000 * 60 * 60 // 1 hour
}) 