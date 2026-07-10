"use client"

import Image from "next/image"
import { useMemo, useState, type ReactNode } from "react"
import { motion, type Variants } from "framer-motion"
import { useTranslations } from "next-intl"
import {
  BadgeCheck,
  ChevronRight,
  Compass,
  Heart,
  House,
  Laptop,
  PackageCheck,
  Search,
  ShieldCheck,
  Shirt,
  Sparkles,
  Star,
  Truck,
  type LucideIcon,
} from "lucide-react"
import { useRouter } from "@/i18n/navigation"
import type { ProductItem } from "@/components/storefront/HomeCarouselClient"
import { useCartStore } from "@/stores/useCartStore"
import { toast } from "sonner"

type CategorySummary = { id: string; name: string }

type CategoryTheme = {
  Icon: LucideIcon
  gradient: string
}

const CATEGORY_THEMES: CategoryTheme[] = [
  { Icon: Laptop, gradient: "from-indigo-100 to-cyan-100 text-indigo-600" },
  { Icon: House, gradient: "from-orange-100 to-amber-100 text-orange-600" },
  { Icon: Sparkles, gradient: "from-pink-100 to-rose-100 text-rose-600" },
  { Icon: Shirt, gradient: "from-violet-100 to-fuchsia-100 text-violet-600" },
  { Icon: BadgeCheck, gradient: "from-emerald-100 to-cyan-100 text-emerald-600" },
  { Icon: Compass, gradient: "from-orange-100 to-red-100 text-orange-600" },
]

const CATEGORY_TRANSLATION_KEYS: Record<string, "smartHome" | "digitalAccessories" | "fitness" | "creativeLife"> = {
  "Smart Home": "smartHome",
  "Digital Accessories": "digitalAccessories",
  Fitness: "fitness",
  "Creative Life": "creativeLife",
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

function displaySales(sales: number) {
  return sales >= 1000 ? `${(sales / 1000).toFixed(1)}k+` : `${sales}`
}

function displayImage(product: ProductItem) {
  return product.image || "https://picsum.photos/seed/solo-sales-product/800/800"
}

export function StorefrontExperience({
  products,
  categories,
}: {
  products: ProductItem[]
  categories: CategorySummary[]
}) {
  const router = useRouter()
  const t = useTranslations("storefront")
  const addToCart = useCartStore((state) => state.addToCart)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [wishlist, setWishlist] = useState<string[]>([])

  const visibleProducts = useMemo(
    () => activeCategory ? products.filter((product) => product.categoryId === activeCategory) : products,
    [activeCategory, products]
  )

  const toggleWishlist = (id: string) => {
    setWishlist((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  const addProduct = (product: ProductItem) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: displayImage(product),
    })
    toast.success(t("addedToCart"))
  }

  return (
    <div className="storefront-page pb-16 md:pb-0">
      <section className="relative overflow-hidden bg-[#080e28] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(130deg,#080e28_0%,#141038_40%,#7b1025_80%,#9e0f2e_100%)]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgb(255_255_255/0.6)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.6)_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_50%,rgb(184_19_42/0.28)_0%,transparent_70%)]" />
        <div className="storefront-container relative grid min-h-[500px] items-center gap-12 py-14 sm:py-20 lg:grid-cols-2 lg:py-24">
          <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-xl">
            <motion.p variants={fadeUp} className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
              <span aria-hidden>🔥</span> {t("heroBadge")}
            </motion.p>
            <motion.h1 variants={fadeUp} className="font-serif text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              {t("heroTitle")}
              <span className="block text-rose-300">{t("heroHighlight")}</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-md text-sm leading-7 text-white/70 sm:text-base">
              {t("heroDescription")}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => document.getElementById("featured-products")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0c1022] shadow-lg shadow-black/25 transition-transform hover:bg-white/90 hover:scale-[1.02]">
                {t("shopNow")} <ChevronRight className="size-4" />
              </button>
              <button onClick={() => router.push("/about")} className="inline-flex min-h-11 items-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                {t("learnMore")}
              </button>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-10 flex gap-7 border-t border-white/15 pt-6 sm:gap-10">
              {[["50k+", t("satisfiedCustomers")], ["4.9", t("averageRating")], ["99%", t("positiveReviews")]].map(([value, label]) => (
                <div key={label}>
                  <p className="text-xl font-bold sm:text-2xl">{value}</p>
                  <p className="mt-1 text-[11px] text-white/50">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative hidden h-80 items-center justify-center lg:flex">
            <div className="flex size-44 items-center justify-center rounded-3xl border border-white/20 bg-white/10 text-6xl shadow-2xl backdrop-blur-md">🛍️</div>
            <FloatingTrust className="right-4 top-3" icon={<Star className="size-5 fill-amber-400 text-amber-400" />} title={t("rating")} detail={t("userRating")} delay={0.2} />
            <FloatingTrust className="left-0 top-1/3" icon={<PackageCheck className="size-5 text-rose-500" />} title={t("sold", { count: "10k+" })} detail={t("monthlySales")} delay={0.4} />
            <FloatingTrust className="bottom-5 right-1" icon={<Truck className="size-5 text-sky-500" />} title={t("freeShipping")} detail={t("freeShippingDetail")} delay={0.6} />
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-6 left-8 rounded-2xl bg-gradient-to-r from-rose-600 to-orange-500 px-4 py-3 shadow-xl">
              <p className="text-sm font-bold">{t("specialOffer")}</p><p className="text-[10px] text-white/70">{t("specialOfferDetail")}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <main id="featured-products" className="storefront-container py-12 sm:py-16">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold tracking-[0.14em] text-accent">{t("featuredEyebrow")}</p>
            <h2 className="font-serif text-3xl font-bold sm:text-4xl">{t("featuredTitle")}</h2>
          </div>
          <button onClick={() => router.push("/products")} className="hidden items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">{t("viewAll")} <ChevronRight className="size-4" /></button>
        </div>

        {categories.length > 0 && (
          <div className="mb-8 overflow-x-auto pb-2 [scrollbar-width:none]">
            <div className="flex min-w-max gap-2 sm:flex-wrap">
              {categories.map((category, index) => {
                const theme = CATEGORY_THEMES[index % CATEGORY_THEMES.length]
                const isActive = activeCategory === category.id
                const translationKey = CATEGORY_TRANSLATION_KEYS[category.name]
                const categoryLabel = translationKey ? t(`categories.${translationKey}`) : category.name
                return <motion.button key={category.id} whileTap={{ scale: 0.95 }} onClick={() => setActiveCategory(isActive ? null : category.id)} className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition-all ${isActive ? "border-primary bg-primary text-primary-foreground shadow-md" : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"}`}>
                  <span className={`flex size-7 items-center justify-center rounded-full bg-gradient-to-br ${theme.gradient}`}><theme.Icon className="size-4" /></span>{categoryLabel}
                </motion.button>
              })}
            </div>
          </div>
        )}

        {visibleProducts.length === 0 ? (
          <div className="surface-panel flex min-h-56 flex-col items-center justify-center px-6 text-center"><Search className="size-8 text-muted-foreground" /><h3 className="mt-4 font-semibold">{t("emptyCategory")}</h3><button onClick={() => setActiveCategory(null)} className="mt-4 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">{t("viewAllProducts")}</button></div>
        ) : (
          <motion.div key={activeCategory ?? "all"} variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-5">
            {visibleProducts.map((product) => {
              const wished = wishlist.includes(product.id)
              const discount = product.originalPrice > product.price ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
              return <motion.article key={product.id} variants={fadeUp} whileHover={{ y: -4 }} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-xl">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <button className="absolute inset-0 z-0" onClick={() => router.push(`/product/${product.id}`)} aria-label={t("viewProduct", { name: product.name })} />
                  <Image src={displayImage(product)} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  {discount > 0 && <span className="absolute left-2.5 top-2.5 rounded-full bg-gradient-to-r from-rose-600 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">-{discount}%</span>}
                  <button onClick={() => toggleWishlist(product.id)} aria-label={wished ? t("removeFromWishlist") : t("addToWishlist")} className="absolute right-2.5 top-2.5 z-10 flex size-8 items-center justify-center rounded-full bg-white/90 text-[#6b6a72] shadow-sm backdrop-blur-sm"><Heart className={`size-4 ${wished ? "fill-rose-500 text-rose-500" : ""}`} /></button>
                  <button onClick={() => addProduct(product)} className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-transform duration-300 group-hover:translate-y-0">{t("addToCart")}</button>
                </div>
                <div className="p-3 sm:p-4"><p className="truncate text-[10px] text-muted-foreground">{product.categoryName ? (CATEGORY_TRANSLATION_KEYS[product.categoryName] ? t(`categories.${CATEGORY_TRANSLATION_KEYS[product.categoryName]}`) : product.categoryName) : t("featuredProduct")}</p><h3 className="mt-1 min-h-10 text-xs font-semibold leading-5 sm:text-sm">{product.name}</h3><div className="mt-2 flex items-center gap-1"><Star className="size-3 fill-amber-400 text-amber-400" /><span className="text-[10px] text-muted-foreground">{t("sold", { count: displaySales(product.sales) })}</span></div><div className="mt-2 flex items-baseline justify-between gap-1"><span className="text-sm font-bold text-price sm:text-base">${product.price.toFixed(2)}</span>{product.originalPrice > product.price && <span className="text-[10px] text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>}</div></div>
              </motion.article>
            })}
          </motion.div>
        )}
      </main>

      <section className="border-y border-border bg-card"><div className="storefront-container grid grid-cols-2 gap-6 py-9 sm:grid-cols-4">{[
        [Truck, t("freeShipping"), t("freeShippingDetail"), "from-blue-100 to-cyan-100 text-sky-600"],
        [ShieldCheck, t("securePayment"), t("securePaymentDetail"), "from-emerald-100 to-teal-100 text-emerald-600"],
        [Star, t("qualityGuarantee"), t("qualityGuaranteeDetail"), "from-amber-100 to-orange-100 text-amber-600"],
        [PackageCheck, t("easyReturns"), t("easyReturnsDetail"), "from-violet-100 to-indigo-100 text-violet-600"],
      ].map(([Icon, title, detail, color]) => { const FeatureIcon = Icon as LucideIcon; return <div key={title as string} className="flex items-start gap-3"><span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${color as string}`}><FeatureIcon className="size-5" /></span><div><p className="text-sm font-semibold">{title as string}</p><p className="mt-0.5 text-xs text-muted-foreground">{detail as string}</p></div></div> })}</div></section>
    </div>
  )
}

function FloatingTrust({ className, icon, title, detail, delay }: { className: string; icon: ReactNode; title: string; detail: string; delay: number }) {
  return <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3 + delay, delay, repeat: Infinity, ease: "easeInOut" }} className={`absolute flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-[#0c1022] shadow-xl ${className}`}><span>{icon}</span><div><p className="text-xs font-bold">{title}</p><p className="text-[10px] text-[#6b6a72]">{detail}</p></div></motion.div>
}
