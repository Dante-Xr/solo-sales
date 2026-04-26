/**
 * ============================================
 * Admin UI 状态管理 单元测试 (Phase 3 界面优化)
 * ============================================
 * 测试覆盖：
 *   - 标签页管理（添加/删除/切换/刷新）
 *   - 最大标签数限制（10个）
 *   - 收藏功能（添加/移除/判断/排序）
 *   - 最近访问（记录/去重/清空/最大5个）
 *   - 全局搜索状态管理
 *   - 表格配置管理
 * ============================================
 */

import { useAdminUIStore } from "../useAdminUIStore"

describe("useAdminUIStore", () => {
  beforeEach(() => {
    useAdminUIStore.setState({
      tabs: [{ id: "dashboard", href: "/admin", label: "dashboard" }],
      activeTabId: "dashboard",
      refreshKey: {},
      favorites: [],
      recentVisits: [],
      searchOpen: false,
      searchQuery: "",
      searchResults: [],
      tableConfigs: {},
    })
    localStorage.clear()
  })

  // ==================== 标签页测试 ====================

  describe("标签页管理", () => {
    it("初始状态应有一个仪表盘标签", () => {
      const { tabs, activeTabId } = useAdminUIStore.getState()
      expect(tabs).toHaveLength(1)
      expect(tabs[0].id).toBe("dashboard")
      expect(activeTabId).toBe("dashboard")
    })

    it("addTab 应添加新标签并激活", () => {
      const newTab = { id: "products", href: "/admin/products", label: "products.pageTitle" }
      useAdminUIStore.getState().addTab(newTab)

      const { tabs, activeTabId } = useAdminUIStore.getState()
      expect(tabs).toHaveLength(2)
      expect(activeTabId).toBe("products")
    })

    it("addTab 已存在的标签应只激活不重复添加", () => {
      const tab = { id: "products", href: "/admin/products", label: "products.pageTitle" }
      useAdminUIStore.getState().addTab(tab)
      useAdminUIStore.getState().addTab(tab)

      const { tabs } = useAdminUIStore.getState()
      expect(tabs).toHaveLength(2)
    })

    it("removeTab 应移除指定标签", () => {
      // 先添加两个标签
      useAdminUIStore.getState().addTab({ id: "products", href: "/admin/products", label: "products.pageTitle" })
      useAdminUIStore.getState().addTab({ id: "orders", href: "/admin/orders", label: "orders" })

      useAdminUIStore.getState().removeTab("products")
      const { tabs } = useAdminUIStore.getState()
      expect(tabs).toHaveLength(2)
      expect(tabs.find((t) => t.id === "products")).toBeUndefined()
    })

    it("removeTab 移除激活标签后应激活相邻标签", () => {
      useAdminUIStore.getState().addTab({ id: "products", href: "/admin/products", label: "products.pageTitle" })
      useAdminUIStore.getState().addTab({ id: "orders", href: "/admin/orders", label: "orders" })

      // 激活 products 然后删除
      useAdminUIStore.getState().setActiveTab("products")
      useAdminUIStore.getState().removeTab("products")

      const { activeTabId, tabs } = useAdminUIStore.getState()
      expect(activeTabId).toBe("orders")
    })

    it("不应删除最后一个标签（仪表盘）", () => {
      useAdminUIStore.getState().removeTab("dashboard")
      const { tabs } = useAdminUIStore.getState()
      expect(tabs).toHaveLength(1)
    })

    it("setActiveTab 应正确切换活跃标签", () => {
      useAdminUIStore.getState().addTab({ id: "products", href: "/admin/products", label: "products.pageTitle" })
      useAdminUIStore.getState().setActiveTab("products")
      expect(useAdminUIStore.getState().activeTabId).toBe("products")
    })

    it("refreshTab 应递增刷新计数器", () => {
      useAdminUIStore.getState().refreshTab("dashboard")
      expect(useAdminUIStore.getState().refreshKey["dashboard"]).toBe(1)

      useAdminUIStore.getState().refreshTab("dashboard")
      expect(useAdminUIStore.getState().refreshKey["dashboard"]).toBe(2)
    })

    it("标签数量超过10个时应移除第一个标签", () => {
      const store = useAdminUIStore.getState()
      // 添加10个标签（总共11个），第一个会被移除
      for (let i = 1; i <= 11; i++) {
        store.addTab({ id: `tab-${i}`, href: `/admin/tab-${i}`, label: `Tab ${i}` })
      }

      const { tabs } = useAdminUIStore.getState()
      expect(tabs.length).toBeLessThanOrEqual(10)
      expect(tabs.find((t) => t.id === "dashboard")).toBeUndefined()
    })
  })

  // ==================== 收藏测试 ====================

  describe("收藏功能", () => {
    const favTab = { id: "products", href: "/admin/products", label: "products.pageTitle" }

    it("toggleFavorite 应添加收藏", () => {
      useAdminUIStore.getState().toggleFavorite(favTab)
      const { favorites } = useAdminUIStore.getState()
      expect(favorites).toHaveLength(1)
      expect(favorites[0].href).toBe("/admin/products")
    })

    it("toggleFavorite 再次调用应取消收藏", () => {
      useAdminUIStore.getState().toggleFavorite(favTab)
      useAdminUIStore.getState().toggleFavorite(favTab)
      const { favorites } = useAdminUIStore.getState()
      expect(favorites).toHaveLength(0)
    })

    it("isFavorite 应正确判断收藏状态", () => {
      expect(useAdminUIStore.getState().isFavorite("/admin/products")).toBe(false)
      useAdminUIStore.getState().toggleFavorite(favTab)
      expect(useAdminUIStore.getState().isFavorite("/admin/products")).toBe(true)
    })

    it("reorderFavorites 应正确重排序", () => {
      const tab1 = { id: "a", href: "/admin/a", label: "A" }
      const tab2 = { id: "b", href: "/admin/b", label: "B" }
      useAdminUIStore.getState().toggleFavorite(tab1)
      useAdminUIStore.getState().toggleFavorite(tab2)

      useAdminUIStore.getState().reorderFavorites([tab2, tab1])
      const { favorites } = useAdminUIStore.getState()
      expect(favorites[0].id).toBe("b")
      expect(favorites[1].id).toBe("a")
    })

    it("收藏数量不应超过10个", () => {
      const store = useAdminUIStore.getState()
      for (let i = 1; i <= 12; i++) {
        store.toggleFavorite({ id: `fav-${i}`, href: `/admin/fav-${i}`, label: `Fav ${i}` })
      }
      const { favorites } = useAdminUIStore.getState()
      expect(favorites.length).toBeLessThanOrEqual(10)
    })
  })

  // ==================== 最近访问测试 ====================

  describe("最近访问", () => {
    const visit1 = { id: "products", href: "/admin/products", label: "products.pageTitle" }
    const visit2 = { id: "orders", href: "/admin/orders", label: "orders" }

    it("addVisit 应记录访问并去重", () => {
      useAdminUIStore.getState().addVisit(visit1)
      useAdminUIStore.getState().addVisit(visit2)
      useAdminUIStore.getState().addVisit(visit1) // 重复访问

      const { recentVisits } = useAdminUIStore.getState()
      expect(recentVisits).toHaveLength(2)
      expect(recentVisits[0].id).toBe("products") // 最近访问的排前面
    })

    it("addVisit 应限制最多5个记录", () => {
      const store = useAdminUIStore.getState()
      for (let i = 1; i <= 10; i++) {
        store.addVisit({ id: `v-${i}`, href: `/admin/v-${i}`, label: `Visit ${i}` })
      }
      const { recentVisits } = useAdminUIStore.getState()
      expect(recentVisits.length).toBeLessThanOrEqual(5)
    })

    it("clearVisits 应清空所有访问记录", () => {
      useAdminUIStore.getState().addVisit(visit1)
      useAdminUIStore.getState().addVisit(visit2)
      useAdminUIStore.getState().clearVisits()
      expect(useAdminUIStore.getState().recentVisits).toHaveLength(0)
    })

    it("重复访问应更新到列表最前面", () => {
      useAdminUIStore.getState().addVisit(visit1)
      useAdminUIStore.getState().addVisit(visit2)
      useAdminUIStore.getState().addVisit(visit1)

      const { recentVisits } = useAdminUIStore.getState()
      expect(recentVisits[0].id).toBe("products")
    })
  })

  // ==================== 搜索测试 ====================

  describe("全局搜索", () => {
    it("初始状态搜索面板应关闭", () => {
      expect(useAdminUIStore.getState().searchOpen).toBe(false)
    })

    it("setSearchOpen 应打开搜索面板", () => {
      useAdminUIStore.getState().setSearchOpen(true)
      expect(useAdminUIStore.getState().searchOpen).toBe(true)
    })

    it("setSearchQuery 应设置搜索关键词", () => {
      useAdminUIStore.getState().setSearchQuery("商品")
      expect(useAdminUIStore.getState().searchQuery).toBe("商品")
    })

    it("setSearchResults 应更新搜索结果", () => {
      const results = [{ id: "1", type: "page" as const, title: "dashboard", href: "/admin" }]
      useAdminUIStore.getState().setSearchResults(results)
      expect(useAdminUIStore.getState().searchResults).toHaveLength(1)
    })
  })

  // ==================== 表格配置测试 ====================

  describe("表格配置", () => {
    it("初始状态表格配置为空", () => {
      expect(useAdminUIStore.getState().tableConfigs).toEqual({})
    })

    it("updateTableConfig 应保存配置", () => {
      const config = {
        columns: [
          { key: "name", label: "商品名称", visible: true },
          { key: "price", label: "价格", visible: false },
        ],
        sortKey: "name",
        sortDirection: "asc" as const,
      }
      useAdminUIStore.getState().updateTableConfig("products", config)
      expect(useAdminUIStore.getState().tableConfigs["products"]).toEqual(config)
    })

    it("getTableConfig 应获取已保存的配置", () => {
      const config = {
        columns: [{ key: "name", label: "Name", visible: true }],
      }
      useAdminUIStore.getState().updateTableConfig("test", config)
      expect(useAdminUIStore.getState().getTableConfig("test")).toEqual(config)
    })

    it("getTableConfig 不存在的 key 应返回 undefined", () => {
      expect(useAdminUIStore.getState().getTableConfig("nonexistent")).toBeUndefined()
    })
  })
})
