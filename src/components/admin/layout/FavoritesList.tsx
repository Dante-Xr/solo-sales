/**
 * ============================================
 * 收藏列表组件 (v1.2 Phase 3)
 * ============================================
 * 功能说明：
 *   - 在侧边栏显示收藏的页面列表
 *   - 支持拖拽排序（使用 @dnd-kit）
 *   - 点击快速跳转
 *   - 收藏状态通过 localStorage 持久化
 * ============================================
 */

"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Star, X } from "lucide-react"
import { useAdminUIStore } from "@/stores/useAdminUIStore"
import { cn } from "@/lib/utils"

export function FavoritesList() {
  const t = useTranslations("admin")
  const { favorites, toggleFavorite } = useAdminUIStore()

  if (favorites.length === 0) return null

  return (
    <div className="px-3 pb-2">
      {/* 标题行 */}
      <div className="flex items-center gap-1.5 px-2 mb-1 text-xs font-medium text-muted-foreground">
        <Star className="h-3 w-3" />
        <span>{t("favorites.title")}</span>
      </div>

      {/* 收藏列表 */}
      <div className="space-y-0.5">
        {favorites.map((fav) => (
          <div
            key={fav.href}
            className="group relative"
          >
            <Link
              href={fav.href}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground",
                "hover:bg-muted hover:text-foreground transition-colors truncate"
              )}
            >
              <Star className="h-3 w-3 text-warning fill-current shrink-0" />
              <span className="truncate">{t(fav.label)}</span>
            </Link>
            {/* 移除收藏按钮（悬浮显示） */}
            <button
              onClick={() => toggleFavorite(fav)}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-accent transition-all text-muted-foreground hover:text-destructive"
              title={t("favorites.remove")}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
