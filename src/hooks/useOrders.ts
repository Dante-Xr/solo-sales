/**
 * ============================================
 * 订单查询 Hook (Phase 1 零成本修复)
 * ============================================
 * 功能说明：
 *   - 使用 TanStack Query 管理订单数据
 *   - 替代手动 useEffect + fetch
 *   - 提供缓存、自动刷新、加载状态
 *
 * 导出的 Hook：
 *   - useOrders: 获取当前用户所有订单
 *   - useOrder: 获取单个订单详情
 * ============================================
 */

import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/lib/api-client"

/** 订单项数据结构 */
interface OrderItem {
  id: string
  quantity: number      // 购买数量
  price: number         // 购买时的单价
  product: {
    id: string
    name: string
    images: string[]
  }
}

/** 订单数据结构 */
interface Order {
  id: string
  totalAmount: number   // 订单总金额
  status: string        // 订单状态（待付款/已付款/已完成等）
  createdAt: string     // 创建时间
  items: OrderItem[]    // 订单包含的商品
  shippingAddress?: string   // 收货地址
  trackingNumber?: string   // 快递单号
}

/**
 * 获取当前用户所有订单
 *
 * 使用 TanStack Query 的好处：
 *   - 自动缓存请求结果（staleTime: 2分钟）
 *   - 订单列表和订单详情共享缓存
 *   - 后台自动刷新
 *   - 加载/错误状态管理
 */
export function useOrders() {
  return useQuery({
    queryKey: ["orders"],                       // 缓存键，用于共享和刷新
    queryFn: () => apiFetch<Order[]>("/api/orders"),  // 请求函数
    staleTime: 2 * 60 * 1000,                // 2分钟内数据视为新鲜
  })
}

/**
 * 获取单个订单详情
 *
 * @param id - 订单 ID
 * enabled: !!id - 当 id 存在时才执行查询
 *
 * 注意：订单详情缓存与 useOrders 共享同一缓存命名空间
 * queryKey ["orders", id] 与 ["orders"] 是独立的，但可以手动 invalidation
 */
export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],                   // 包含 id 的缓存键
    queryFn: () => apiFetch<Order>(`/api/orders/${id}`),
    enabled: !!id,                               // id 为空时不执行查询
    staleTime: 2 * 60 * 1000,
  })
}

export type { Order, OrderItem }
