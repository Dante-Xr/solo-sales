"use client"

import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

/** 分类项数据结构 */
interface CategoryItem {
  id: string
  icon: string
  labelKey: string
}

interface CategoryNavProps {
  categories?: CategoryItem[]
}

/** 默认分类：数码、家居、美妆、服饰、运动、图书 */
const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: "electronics", icon: "📱", labelKey: "categoryElectronics" },
  { id: "home", icon: "🏠", labelKey: "categoryHome" },
  { id: "beauty", icon: "💄", labelKey: "categoryBeauty" },
  { id: "fashion", icon: "👗", labelKey: "categoryFashion" },
  { id: "sports", icon: "⚽", labelKey: "categorySports" },
  { id: "books", icon: "📚", labelKey: "categoryBooks" },
]

export function CategoryNav({ categories }: CategoryNavProps) {
  const router = useRouter()
  const t = useTranslations("search")
  const items = categories ?? DEFAULT_CATEGORIES

  /** 点击分类跳转到搜索页并筛选对应分类 */
  const handleClick = (id: string) => {
    router.push(`/search?category=${encodeURIComponent(id)}`)
  }

  return (
    <nav className="hidden lg:flex items-center justify-center gap-6 py-1.5">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => handleClick(item.id)}
          className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="text-lg leading-none">{item.icon}</span>
          <span className="text-xs">{t(item.labelKey)}</span>
        </button>
      ))}
    </nav>
  )
}
