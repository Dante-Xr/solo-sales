/**
 * ============================================
 * 面包屑导航组件 (v1.2 Phase 3)
 * ============================================
 * 功能说明：
 *   - 基于当前路由路径自动生成面包屑
 *   - 支持点击返回上级页面
 *   - 与路由同步更新
 *   - 支持国际化（中/英文）
 *   - 移动端适配（省略过长路径）
 * ============================================
 */

"use client"

import { usePathname } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { ChevronRight, Home } from "lucide-react"
import { Fragment, useMemo } from "react"

/**
 * 路由路径到显示名的映射表
 * 定义在组件外部避免每次渲染重新创建
 */
const pathLabelMap: Record<string, string> = {
  "/admin": "dashboard",
  "/admin/products": "products.pageTitle",
  "/admin/orders": "orders",
  "/admin/customers": "customers.pageTitle",
  "/admin/knowledge": "knowledge.pageTitle",
  "/admin/settings": "settings",
  "/admin/users": "userManagement",
  "/admin/roles": "roleManagement",
  "/admin/permissions": "permissionManagement",
  "/admin/import": "import",
  "/admin/chat": "chat",
  "/admin/profile": "profileLabel",
}

export function Breadcrumb() {
  const pathname = usePathname()
  const t = useTranslations("admin")

  /**
   * 根据当前路径分段生成面包屑项
   * 例如 /admin/products → [{ href: "/admin", label: "dashboard" }, { href: "/admin/products", label: "products" }]
   */
  const crumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean)
    // 如果是 /zh/admin/products，segments = ["zh", "admin", "products"]
    // 移除 locale 前缀
    const pathWithoutLocale = segments.length >= 2 ? "/" + segments.slice(1).join("/") : "/" + segments.join("/")

    const parts = pathWithoutLocale.split("/").filter(Boolean)
    const result: { href: string; label: string }[] = []

    let accumulatedPath = ""
    for (const part of parts) {
      accumulatedPath += "/" + part
      const labelKey = pathLabelMap[accumulatedPath] || part
      result.push({
        href: accumulatedPath,
        label: labelKey,
      })
    }

    return result
  }, [pathname])

  if (crumbs.length <= 1) return null

  return (
    <nav aria-label="breadcrumb" className="flex min-h-11 items-center gap-1 overflow-x-auto py-2 text-sm text-muted-foreground">
      <Link
        href="/admin"
        className="flex shrink-0 items-center gap-1 rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">{t("dashboard")}</span>
      </Link>

      {crumbs.slice(1).map((crumb, index) => {
        const isLast = index === crumbs.length - 2
        return (
          <Fragment key={crumb.href}>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            {isLast ? (
              <span className="text-foreground font-medium truncate max-w-[150px]">
                {t(crumb.label)}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="max-w-[120px] truncate rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t(crumb.label)}
              </Link>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
