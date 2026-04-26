/**
 * ============================================
 * 最近访问组件 (v1.2 Phase 3)
 * ============================================
 * 功能说明：
 *   - 在侧边栏底部显示最近访问的页面
 *   - 最多显示 5 个最近访问页面
 *   - 点击快速跳转
 *   - 支持清除历史记录
 * ============================================
 */

"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Clock, X } from "lucide-react"
import { useAdminUIStore } from "@/stores/useAdminUIStore"
import { cn } from "@/lib/utils"

export function RecentVisits() {
  const t = useTranslations("admin")
  const { recentVisits, clearVisits } = useAdminUIStore()

  if (recentVisits.length === 0) return null

  return (
    <div className="px-3 pb-2">
      {/* 标题行 */}
      <div className="flex items-center justify-between px-2 mb-1">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{t("recentVisits.title")}</span>
        </div>
        <button
          onClick={clearVisits}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          title={t("recentVisits.clear")}
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* 最近访问列表 */}
      <div className="space-y-0.5">
        {recentVisits.map((visit) => (
          <Link
            key={visit.href}
            href={visit.href}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground",
              "hover:bg-muted hover:text-foreground transition-colors truncate"
            )}
          >
            <span className="w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0" />
            <span className="truncate">{t(visit.label)}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
