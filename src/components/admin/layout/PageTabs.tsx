/**
 * ============================================
 * 页面标签组件 (v1.2 Phase 3)
 * ============================================
 * 功能说明：
 *   - 类似浏览器多标签页，支持同时打开多个管理页面
 *   - 打开/关闭/切换/刷新标签
 *   - 右键菜单（关闭其他、关闭右侧、刷新）
 *   - 标签过多时支持水平滚动
 *   - 标签状态通过 localStorage 持久化
 * ============================================
 */

"use client"

import { useCallback, useRef, useState, useEffect } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { X, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { useAdminUIStore } from "@/stores/useAdminUIStore"

export function PageTabs() {
  const router = useRouter()
  const t = useTranslations("admin")
  // 使用 selector 精准订阅，函数引用不会导致重渲染
  const tabs = useAdminUIStore((s) => s.tabs)
  const activeTabId = useAdminUIStore((s) => s.activeTabId)
  const setActiveTab = useAdminUIStore((s) => s.setActiveTab)
  const removeTab = useAdminUIStore((s) => s.removeTab)
  const refreshTab = useAdminUIStore((s) => s.refreshTab)

  const scrollRef = useRef<HTMLDivElement>(null)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    tabId: string
  } | null>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  /** 检查滚动箭头是否显示 */
  const checkScrollArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setShowLeftArrow(el.scrollLeft > 0)
    setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    checkScrollArrows()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", checkScrollArrows, { passive: true })
    window.addEventListener("resize", checkScrollArrows)
    return () => {
      el.removeEventListener("scroll", checkScrollArrows)
      window.removeEventListener("resize", checkScrollArrows)
    }
  }, [checkScrollArrows, tabs])

  /** 切换标签页，同时导航到对应路由 */
  const handleTabClick = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId)
    if (!tab) return
    setActiveTab(tabId)
    router.push(tab.href)
  }

  /** 关闭标签页 */
  const handleCloseTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation()
    removeTab(tabId)
  }

  /** 处理右键菜单 */
  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, tabId })
  }

  /** 关闭右键菜单 */
  const closeContextMenu = () => setContextMenu(null)

  /** 关闭其他标签 */
  const handleCloseOthers = () => {
    if (!contextMenu) return
    const { tabs: allTabs } = useAdminUIStore.getState()
    // 只保留当前标签，移除其他所有标签
    allTabs.forEach((tab) => {
      if (tab.id !== contextMenu.tabId && tab.id !== "dashboard") {
        removeTab(tab.id)
      }
    })
    // 激活当前标签
    setActiveTab(contextMenu.tabId)
    const targetTab = allTabs.find((t) => t.id === contextMenu.tabId)
    if (targetTab) router.push(targetTab.href)
    closeContextMenu()
  }

  /** 关闭右侧标签 */
  const handleCloseRight = () => {
    if (!contextMenu) return
    const { tabs: allTabs } = useAdminUIStore.getState()
    const tabIndex = allTabs.findIndex((t) => t.id === contextMenu.tabId)
    if (tabIndex === -1) return
    // 移除右侧所有标签（不包括仪表盘）
    allTabs.slice(tabIndex + 1).forEach((tab) => {
      if (tab.id !== "dashboard") removeTab(tab.id)
    })
    setActiveTab(contextMenu.tabId)
    const targetTab = allTabs.find((t) => t.id === contextMenu.tabId)
    if (targetTab) router.push(targetTab.href)
    closeContextMenu()
  }

  /** 刷新当前标签 */
  const handleRefresh = () => {
    if (!contextMenu) return
    refreshTab(contextMenu.tabId)
    closeContextMenu()
  }

  /** 向左滚动 */
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  /** 向右滚动 */
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  if (tabs.length === 0) return null

  return (
    <div className="relative hidden border-b border-border/80 bg-card md:block">
      {/* 左滚动箭头 */}
      {showLeftArrow && (
        <button
          onClick={scrollLeft}
          className="absolute top-0 bottom-0 left-0 z-10 flex w-8 items-center justify-center bg-gradient-to-r from-card to-transparent transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* 标签列表 */}
      <div
        ref={scrollRef}
        className="flex items-center overflow-x-auto scrollbar-none px-1"
        style={{ scrollbarWidth: "none" }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          const isDashboard = tab.id === "dashboard"

          return (
            <div
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
              className={cn(
                "group relative flex min-w-0 max-w-[180px] cursor-pointer select-none items-center gap-1.5 border-r border-border px-3 py-2 text-sm whitespace-nowrap",
                "transition-colors duration-150",
                isActive
                  ? "-mt-px border-t-2 border-t-foreground bg-background text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {/* 刷新指示器（仪表盘不显示关闭按钮） */}
              {isActive && !isDashboard && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    refreshTab(tab.id)
                  }}
                  className="rounded p-0.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  title={t("tabs.refresh")}
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              )}

              <span className="truncate">{t(tab.label)}</span>

              {/* 关闭按钮（仪表盘不显示） */}
              {!isDashboard && (
                <button
                  onClick={(e) => handleCloseTab(e, tab.id)}
                  className={cn(
                    "p-0.5 rounded transition-all flex-shrink-0",
                    "opacity-0 group-hover:opacity-100",
                    isActive ? "hover:bg-muted" : "hover:bg-muted-foreground/20",
                    "focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                  title={t("tabs.close")}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* 右滚动箭头 */}
      {showRightArrow && (
        <button
          onClick={scrollRight}
          className="absolute top-0 right-0 bottom-0 z-10 flex w-8 items-center justify-center bg-gradient-to-l from-card to-transparent transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* 右键菜单 */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-50"
            onClick={closeContextMenu}
            onContextMenu={(e) => {
              e.preventDefault()
              closeContextMenu()
            }}
          />
          <div
            className="fixed z-50 w-48 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-xl"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={handleRefresh}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t("tabs.refresh")}
            </button>
            {contextMenu.tabId !== "dashboard" && (
              <>
                <div className="border-t border-border my-1" />
                <button
                  onClick={handleCloseOthers}
                  className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  {t("tabs.closeOthers")}
                </button>
                <button
                  onClick={handleCloseRight}
                  className="w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  {t("tabs.closeRight")}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
