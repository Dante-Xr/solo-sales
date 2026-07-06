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

import type React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Check, Star, RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  DEFAULT_SEARCH_FILTERS,
  type SearchFilters,
} from "@/lib/search-products"

/** 组件 Props */
interface SearchFilterSidebarProps {
  filters: SearchFilters
  onFilterChange: (filters: SearchFilters) => void
  getFilterHref?: (filters: SearchFilters) => string
  searchQuery?: string
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
export const DEFAULT_FILTERS = DEFAULT_SEARCH_FILTERS

/**
 * 搜索筛选侧栏
 * 在 PC 端作为左侧固定侧栏，移动端通过 Sheet 弹出使用
 */
export function SearchFilterSidebar({
  filters,
  onFilterChange,
  getFilterHref,
  searchQuery = "",
}: SearchFilterSidebarProps) {
  const t = useTranslations("search")

  const renderFilterLink = (
    nextFilters: SearchFilters,
    className: string,
    children: React.ReactNode
  ) => {
    if (!getFilterHref) {
      return (
        <button
          type="button"
          className={className}
          onClick={() => onFilterChange(nextFilters)}
        >
          {children}
        </button>
      )
    }

    return (
      <a
        href={getFilterHref(nextFilters)}
        className={className}
        onClick={() => onFilterChange(nextFilters)}
      >
        {children}
      </a>
    )
  }

  const replaceFilterUrl = (nextFilters: SearchFilters) => {
    const href = getFilterHref?.(nextFilters)
    if (href) {
      window.history.replaceState(null, "", href)
    }
  }

  const renderCheckboxFilter = (
    nextFilters: SearchFilters,
    checked: boolean,
    label: string
  ) => {
    if (!getFilterHref) {
      return (
        <div className="flex items-center gap-2.5 text-sm">
          <Checkbox
            aria-label={label}
            checked={checked}
            onCheckedChange={() => onFilterChange(nextFilters)}
          />
          <button
            type="button"
            className="text-left"
            onClick={() => onFilterChange(nextFilters)}
          >
            {label}
          </button>
        </div>
      )
    }

    return (
      <a
        href={getFilterHref(nextFilters)}
        className="flex items-center gap-2.5 text-sm"
        onClick={() => onFilterChange(nextFilters)}
      >
        <span
          aria-hidden="true"
          className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all ${
            checked
              ? "border-primary bg-primary"
              : "border-input bg-background hover:border-primary/50 hover:bg-muted/50"
          }`}
        >
          {checked && <Check className="h-3.5 w-3.5 text-primary-foreground stroke-[3]" />}
        </span>
        <span>{label}</span>
      </a>
    )
  }

  /** 切换分类选中状态 */
  const getCategoryFilters = (category: string): SearchFilters => {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category]
    return { ...filters, categories }
  }

  /** 更新价格区间 */
  const handlePriceChange = (field: "min" | "max", value: string) => {
    const num = value === "" ? (field === "min" ? 0 : 9999) : Number(value)
    const range: [number, number] =
      field === "min" ? [num, filters.priceRange[1]] : [filters.priceRange[0], num]
    const nextFilters = { ...filters, priceRange: range }
    onFilterChange(nextFilters)
    replaceFilterUrl(nextFilters)
  }

  /** 设置最低评分 */
  const getRatingFilters = (rating: number): SearchFilters => ({
      ...filters,
      minRating: filters.minRating === rating ? 0 : rating,
  })

  /** 切换仅显示有货 */
  const getInStockFilters = (): SearchFilters => ({
    ...filters,
    inStockOnly: !filters.inStockOnly,
  })

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
            <div key={opt.key}>
              {renderCheckboxFilter(
                getCategoryFilters(opt.key),
                filters.categories.includes(opt.key),
                t(opt.labelKey)
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 价格区间 */}
      <section>
        <h3 className="text-sm font-semibold mb-3">{t("filterPrice")}</h3>
        <form method="get" className="flex flex-col gap-2">
          {searchQuery && <input type="hidden" name="q" value={searchQuery} />}
          {filters.categories.map((category) => (
            <input key={category} type="hidden" name="category" value={category} />
          ))}
          {filters.minRating > 0 && (
            <input type="hidden" name="minRating" value={filters.minRating} />
          )}
          {filters.inStockOnly && <input type="hidden" name="inStock" value="true" />}
          <div className="flex items-center gap-2">
          <input
            type="number"
            name="minPrice"
            placeholder={t("filterPriceMin")}
            value={filters.priceRange[0] === 0 ? "" : filters.priceRange[0]}
            onChange={(e) => handlePriceChange("min", e.target.value)}
            onInput={(e) => handlePriceChange("min", e.currentTarget.value)}
            className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            min={0}
          />
          <span className="text-muted-foreground text-xs">—</span>
          <input
            type="number"
            name="maxPrice"
            placeholder={t("filterPriceMax")}
            value={filters.priceRange[1] === 9999 ? "" : filters.priceRange[1]}
            onChange={(e) => handlePriceChange("max", e.target.value)}
            onInput={(e) => handlePriceChange("max", e.currentTarget.value)}
            className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            min={0}
          />
          </div>
          <Button variant="outline" size="sm" type="submit" className="h-7 w-full">
            {t("filterApply")}
          </Button>
        </form>
      </section>

      {/* 评分筛选 */}
      <section>
        <h3 className="text-sm font-semibold mb-3">{t("filterRating")}</h3>
        <div className="flex flex-col gap-2">
          {RATING_OPTIONS.map((rating) => (
            <div key={rating}>
              {renderFilterLink(
                getRatingFilters(rating),
                `flex items-center gap-1.5 text-sm px-2 py-1.5 rounded-md transition-colors ${
                filters.minRating === rating
                  ? "bg-brand/10 text-brand"
                  : "hover:bg-muted"
                }`,
                <>
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
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 仅显示有货 */}
      <section>
        {renderCheckboxFilter(
          getInStockFilters(),
          filters.inStockOnly,
          t("filterInStock")
        )}
      </section>

      {/* 重置按钮 */}
      {getFilterHref ? (
        <a
          href={getFilterHref(DEFAULT_FILTERS)}
          onClick={handleReset}
          className="inline-flex h-7 w-full items-center justify-center rounded-md border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted hover:text-foreground"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          {t("filterReset")}
        </a>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="w-full"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          {t("filterReset")}
        </Button>
      )}
    </div>
  )
}
