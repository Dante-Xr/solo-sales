/**
 * 修改时间：2026-06-05 00:36:49 +08:00
 * 修改内容：补充 storefront 商品读路径缓存键与 TTL，明确高频读路径缓存边界。
 * 修改模型：gpt-5.5
 *
 * 2026-06-28: 添加缓存降级机制，当Redis权限不足时自动降级到内存缓存
 */

import redis from "@/lib/redis"
import { logger } from "@/lib/logger"

const DEFAULT_TTL = 300

/**
 * 缓存条目泛型接口
 * 用于内存缓存降级机制的类型安全
 */
export interface CacheEntry<T> {
  /** 缓存值 */
  value: T
  /** 过期时间戳（毫秒） */
  expiry: number
}

// 内存缓存降级机制
const memoryCache = new Map<string, CacheEntry<unknown>>()
let useMemoryCache = false
let fallbackLogged = false // 防止重复日志

// 缓存键常量（使用 "solo:" 前缀避免与其他系统冲突）
export const CACHE_KEYS = {
  FEATURED_PRODUCTS: "solo:products:featured",
  CATEGORY_PRODUCTS: (id: string) => `solo:products:category:${id}`,
  PRODUCT: (id: string) => `solo:products:${id}`,
  TRENDING_SEARCHES: "solo:search:trending",
  CART: (userId: string) => `solo:cart:${userId}`,
  ADMIN_DASHBOARD: () => "solo:admin:dashboard",
  PRODUCT_LIST: (params: string) => `solo:products:list:${params}`,
  STOREFRONT_PRODUCTS: (filter: string) => `solo:products:storefront:${filter}`,
  CUSTOMER_LIST: () => "solo:admin:customers",
  ADMIN_PERMISSIONS: (adminId: string) => `solo:admin:permissions:${adminId}`,
  ROLE_PERMISSIONS: (roleId: string) => `solo:admin:role:${roleId}`,
  ALL_PERMISSIONS: "solo:admin:permissions:all",
  CONVERSATION: (sessionId: string) => `solo:conversation:${sessionId}`,
  RAG_KNOWLEDGE: "solo:rag:knowledge",
  ANALYTICS_SALES_OVERVIEW: "solo:analytics:sales:overview",
  ANALYTICS_SALES_TRENDS: "solo:analytics:sales:trends",
  ANALYTICS_CUSTOMER: "solo:analytics:customer",
  ANALYTICS_PRODUCT: "solo:analytics:product",
  ANALYTICS_INVENTORY: "solo:analytics:inventory",
} as const

// 缓存 TTL 常量
export const CACHE_TTL = {
  FEATURED_PRODUCTS: 300,
  STOREFRONT_PRODUCTS: 300,
  CATEGORY_PRODUCTS: 300,
  PRODUCT: 600,
  TRENDING_SEARCHES: 60,
  CART: 3600,
  SHORT: 60,
  MEDIUM: 300,
  LONG: 600,
  ADMIN_PERMISSIONS: 300,
  ROLE_PERMISSIONS: 600,
  ALL_PERMISSIONS: 1800,
} as const

/**
 * 从缓存获取数据
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key)
    return data
  } catch (error: unknown) {
    logger.error(`Cache get error for key ${key}`, error)
    return null
  }
}

/**
 * 设置缓存数据
 */
export async function cacheSet<T>(key: string, value: T, ttl: number = DEFAULT_TTL): Promise<boolean> {
  try {
    // 如果已经降级到内存缓存
    if (useMemoryCache) {
      memoryCache.set(key, {
        value,
        expiry: Date.now() + ttl * 1000
      })
      return true
    }

    await redis.set(key, value, { ex: ttl })
    return true
  } catch (error: unknown) {
    // 检查是否是权限错误
    if (error instanceof Error && error.message.includes('NOPERM')) {
      logger.warn(`Redis permission denied, falling back to memory cache`)
      if (!fallbackLogged) {
        console.warn('⚠️ [CACHE FALLBACK] Redis permission denied (NOPERM), using in-memory cache')
        console.info('💡 Check Upstash ACL permissions: https://console.upstash.com')
        fallbackLogged = true
      }
      useMemoryCache = true // 降级到内存缓存
      memoryCache.set(key, {
        value,
        expiry: Date.now() + ttl * 1000
      })
      return true
    }
    logger.error(`Cache set error for key ${key}`, error)
    return false
  }
}

/**
 * 删除缓存
 */
export async function cacheDel(key: string): Promise<boolean> {
  try {
    await redis.del(key)
    return true
  } catch (error: unknown) {
    logger.error(`Cache del error for key ${key}`, error)
    return false
  }
}

/**
 * 批量删除匹配模式的缓存
 */
export async function cacheDelPattern(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
    return keys.length
  } catch (error: unknown) {
    logger.error(`Cache del pattern error for ${pattern}`, error)
    return 0
  }
}
