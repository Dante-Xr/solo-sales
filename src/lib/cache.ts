import redis from "./redis"

const DEFAULT_TTL = 300

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key)
    return data
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error)
    return null
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttl: number = DEFAULT_TTL
): Promise<boolean> {
  try {
    await redis.set(key, value, { ex: ttl })
    return true
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error)
    return false
  }
}

export async function cacheDel(key: string): Promise<boolean> {
  try {
    await redis.del(key)
    return true
  } catch (error) {
    console.error(`Cache del error for key ${key}:`, error)
    return false
  }
}

export async function cacheDelPattern(pattern: string): Promise<boolean> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
    return true
  } catch (error) {
    console.error(`Cache del pattern error for ${pattern}:`, error)
    return false
  }
}

export const CACHE_KEYS = {
  FEATURED_PRODUCTS: "cache:get:products:featured",
  CATEGORY_PRODUCTS: (id: string) => `cache:get:products:category:${id}`,
  PRODUCT: (id: string) => `cache:get:product:${id}`,
  TRENDING_SEARCHES: "cache:get:search:trending",
  CART: (userId: string) => `cache:get:cart:${userId}`,
} as const

export const CACHE_TTL = {
  FEATURED_PRODUCTS: 300,
  CATEGORY_PRODUCTS: 300,
  PRODUCT: 600,
  TRENDING_SEARCHES: 60,
  CART: 3600,
} as const
