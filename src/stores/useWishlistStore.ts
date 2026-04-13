/**
 * ============================================
 * 收藏夹状态管理 (v0.11.0)
 * ============================================
 * 创建日期: 2026-04-13
 * 创建时间: 16:38
 * 功能说明：
 *   - 管理用户收藏的商品列表
 *   - 支持添加/删除/切换收藏状态
 *   - 使用 Zustand persist middleware 实现 localStorage 持久化
 * ============================================
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

/**
 * 收藏夹状态接口
 * @description 定义收藏夹 store 的完整状态和方法
 */
interface WishlistState {
  wishlist: string[]
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (productId: string) => void
}

/**
 * 收藏夹 Store
 * @description 使用 Zustand 替代 React Context
 * - persist middleware: 自动将收藏夹数据持久化到 localStorage
 * - name: localStorage 存储的 key（solo_wishlist）
 * - addToWishlist: 防重复添加，已存在则忽略
 * - removeFromWishlist: 根据 productId 移除
 * - isInWishlist: 检查商品是否已收藏
 * - toggleWishlist: 切换收藏状态（添加或移除）
 */
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      addToWishlist: (productId) => {
        set((state) => {
          if (state.wishlist.includes(productId)) return state
          return { wishlist: [...state.wishlist, productId] }
        })
      },
      removeFromWishlist: (productId) => {
        set((state) => ({
          wishlist: state.wishlist.filter((id) => id !== productId),
        }))
      },
      isInWishlist: (productId) => {
        return get().wishlist.includes(productId)
      },
      toggleWishlist: (productId) => {
        if (get().wishlist.includes(productId)) {
          get().removeFromWishlist(productId)
        } else {
          get().addToWishlist(productId)
        }
      },
    }),
    {
      name: "solo_wishlist",
    }
  )
)
