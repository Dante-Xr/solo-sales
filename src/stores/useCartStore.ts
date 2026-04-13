/**
 * ============================================
 * 购物车状态管理 (v0.11.0)
 * ============================================
 * 创建日期: 2026-04-13
 * 创建时间: 16:38
 * 功能说明：
 *   - 管理购物车状态（添加/删除/更新/清空商品）
 *   - 自动计算购物车总价和商品总数量
 *   - 使用 Zustand persist middleware 实现 localStorage 持久化
 *   - 解决 React Context 导致的全局重渲染问题
 * ============================================
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

/**
 * 购物车商品项接口
 * @description 包含商品基本信息及数量
 */
export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

/**
 * 购物车状态接口
 * @description 定义购物车 store 的完整状态和方法
 */
interface CartState {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, "quantity">) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
}

/**
 * 购物车 Store
 * @description 使用 Zustand 替代 React Context
 * - persist middleware: 自动将购物车数据持久化到 localStorage
 * - partialize: 只持久化 cart 数组，不持久化派生值（cartTotal/cartCount）
 * - subscribe: 监听 cart 变化，自动重新计算 cartTotal 和 cartCount
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (product) => {
        set((state) => {
          const existingItem = state.cart.find((item) => item.id === product.id)
          if (existingItem) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            }
          }
          return { cart: [...state.cart, { ...product, quantity: 1 }] }
        })
      },
      removeFromCart: (id) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        }))
      },
      updateQuantity: (id, quantity) => {
        if (quantity < 1) return
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }))
      },
      clearCart: () => set({ cart: [] }),
      cartTotal: 0,
      cartCount: 0,
    }),
    {
      name: "solo:cart",
      partialize: (state) => ({ cart: state.cart }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const cart = state.cart
          state.cartTotal = cart.reduce(
            (total, item) => total + item.price * item.quantity,
            0
          )
          state.cartCount = cart.reduce(
            (count, item) => count + item.quantity,
            0
          )
        }
      },
    }
  )
)

/**
 * 订阅 cart 变化，自动计算派生值
 * @description 当 cart 数组变化时，自动重新计算 cartTotal 和 cartCount
 *   - cartTotal: 所有商品的总价（price * quantity 求和）
 *   - cartCount: 所有商品的总数量
 */
useCartStore.subscribe((state) => {
  const cartTotal = state.cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )
  const cartCount = state.cart.reduce(
    (count, item) => count + item.quantity,
    0
  )
  if (state.cartTotal !== cartTotal || state.cartCount !== cartCount) {
    useCartStore.setState({ cartTotal, cartCount })
  }
})
