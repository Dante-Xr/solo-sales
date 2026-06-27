/**
 * ============================================
 * 搜索筛选侧栏组件
 * ============================================
 * 功能说明：
 *   - 分类筛选（多选 Checkbox）
 *   - 价格区间输入（min / max）
 *   - 评分筛选（星级按钮）
 *   - 仅显示有货（Checkbox）
 *   - 重置按钮
 * ============================================
 */

"use client"

import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Star, RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"

/** 筛选状态接口 */
export interface SearchFilters {
  categories: string[]
  priceRange: [number, number]
  minRating: number
  inStockOnly: boolean
}

/** 组件 Props */
interface SearchFilterSidebarProps {
  filters: SearchFilters
  onFilterChange: (filters: SearchFilters) => void
}

/** 可选分类列表 */
const CATEGORY_OPTIONS = [
  { key: "electronics", labelKey: "categoryElectronics" },
  { key: "home", labelKey: "categoryHome" },
  { key: "beauty", labelKey: "categoryBeauty" },
  { key: "fashion", labelKey: "categoryFashion" },
  { key: "sports", labelKey: "categorySports" },
] as const

/** 评分选项 */
const RATING_OPTIONS = [4, 3, 2, 1] as const

/** 默认筛选值 */
export const DEFAULT_FILTERS: SearchFilters = {
  categories: [],
  priceRange: [0, 9999],
  minRating: 0,
  inStockOnly: false,
}

/**
 * 搜索筛选侧栏
 * 在 PC 端作为左侧固定侧栏，移动端通过 Sheet 弹出使用
 */
export function SearchFilterSidebar({
  filters,
  onFilterChange,
}: SearchFilterSidebarProps) {
  const t = useTranslations("search")

  /** 切换分类选中状态 */
  const handleCategoryToggle = (category: string) => {
    const next = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]
    onFilterChange({ ...filters, categories: next })
  }

  /** 更新价格区间 */
  const handlePriceChange = (field: "min" | "max", value: string) => {
    const num = value === "" ? (field === "min" ? 0 : 9999) : Number(value)
    const range: [number, number] =
      field === "min" ? [num, filters.priceRange[1]] : [filters.priceRange[0], num]
    onFilterChange({ ...filters, priceRange: range })
  }

  /** 设置最低评分 */
  const handleRatingChange = (rating: number) => {
    onFilterChange({
      ...filters,
      minRating: filters.minRating === rating ? 0 : rating,
    })
  }

  /** 切换仅显示有货 */
  const handleInStockToggle = () => {
    onFilterChange({ ...filters, inStockOnly: !filters.inStockOnly })
  }

  /** 重置所有筛选 */
  const handleReset = () => {
    onFilterChange(DEFAULT_FILTERS)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 分类筛选 */}
      <section>
        <h3 className="text-sm font-semibold mb-3">{t("filterCategory")}</h3>
        <div className="flex flex-col gap-2.5">
          {CATEGORY_OPTIONS.map((opt) => (
            <label
              key={opt.key}
              className="flex items-center gap-2.5 cursor-pointer text-sm"
            >
              <Checkbox
                checked={filters.categories.includes(opt.key)}
                onCheckedChange={() => handleCategoryToggle(opt.key)}
              />
              <span>{t(opt.labelKey)}</span>
            </label>
          ))}
        </div>
      </section>

      {/* 价格区间 */}
      <section>
        <h3 className="text-sm font-semibold mb-3">{t("filterPrice")}</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={t("filterPriceMin")}
            value={filters.priceRange[0] === 0 ? "" : filters.priceRange[0]}
            onChange={(e) => handlePriceChange("min", e.target.value)}
            className="h-8 text-sm"
            min={0}
          />
          <span className="text-muted-foreground text-xs">—</span>
          <Input
            type="number"
            placeholder={t("filterPriceMax")}
            value={filters.priceRange[1] === 9999 ? "" : filters.priceRange[1]}
            onChange={(e) => handlePriceChange("max", e.target.value)}
            className="h-8 text-sm"
            min={0}
          />
        </div>
      </section>

      {/* 评分筛选 */}
      <section>
        <h3 className="text-sm font-semibold mb-3">{t("filterRating")}</h3>
        <div className="flex flex-col gap-2">
          {RATING_OPTIONS.map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => handleRatingChange(rating)}
              className={`flex items-center gap-1.5 text-sm px-2 py-1.5 rounded-md transition-colors ${
                filters.minRating === rating
                  ? "bg-brand/10 text-brand"
                  : "hover:bg-muted"
              }`}
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < rating
                      ? "fill-warning text-warning"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
              <span className="ml-1 text-xs text-muted-foreground">
                {t("filterRatingUp", { count: rating })}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 仅显示有货 */}
      <section>
        <label className="flex items-center gap-2.5 cursor-pointer text-sm">
          <Checkbox
            checked={filters.inStockOnly}
            onCheckedChange={handleInStockToggle}
          />
          <span>{t("filterInStock")}</span>
        </label>
      </section>

      {/* 重置按钮 */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleReset}
        className="w-full"
      >
        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
        {t("filterReset")}
      </Button>
    </div>
  )
}
