/**
 * 2026-03-24: 收藏夹 Context 模块
 * 功能：管理用户收藏的商品列表，支持添加、删除、切换收藏状态
 * 性能优化：使用 useMemo 缓存 wishlist 状态检查结果
 */
"use client"

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react"

interface WishlistContextType {
  wishlist: string[]
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (productId: string) => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

const WISHLIST_STORAGE_KEY = "solo_wishlist"

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY)
      if (saved) {
        setWishlist(JSON.parse(saved))
      }
    } catch (e) {
      console.error("Failed to load wishlist", e)
    }
  }, [mounted])

  // 2026-03-24: 使用 useMemo 缓存收藏状态检查结果，避免重复计算
  const wishlistSet = useMemo(() => {
    return new Set(wishlist)
  }, [wishlist])

  const addToWishlist = (productId: string) => {
    const newWishlist = [...wishlist, productId]
    setWishlist(newWishlist)
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(newWishlist))
  }

  const removeFromWishlist = (productId: string) => {
    const newWishlist = wishlist.filter(id => id !== productId)
    setWishlist(newWishlist)
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(newWishlist))
  }

  // 2026-03-24: 使用 Set.has() 代替数组 includes()，提高查找效率
  const isInWishlist = (productId: string) => {
    return wishlistSet.has(productId)
  }

  const toggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId)
    } else {
      addToWishlist(productId)
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
