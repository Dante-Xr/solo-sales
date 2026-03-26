/**
 * 缓存工具模块 (v0.4.1)
 * 支持 Redis 缓存和内存缓存降级
 */

import redis from "@/lib/redis"

const DEFAULT_TTL = 300

// 缓存键常量（使用 "solo:" 前缀避免与其他系统冲突）
export const CACHE_KEYS = {
  FEATURED_PRODUCTS: "solo:products:featured",
  CATEGORY_PRODUCTS: (id: string) => `solo:products:category:${id}`,
  PRODUCT: (id: string) => `solo:products:${id}`,
  TRENDING_SEARCHES: "solo:search:trending",
  CART: (userId: string) => `solo:cart:${userId}`,
  ADMIN_DASHBOARD: () => "solo:admin:dashboard",
  PRODUCT_LIST: (params: string) => `solo:products:list:${params}`,
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
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error)
    return null
  }
}

/**
 * 设置缓存数据
 */
export async function cacheSet<T>(key: string, value: T, ttl: number = DEFAULT_TTL): Promise<boolean> {
  try {
    await redis.set(key, value, { ex: ttl })
    return true
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error)
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
  } catch (error) {
    console.error(`Cache del error for key ${key}:`, error)
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
  } catch (error) {
    console.error(`Cache del pattern error for ${pattern}:`, error)
    return 0
  }
}
