/**
 * ============================================
 * 收藏按钮组件 (v1.2 Phase 3)
 * ============================================
 * 功能说明：
 *   - 页面标题旁的收藏/取消收藏按钮
 *   - 点击切换收藏状态
 *   - 已收藏显示实心星标，未收藏显示空心
 * ============================================
 */

"use client"

import { useTranslations } from "next-intl"
import { Star } from "lucide-react"
import { useAdminUIStore, type PageTab } from "@/stores/useAdminUIStore"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  tab: PageTab
}

export function FavoriteButton({ tab }: FavoriteButtonProps) {
  const t = useTranslations("admin")
  const { isFavorite, toggleFavorite } = useAdminUIStore()
  const favorited = isFavorite(tab.href)

  return (
    <button
      onClick={() => toggleFavorite(tab)}
      className={cn(
        "p-1.5 rounded-md transition-all duration-200",
        favorited
          ? "text-warning hover:text-warning hover:bg-warning/10 dark:hover:bg-warning/30"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
      title={favorited ? t("favorites.remove") : t("favorites.add")}
    >
      <Star
        className={cn(
          "h-4 w-4 transition-all duration-200",
          favorited && "fill-current"
        )}
      />
    </button>
  )
}
