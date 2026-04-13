/**
 * ============================================
 * 商品查询 Hook (Phase 1 零成本修复)
 * ============================================
 * 功能说明：
 *   - 使用 TanStack Query 管理商品数据
 *   - 替代手动 useEffect + fetch
 *   - 提供缓存、自动刷新、加载状态
 *
 * 导出的 Hook：
 *   - useProducts: 获取所有商品
 *   - useProduct: 获取单个商品
 *   - useFeaturedProducts: 获取精选商品
 * ============================================
 */

import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api-client"

/** 商品数据结构 */
interface Product {
  id: string
  name: string
  price: number
  originalPrice: number
  image: string
  sales: number
  category?: string
  description?: string
  rating?: number
  reviews?: number
  stock?: number
  images?: string[]
}

/**
 * 获取所有商品列表
 *
 * 使用 TanStack Query 的好处：
 *   - 自动缓存请求结果（staleTime: 5分钟）
 *   - 多个组件使用同一 queryKey 共享数据
 *   - 后台自动刷新
 *   - 加载/错误状态管理
 */
export function useProducts() {
  return useQuery({
    queryKey: ["products"],                    // 缓存键，用于共享和刷新
    queryFn: () => apiFetch<Product[]>("/api/products"),  // 请求函数
    staleTime: 5 * 60 * 1000,                // 5分钟内数据视为新鲜，不自动重新请求
  })
}

/**
 * 获取单个商品详情
 *
 * @param id - 商品 ID
 * enabled: !!id - 当 id 存在时才执行查询
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],               // 包含 id 的缓存键
    queryFn: () => apiFetch<Product>(`/api/products/${id}`),
    enabled: !!id,                             // id 为空时不执行查询
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * 获取精选商品列表
 * 查询参数：?featured=true
 */
export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],       // 独立缓存键
    queryFn: () => apiFetch<Product[]>("/api/products?featured=true"),
    staleTime: 5 * 60 * 1000,
  })
}

export type { Product }
