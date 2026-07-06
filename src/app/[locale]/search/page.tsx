/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：修复搜索页渲染期创建 SortBar 组件的 lint 错误，改为稳定 render 函数。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 搜索结果页面
 * ============================================
 * 功能说明：
 *   - 搜索商品并展示结果
 *   - PC 端：左侧筛选栏 + 右侧结果区
 *   - 移动端：紧凑卡片网格 + Sheet 弹出筛选
 *   - 排序功能（默认/价格/销量）
 * ============================================
 * 2026-04-13: 迁移到 next-intl 国际化方案
 * 2026-04-26: 重构为 StorefrontPageLayout + 筛选侧栏
 */

"use client"

import { Suspense, useState, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useRouter, Link } from "@/i18n/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Search,
  ShoppingCart,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react"
import { useCartStore } from "@/stores/useCartStore"
import { useTranslations } from "next-intl"
import { StorefrontPageLayout } from "@/components/storefront/StorefrontPageLayout"
import {
  SearchFilterSidebar,
} from "@/components/storefront/SearchFilterSidebar"
import {
  buildSearchFilterHref,
  getInitialSearchFilters,
  getVisibleSearchProducts,
  type SearchFilters,
  type SearchProductSortType,
} from "@/lib/search-products"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

/** 搜索商品数据结构 */
interface SearchProduct {
  id: string
  name: string
  price: number
  originalPrice: number
  image: string
  sales: number
  category: string
  rating: number
  inStock: boolean
}

/** 排序类型 */
type SortType = SearchProductSortType

/** Mock 商品数据 */
const MOCK_PRODUCTS: SearchProduct[] = [
  {
    id: "prod_mock_001",
    name: "TikTok爆款便携加湿器 | 带RGB氛围灯",
    price: 29.99,
    originalPrice: 49.99,
    image: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&q=80&w=1000",
    sales: 1580,
    category: "home",
    rating: 4.5,
    inStock: true,
  },
  {
    id: "prod_mock_002",
    name: "网红发光手机壳 | 磁吸充电",
    price: 19.99,
    originalPrice: 29.99,
    image: "https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&q=80&w=1000",
    sales: 2340,
    category: "electronics",
    rating: 4.2,
    inStock: true,
  },
  {
    id: "prod_mock_003",
    name: "蓝牙无线运动耳机 | 防汗降噪",
    price: 39.99,
    originalPrice: 59.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000",
    sales: 892,
    category: "electronics",
    rating: 4.7,
    inStock: true,
  },
  {
    id: "prod_mock_004",
    name: "迷你便携投影仪 | 家用高清",
    price: 89.99,
    originalPrice: 129.99,
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=1000",
    sales: 456,
    category: "electronics",
    rating: 3.8,
    inStock: false,
  },
  {
    id: "prod_mock_005",
    name: "智能手表 GPS 心率监测",
    price: 59.99,
    originalPrice: 99.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000",
    sales: 1203,
    category: "electronics",
    rating: 4.1,
    inStock: true,
  },
]

/** 排序选项列表 */
const SORT_OPTIONS: { key: SortType; labelKey: string }[] = [
  { key: "default", labelKey: "sortDefault" },
  { key: "priceAsc", labelKey: "sortPriceAsc" },
  { key: "priceDesc", labelKey: "sortPriceDesc" },
  { key: "sales", labelKey: "sortSales" },
]

function SearchPageContent() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations("search")
  const { addToCart } = useCartStore()

  const query = searchParams.get("q") || ""
  const searchParamString = searchParams.toString()
  const [searchInput, setSearchInput] = useState(query)
  const [filters, setFilters] = useState<SearchFilters>(() =>
    getInitialSearchFilters(searchParams)
  )
  const [sortType, setSortType] = useState<SortType>("default")
  /** 移动端排序下拉是否展开 */
  const [sortOpen, setSortOpen] = useState(false)

  const buildFilterHref = (nextFilters: SearchFilters) => {
    return buildSearchFilterHref(query, nextFilters) || pathname
  }

  useEffect(() => {
    setFilters(getInitialSearchFilters(new URLSearchParams(searchParamString)))
  }, [searchParamString])

  /** 搜索表单提交 */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(searchInput)}`)
  }

  /** 加入购物车 */
  const handleAddToCart = (product: SearchProduct) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
  }

  /** 筛选 + 排序后的结果 */
  const filteredResults = getVisibleSearchProducts(MOCK_PRODUCTS, query, filters, sortType)

  /** 排序栏组件（PC 端和移动端共用） */
  // 排序栏依赖当前 sortType 和翻译，使用 render 函数避免在渲染期声明组件。
  const renderSortBar = (compact = false) => (
    <div className="flex items-center gap-2">
      {SORT_OPTIONS.map((opt) => (
        <Button
          key={opt.key}
          variant={sortType === opt.key ? "default" : "ghost"}
          size={compact ? "sm" : "sm"}
          className={sortType === opt.key ? "bg-brand hover:bg-brand/90 text-brand-foreground" : ""}
          onClick={() => setSortType(opt.key)}
        >
          {t(opt.labelKey)}
        </Button>
      ))}
    </div>
  )

  /** 移动端紧凑搜索卡片 */
  const MobileProductCard = ({ product }: { product: SearchProduct }) => (
    <Link href={`/product/${product.id}`} className="block">
      <div className="rounded-xl overflow-hidden bg-card border border-border">
        <div className="relative aspect-square bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="50vw"
          />
        </div>
        <div className="p-2">
          <h3 className="text-xs line-clamp-2 leading-tight mb-1">{product.name}</h3>
          <span className="text-price text-sm font-bold">${product.price}</span>
        </div>
      </div>
    </Link>
  )

  /** PC 端搜索卡片 */
  const DesktopProductCard = ({ product }: { product: SearchProduct }) => (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => router.push(`/product/${product.id}`)}
    >
      <div className="relative aspect-square bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 1024px) 50vw, 25vw"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium text-sm line-clamp-2 mb-2">{product.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-price">${product.price}</span>
          <span className="text-sm text-muted-foreground line-through">
            ${product.originalPrice}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-brand hover:bg-brand/90 text-brand-foreground"
            onClick={(e) => {
              e.stopPropagation()
              handleAddToCart(product)
            }}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {t("addToCart")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-brand text-brand hover:bg-brand/5"
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/product/${product.id}`)
            }}
          >
            {t("details")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <StorefrontPageLayout title={t("title")} showBack showDecorBg>
      <div className="p-3 lg:p-6">
        {/* 搜索栏 */}
        <form onSubmit={handleSearch} className="relative mb-4 lg:hidden">
          <Input
            type="search"
            placeholder={t("searchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pr-12"
          />
          <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0">
            <Search className="w-5 h-5" />
          </Button>
        </form>

        {/* 标题 + 结果数量（PC 端） */}
        <div className="hidden lg:flex items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold">
            {query ? `"${query}" ${t("searchResults")}` : t("allProducts")}
          </h1>
          <span className="text-muted-foreground">
            {filteredResults.length} {t("productsFound")}
          </span>
        </div>

        {/* 移动端：筛选 + 排序按钮行 */}
        <div className="flex items-center gap-2 mb-3 lg:hidden">
          {/* 筛选 Sheet */}
          <Sheet>
            <SheetTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
              <SlidersHorizontal className="w-4 h-4" />
              {t("filterButton")}
            </SheetTrigger>
            <SheetContent side="left" className="w-72 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{t("filterButton")}</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-4">
                <SearchFilterSidebar
                  filters={filters}
                  onFilterChange={setFilters}
                  getFilterHref={buildFilterHref}
                  searchQuery={query}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* 排序下拉 */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setSortOpen(!sortOpen)}
            >
              <ArrowUpDown className="w-4 h-4" />
              {t("sortButton")}
            </Button>
            {sortOpen && (
              <>
                {/* 点击遮罩关闭 */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setSortOpen(false)}
                />
                <div className="absolute left-0 top-full mt-1 z-50 bg-popover border rounded-md shadow-md py-1 min-w-[140px]">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                        sortType === opt.key ? "text-brand font-medium" : ""
                      }`}
                      onClick={() => {
                        setSortType(opt.key)
                        setSortOpen(false)
                      }}
                    >
                      {t(opt.labelKey)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 主体：PC 端左侧筛选 + 右侧结果 */}
        <div className="flex gap-6">
          {/* PC 端左侧筛选栏 */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20">
              <SearchFilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                getFilterHref={buildFilterHref}
                searchQuery={query}
              />
            </div>
          </aside>

          {/* 右侧结果区 */}
          <div className="flex-1 min-w-0">
            {/* PC 端排序栏 */}
            <div className="hidden lg:flex items-center gap-2 mb-4 border-b pb-3">
              {renderSortBar()}
            </div>

            {filteredResults.length === 0 ? (
              /* 空状态 */
              <div className="text-center py-20">
                <Search className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <div className="text-muted-foreground mb-4 text-lg">
                  {t("noProductsFound")}
                </div>
                <Button variant="outline" onClick={() => router.push(`/`)}>
                  {t("backToHome")}
                </Button>
              </div>
            ) : (
              <>
                {/* 移动端：2 列紧凑卡片 */}
                <div className="grid grid-cols-2 gap-3 lg:hidden">
                  {filteredResults.map((product) => (
                    <MobileProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* PC 端：多列卡片 */}
                <div className="hidden lg:grid grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredResults.map((product) => (
                    <DesktopProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </StorefrontPageLayout>
  )
}

/** 加载中占位 */
function SearchLoading() {
  const t = useTranslations("search")
  return (
    <StorefrontPageLayout title={t("title")} showBack>
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground text-lg">{t("loading")}</div>
      </div>
    </StorefrontPageLayout>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchPageContent />
    </Suspense>
  )
}
