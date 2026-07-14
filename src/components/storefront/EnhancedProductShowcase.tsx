"use client"

import * as React from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Heart,
  House,
  Laptop,
  PackagePlus,
  Shirt,
  Sparkles,
  Star,
  Watch,
} from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useCartStore } from "@/stores/useCartStore"
import type { ProductItem } from "./HomeCarouselClient"

export type StorefrontCategory = {
  id: string
  name: string
}

const CATEGORY_STYLES = [
  { icon: House, className: "bg-sky-100 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300" },
  { icon: Laptop, className: "bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300" },
  { icon: Watch, className: "bg-rose-100 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300" },
  { icon: Shirt, className: "bg-violet-100 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300" },
  { icon: Sparkles, className: "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300" },
]

const CATEGORY_TRANSLATION_KEYS: Record<string, string> = {
  technology: "categoryTechnology",
  lifestyle: "categoryLifestyle",
  "smart home": "categorySmartHome",
  "digital accessories": "categoryDigitalAccessories",
  fitness: "categoryFitness",
  "creative life": "categoryCreativeLife",
}

function discountFor(product: ProductItem) {
  if (!product.originalPrice || product.originalPrice <= product.price) return 0
  return Math.round((1 - product.price / product.originalPrice) * 100)
}

function formatSales(sales: number) {
  return sales >= 1000 ? `${(sales / 1000).toFixed(1)}k` : String(sales)
}

export function EnhancedProductShowcase({
  products,
  categories,
}: {
  products: ProductItem[]
  categories: StorefrontCategory[]
}) {
  const router = useRouter()
  const addToCart = useCartStore((state) => state.addToCart)
  const t = useTranslations("homeEnhance")
  const productT = useTranslations("product")
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null)
  const [wishlist, setWishlist] = React.useState<Set<string>>(() => new Set())

  const availableCategories = React.useMemo(
    () => categories.filter((category) => products.some((product) => product.categoryId === category.id)),
    [categories, products]
  )
  const filteredProducts = React.useMemo(
    () => selectedCategoryId
      ? products.filter((product) => product.categoryId === selectedCategoryId)
      : products,
    [products, selectedCategoryId]
  )

  const displayCategoryName = (name: string) => {
    const translationKey = CATEGORY_TRANSLATION_KEYS[name.trim().toLowerCase()]
    return translationKey ? t(translationKey) : name
  }

  const toggleWishlist = (event: React.MouseEvent<HTMLButtonElement>, productId: string) => {
    event.stopPropagation()
    setWishlist((current) => {
      const next = new Set(current)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  const handleAddToCart = (event: React.MouseEvent<HTMLButtonElement>, product: ProductItem) => {
    event.stopPropagation()
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
    })
    toast.success(t("addedToCart", { name: product.name }))
  }

  return (
    <section id="products" className="bg-background py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-brand">{t("eyebrow")}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-normal text-foreground sm:text-4xl">
              {t("title")}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => router.push("/products")}
            className="min-h-0 text-sm font-medium text-muted-foreground transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {t("viewAll")} <span aria-hidden="true">›</span>
          </button>
        </div>

        {availableCategories.length > 0 && (
          <div className="mt-8 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">
            {availableCategories.map((category, index) => {
              const categoryStyle = CATEGORY_STYLES[index % CATEGORY_STYLES.length]
              const Icon = categoryStyle.icon
              const isSelected = category.id === selectedCategoryId
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(isSelected ? null : category.id)}
                  aria-pressed={isSelected}
                  className={`inline-flex min-h-0 shrink-0 items-center gap-3 rounded-full border px-4 py-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isSelected
                      ? "border-brand bg-brand text-brand-foreground shadow-sm"
                      : "border-border bg-card text-foreground hover:border-brand/50 hover:shadow-sm"
                  }`}
                >
                  <span className={`grid size-8 place-items-center rounded-full ${isSelected ? "bg-white/15 text-white" : categoryStyle.className}`}>
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  {displayCategoryName(category.name)}
                </button>
              )
            })}
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <PackagePlus className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-semibold text-foreground">{t("emptyTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("emptyDescription")}</p>
            <button
              type="button"
              onClick={() => setSelectedCategoryId(null)}
              className="mt-5 min-h-0 text-sm font-semibold text-brand hover:underline"
            >
              {t("clearFilter")}
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredProducts.map((product, index) => {
              const discount = discountFor(product)
              const isWishlisted = wishlist.has(product.id)
              return (
                <motion.article
                  key={product.id}
                  layout
                  initial={false}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.32, delay: Math.min(index * 0.05, 0.25) }}
                  className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-xl"
                >
                  <button
                    type="button"
                    onClick={() => router.push(`/product/${product.id}`)}
                    className="block min-h-0 w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <div className="relative aspect-[1.08] overflow-hidden bg-muted">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {discount > 0 && (
                        <span className="absolute left-4 top-4 rounded-full bg-brand px-2.5 py-1 text-xs font-bold text-brand-foreground">
                          -{discount}%
                        </span>
                      )}
                    </div>
                  </button>
                  <div className="relative p-5">
                    <button
                      type="button"
                      onClick={(event) => toggleWishlist(event, product.id)}
                      aria-label={isWishlisted ? productT("removeFromWishlist") : productT("addToWishlist")}
                      aria-pressed={isWishlisted}
                      className={`absolute -top-6 right-4 grid size-11 min-h-0 place-items-center rounded-full border bg-card shadow-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isWishlisted ? "border-brand text-brand" : "border-border text-muted-foreground"
                      }`}
                    >
                      <Heart className={`size-5 ${isWishlisted ? "fill-current" : ""}`} aria-hidden="true" />
                    </button>
                    <p className="text-sm text-muted-foreground">{product.categoryName ? displayCategoryName(product.categoryName) : t("uncategorized")}</p>
                    <h3 className="mt-2 min-h-[3.5rem] text-lg font-bold leading-snug text-foreground">{product.name}</h3>
                    <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                      <span>{formatSales(product.sales)} {productT("sold")}</span>
                    </div>
                    <div className="mt-5 flex items-end justify-between gap-3">
                      <div>
                        <span className="text-xl font-bold text-price">${product.price.toFixed(2)}</span>
                        {discount > 0 && <span className="ml-2 text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={(event) => handleAddToCart(event, product)}
                        className="inline-flex min-h-0 items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background opacity-100 transition-colors hover:bg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
                      >
                        <PackagePlus className="size-4" aria-hidden="true" />
                        {productT("addToCart")}
                      </button>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </motion.div>
        )}
      </div>
    </section>
  )
}
