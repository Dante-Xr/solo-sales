/**
 * ============================================
 * 后台管理 UI 状态管理 (v1.2 Phase 3)
 * ============================================
 * 功能说明：
 *   - 页面标签页管理（打开/关闭/切换/刷新）
 *   - 收藏页面管理（添加/移除/排序）
 *   - 最近访问记录管理
 *   - 全局搜索状态管理
 *   - 表格列配置管理（显示/隐藏/列宽）
 *   - 所有状态通过 localStorage 持久化
 * ============================================
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

// ==================== 类型定义 ====================

/** 页面标签 */
export interface PageTab {
  id: string
  href: string
  label: string
}

/** 表格列配置 */
export interface ColumnConfig {
  key: string
  label: string
  visible: boolean
  width?: number
}

/** 单个表格的完整配置 */
export interface TableConfig {
  columns: ColumnConfig[]
  sortKey?: string
  sortDirection?: "asc" | "desc"
}

/** 搜索结果项 */
export interface SearchResult {
  id: string
  type: "page" | "product" | "order" | "customer"
  title: string
  subtitle?: string
  href: string
}

// ==================== Store 接口 ====================

interface AdminUIState {
  // 页面标签
  tabs: PageTab[]
  activeTabId: string | null
  addTab: (tab: PageTab) => void
  removeTab: (id: string) => void
  setActiveTab: (id: string) => void
  refreshTab: (id: string) => void
  refreshKey: Record<string, number>

  // 收藏
  favorites: PageTab[]
  toggleFavorite: (tab: PageTab) => void
  isFavorite: (href: string) => boolean
  reorderFavorites: (favorites: PageTab[]) => void

  // 最近访问
  recentVisits: PageTab[]
  addVisit: (tab: PageTab) => void
  clearVisits: () => void

  // 全局搜索
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: SearchResult[]
  setSearchResults: (results: SearchResult[]) => void

  // 表格配置
  tableConfigs: Record<string, TableConfig>
  updateTableConfig: (key: string, config: TableConfig) => void
  getTableConfig: (key: string) => TableConfig | undefined
}

// ==================== 默认标签页 ====================

const DEFAULT_TAB: PageTab = {
  id: "dashboard",
  href: "/admin",
  label: "dashboard",
}

// ==================== Store 实现 ====================

export const useAdminUIStore = create<AdminUIState>()(
  persist(
    (set, get) => ({
      // --- 页面标签 ---
      tabs: [DEFAULT_TAB],
      activeTabId: "dashboard",
      refreshKey: {},

      addTab: (tab) => {
        const { tabs } = get()
        const exists = tabs.find((t) => t.id === tab.id)
        if (exists) {
          set({ activeTabId: tab.id })
          return
        }
        // 限制最大标签数 10 个
        if (tabs.length >= 10) {
          const newTabs = [...tabs.slice(1), tab]
          set({ tabs: newTabs, activeTabId: tab.id })
          return
        }
        set({ tabs: [...tabs, tab], activeTabId: tab.id })
      },

      removeTab: (id) => {
        const { tabs, activeTabId } = get()
        if (tabs.length <= 1) return

        const newTabs = tabs.filter((t) => t.id !== id)
        let newActiveId = activeTabId

        if (activeTabId === id) {
          const removedIndex = tabs.findIndex((t) => t.id === id)
          const newIndex = Math.min(removedIndex, newTabs.length - 1)
          newActiveId = newTabs[newIndex]?.id || newTabs[0]?.id || null
        }

        set({ tabs: newTabs, activeTabId: newActiveId })
      },

      setActiveTab: (id) => set({ activeTabId: id }),

      refreshTab: (id) => {
        const { refreshKey } = get()
        set({ refreshKey: { ...refreshKey, [id]: (refreshKey[id] || 0) + 1 } })
      },

      // --- 收藏 ---
      favorites: [],

      toggleFavorite: (tab) => {
        const { favorites } = get()
        const exists = favorites.find((f) => f.href === tab.href)
        if (exists) {
          set({ favorites: favorites.filter((f) => f.href !== tab.href) })
        } else {
          // 限制最多收藏 10 个
          if (favorites.length >= 10) return
          set({ favorites: [...favorites, tab] })
        }
      },

      isFavorite: (href) => {
        return get().favorites.some((f) => f.href === href)
      },

      reorderFavorites: (favorites) => set({ favorites }),

      // --- 最近访问 ---
      recentVisits: [],

      addVisit: (tab) => {
        const { recentVisits } = get()
        const filtered = recentVisits.filter((v) => v.href !== tab.href)
        const updated = [tab, ...filtered].slice(0, 5)
        set({ recentVisits: updated })
      },

      clearVisits: () => set({ recentVisits: [] }),

      // --- 全局搜索 ---
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),
      searchResults: [],
      setSearchResults: (results) => set({ searchResults: results }),

      // --- 表格配置 ---
      tableConfigs: {},

      updateTableConfig: (key, config) => {
        const { tableConfigs } = get()
        set({ tableConfigs: { ...tableConfigs, [key]: config } })
      },

      getTableConfig: (key) => {
        return get().tableConfigs[key]
      },
    }),
    {
      name: "solo_admin_ui",
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        favorites: state.favorites,
        recentVisits: state.recentVisits,
        tableConfigs: state.tableConfigs,
      }),
    }
  )
)
