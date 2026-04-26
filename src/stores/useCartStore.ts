/**
 * 购物车状态管理 (v1.3)
 * 功能说明：
 *   - 管理购物车状态（添加/删除/更新/清空商品）
 *   - 商品选中状态管理（全选/取消全选/单选）
 *   - 批量删除已选商品
 *   - 自动计算购物车总价、商品总数量、已选商品总价
 *   - 使用 Zustand persist middleware 实现 localStorage 持久化
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  quantity: number
  image: string
  selected?: boolean
}

interface CartState {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, "quantity" | "selected">) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  toggleSelect: (id: string) => void
  toggleSelectAll: () => void
  removeSelected: () => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
  selectedTotal: number
  selectedCount: number
  isAllSelected: boolean
}

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
          return { cart: [...state.cart, { ...product, quantity: 1, selected: true }] }
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
      toggleSelect: (id) => {
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, selected: !item.selected } : item
          ),
        }))
      },
      toggleSelectAll: () => {
        const { cart, isAllSelected } = get()
        set({
          cart: cart.map((item) => ({ ...item, selected: !isAllSelected })),
        })
      },
      removeSelected: () => {
        set((state) => ({
          cart: state.cart.filter((item) => !item.selected),
        }))
      },
      clearCart: () => set({ cart: [] }),
      cartTotal: 0,
      cartCount: 0,
      selectedTotal: 0,
      selectedCount: 0,
      isAllSelected: false,
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
          const selected = cart.filter((item) => item.selected)
          state.selectedTotal = selected.reduce(
            (total, item) => total + item.price * item.quantity,
            0
          )
          state.selectedCount = selected.reduce(
            (count, item) => count + item.quantity,
            0
          )
          state.isAllSelected = cart.length > 0 && cart.every((item) => item.selected)
        }
      },
    }
  )
)

useCartStore.subscribe((state) => {
  const cartTotal = state.cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )
  const cartCount = state.cart.reduce(
    (count, item) => count + item.quantity,
    0
  )
  const selected = state.cart.filter((item) => item.selected)
  const selectedTotal = selected.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )
  const selectedCount = selected.reduce(
    (count, item) => count + item.quantity,
    0
  )
  const isAllSelected = state.cart.length > 0 && state.cart.every((item) => item.selected)

  if (
    state.cartTotal !== cartTotal ||
    state.cartCount !== cartCount ||
    state.selectedTotal !== selectedTotal ||
    state.selectedCount !== selectedCount ||
    state.isAllSelected !== isAllSelected
  ) {
    useCartStore.setState({ cartTotal, cartCount, selectedTotal, selectedCount, isAllSelected })
  }
})
