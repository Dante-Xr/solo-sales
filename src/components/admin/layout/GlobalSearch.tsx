/**
 * ============================================
 * 全局搜索组件 (v1.2 Phase 3)
 * ============================================
 * 功能说明：
 *   - Command+K / Ctrl+K 唤起全局搜索面板
 *   - 支持搜索页面导航、商品、订单、客户
 *   - 搜索结果分组显示
 *   - 键盘上下导航 + 回车跳转
 *   - 使用 cmdk 库实现命令面板
 * ============================================
 */

"use client"

import { useEffect, useCallback, useRef } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { Command } from "cmdk"
import {
  Package,
  ShoppingCart,
  Users,
  Search,
  FileText,
} from "lucide-react"
import { useAdminUIStore, type SearchResult } from "@/stores/useAdminUIStore"

/** 静态页面搜索结果（始终可用） */
const PAGE_RESULTS: SearchResult[] = [
  { id: "page-dashboard", type: "page", title: "dashboard", subtitle: "/admin", href: "/admin" },
  { id: "page-products", type: "page", title: "products.pageTitle", subtitle: "/admin/products", href: "/admin/products" },
  { id: "page-orders", type: "page", title: "orders", subtitle: "/admin/orders", href: "/admin/orders" },
  { id: "page-customers", type: "page", title: "customers.pageTitle", subtitle: "/admin/customers", href: "/admin/customers" },
  { id: "page-knowledge", type: "page", title: "knowledge.pageTitle", subtitle: "/admin/knowledge", href: "/admin/knowledge" },
  { id: "page-settings", type: "page", title: "settings", subtitle: "/admin/settings", href: "/admin/settings" },
  { id: "page-import", type: "page", title: "import", subtitle: "/admin/import", href: "/admin/import" },
  { id: "page-chat", type: "page", title: "chat", subtitle: "/admin/chat", href: "/admin/chat" },
  { id: "page-users", type: "page", title: "userManagement", subtitle: "/admin/users", href: "/admin/users" },
  { id: "page-roles", type: "page", title: "roleManagement", subtitle: "/admin/roles", href: "/admin/roles" },
  { id: "page-permissions", type: "page", title: "permissionManagement", subtitle: "/admin/permissions", href: "/admin/permissions" },
]

/** 页面类型对应的图标 */
function getResultIcon(type: SearchResult["type"]) {
  switch (type) {
    case "page":
      return <FileText className="h-4 w-4" />
    case "product":
      return <Package className="h-4 w-4" />
    case "order":
      return <ShoppingCart className="h-4 w-4" />
    case "customer":
      return <Users className="h-4 w-4" />
  }
}

export function GlobalSearch() {
  const router = useRouter()
  const t = useTranslations("admin")
  const inputRef = useRef<HTMLInputElement>(null)
  const searchOpenRef = useRef(false)

  const {
    searchOpen,
    setSearchOpen,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
  } = useAdminUIStore()

  searchOpenRef.current = searchOpen

  /** 过滤搜索结果 */
  const filterResults = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setSearchResults([])
        return
      }

      const q = query.toLowerCase()
      const results: SearchResult[] = []

      // 搜索页面
      const matchedPages = PAGE_RESULTS.filter(
        (p) =>
          t(p.title).toLowerCase().includes(q) ||
          p.subtitle?.toLowerCase().includes(q)
      )
      results.push(...matchedPages)

      // TODO: 后续接入 API 搜索商品/订单/客户
      // 当前版本先返回静态页面结果

      setSearchResults(results)
    },
    [t, setSearchResults]
  )

  useEffect(() => {
    filterResults(searchQuery)
  }, [searchQuery, filterResults])

  /** 键盘快捷键监听（使用 ref 避免频繁绑定/解绑） */
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(!searchOpenRef.current)
      }
      if (e.key === "Escape") {
        setSearchOpen(false)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [setSearchOpen])

  /** 打开搜索面板时自动聚焦输入框 */
  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [searchOpen])

  /** 处理搜索结果选择 */
  const handleSelect = (result: SearchResult) => {
    setSearchOpen(false)
    setSearchQuery("")
    setSearchResults([])
    router.push(result.href)
  }

  if (!searchOpen) return null

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={() => setSearchOpen(false)}
      />

      {/* 搜索命令面板 */}
      <div className="fixed inset-x-0 top-[20%] z-50 mx-auto max-w-lg px-4">
        <Command
          className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
          shouldFilter={false}
        >
          {/* 搜索输入框 */}
          <div className="flex items-center border-b border-border px-4">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Command.Input
              ref={inputRef}
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder={t("search.placeholder")}
              className="flex-1 h-12 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs text-muted-foreground bg-muted rounded font-mono">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>

          {/* 搜索结果列表 */}
          <Command.List className="max-h-80 overflow-y-auto p-2 scroll-py-2">
            {searchQuery.trim() === "" && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {t("search.hint")}
              </div>
            )}

            {searchQuery.trim() !== "" && searchResults.length === 0 && (
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                {t("search.noResults")}
              </Command.Empty>
            )}

            {/* 按类型分组显示 */}
            {searchResults.length > 0 && (
              <>
                {/* 页面导航分组 */}
                {searchResults.filter((r) => r.type === "page").length > 0 && (
                  <Command.Group
                    heading={t("search.pages")}
                    className="text-xs font-medium text-muted-foreground px-2 py-1.5"
                  >
                    {searchResults
                      .filter((r) => r.type === "page")
                      .map((result) => (
                        <Command.Item
                          key={result.id}
                          value={result.id}
                          onSelect={() => handleSelect(result)}
                          className="flex items-center gap-3 px-2 py-2.5 text-sm rounded-lg aria-selected:bg-accent cursor-pointer"
                        >
                          {getResultIcon(result.type)}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {t(result.title)}
                            </div>
                            {result.subtitle && (
                              <div className="text-xs text-muted-foreground truncate">
                                {result.subtitle}
                              </div>
                            )}
                          </div>
                        </Command.Item>
                      ))}
                  </Command.Group>
                )}

                {/* 商品搜索结果 */}
                {searchResults.filter((r) => r.type === "product").length > 0 && (
                  <Command.Group
                    heading={t("search.products")}
                    className="text-xs font-medium text-muted-foreground px-2 py-1.5"
                  >
                    {searchResults
                      .filter((r) => r.type === "product")
                      .map((result) => (
                        <Command.Item
                          key={result.id}
                          value={result.id}
                          onSelect={() => handleSelect(result)}
                          className="flex items-center gap-3 px-2 py-2.5 text-sm rounded-lg aria-selected:bg-accent cursor-pointer"
                        >
                          {getResultIcon(result.type)}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {result.title}
                            </div>
                            {result.subtitle && (
                              <div className="text-xs text-muted-foreground truncate">
                                {result.subtitle}
                              </div>
                            )}
                          </div>
                        </Command.Item>
                      ))}
                  </Command.Group>
                )}
              </>
            )}
          </Command.List>
        </Command>
      </div>
    </>
  )
}
