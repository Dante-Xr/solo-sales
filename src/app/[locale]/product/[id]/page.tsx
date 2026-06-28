"use client"

/**
 * 修改时间：2026-05-02 18:13:41 +08:00
 * 修改内容：修复商品详情页渲染期间调用 Date.now 的 purity lint 错误，使用模块级默认倒计时。
 * 修改模型：gpt-5.5
 */

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { useRouter, Link } from "@/i18n/navigation"
import useEmblaCarousel from 'embla-carousel-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Star, ShoppingCart, Heart, ShoppingBag, ArrowLeft, Sun, Moon, ChevronDown, ChevronUp, X, ZoomIn } from "lucide-react"
import { EnhancedCheckoutModal } from "@/components/checkout/EnhancedCheckoutModal"
import { useCartStore } from "@/stores/useCartStore"
import { useWishlistStore } from "@/stores/useWishlistStore"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { ProductItem } from "@/components/storefront/HomeCarouselClient"
import { ShareMenu } from "@/components/storefront/ShareMenu"
import { ViewportWrapper } from "@/components/storefront/ViewportWrapper"
import { LanguageSwitcher } from "@/components/storefront/LanguageSwitcher"
import { ViewportModeToggle } from "@/components/storefront/ViewportModeToggle"
import { MobileMenu } from "@/components/storefront/MobileMenu"
import { VariantSelector, SelectedVariant } from "@/components/product/VariantSelector"
import { RelatedProducts } from "@/components/product/RelatedProducts"
import { TrustBar } from "@/components/product/TrustBadges"
import { ProductReviews } from "@/components/product/ProductReviews"
import { CountdownTimer } from "@/components/product/CountdownTimer"
import { StockBadge } from "@/components/product/StockBadge"
import { RecentPurchases } from "@/components/storefront/RecentPurchases"
import Image from "next/image"

// 默认促销结束时间只在模块加载时计算一次，避免组件渲染期间调用非纯函数。
const DEFAULT_SALE_END = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations()
  const { theme, setTheme } = useTheme()
  const { addToCart, cartCount } = useCartStore()
  const { isInWishlist, toggleWishlist } = useWishlistStore()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [product, setProduct] = useState<ProductItem | null>(null)
  const [productImages, setProductImages] = useState<string[]>([])
  const [categoryId, setCategoryId] = useState<string>("")
  const [selectedVariant, setSelectedVariant] = useState<SelectedVariant>({})
  const [loading, setLoading] = useState(true)
  const [descExpanded, setDescExpanded] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)

  // 移动端 embla 轮播
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)

  // 监听轮播滑动，同步当前索引
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  useEffect(() => {
    const productId = params.id as string
    if (!productId) return

    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const p = data.data
          const price = typeof p.price === 'object' ? p.price.toNumber ? p.price.toNumber() : Number(p.price) : Number(p.price)
          setProduct({
            id: p.id,
            name: p.name,
            description: p.description,
            price,
            originalPrice: Math.round(price * 1.4 * 100) / 100,
            image: p.images?.[0] || "",
            sales: p._count?.orderItems ?? 0,
            stock: p.stock,
          })
          setProductImages(p.images?.length > 0 ? p.images : [p.images?.[0] || ""])
          setCategoryId(p.categoryId || p.category?.id || "")
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <ViewportWrapper>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          </div>
        </div>
      </ViewportWrapper>
    )
  }

  if (!product) {
    return (
      <ViewportWrapper>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-xl font-bold mb-4">{t('product.notFound')}</h1>
            <Button onClick={() => router.push('/')}>{t('common.backToHome')}</Button>
          </div>
        </div>
      </ViewportWrapper>
    )
  }

  const detailProduct = {
    ...product,
    rating: 4.9,
    reviews: 1248,
    description: product.description || t('product.description'),
  }

  const shareTitle = `${detailProduct.name} - ${t('product.checkThisOut')}`
  const shareText = t('product.shareText', { name: detailProduct.name, price: detailProduct.price })
  const shareUrl = typeof window !== "undefined" ? window.location.href : ""

  const handleAddToCart = () => {
    addToCart({
      id: detailProduct.id,
      name: detailProduct.name,
      price: detailProduct.price,
      image: detailProduct.image,
    })
  }

  const inWishlist = isInWishlist(product.id)
  const discount = Math.round((1 - detailProduct.price / detailProduct.originalPrice) * 100)

  return (
    <ViewportWrapper>
      <div className="min-h-screen bg-background relative pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
        <div className="w-full max-w-[1440px] mx-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b">
            <div className="px-3 md:px-4">
              <div className="flex items-center justify-between h-12">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Button variant="ghost" size="icon" className="w-8 h-8 md:w-9 md:h-9" onClick={() => router.push('/')}>
                    <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                  <Link href="/" className="flex items-center gap-1.5 md:gap-2">
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-br from-brand-gradient-from to-brand-gradient-to flex items-center justify-center">
                      <span className="text-brand-foreground font-bold text-[10px] md:text-xs">S</span>
                    </div>
                    <span className="text-sm md:text-base font-bold text-foreground hidden sm:inline">Solo Sales</span>
                  </Link>
                </div>
                {/* Mobile: Hamburger Menu + Cart */}
                <div className="flex items-center gap-0 md:hidden">
                  <MobileMenu />
                  <Button variant="ghost" size="icon" className="relative w-8 h-8" onClick={() => router.push("/cart")}>
                    <ShoppingBag className="w-4 h-4" />
                    {cartCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-brand text-brand-foreground text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">{cartCount}</span>
                    )}
                  </Button>
                </div>
                {/* Desktop: Original buttons */}
                <div className="hidden md:flex items-center gap-0.5">
                  <ViewportModeToggle />
                  <Button variant="ghost" size="icon" className="w-9 h-9" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button>
                  <LanguageSwitcher />
                  <Button variant="ghost" size="icon" className="relative w-9 h-9" onClick={() => router.push("/cart")}>
                    <ShoppingBag className="w-4 h-4" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-brand text-brand-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="p-3 md:p-6">
            {/* 移动端布局：标题 -> 价格 -> 图片 -> 其他 */}
            <div className="md:hidden">
              {/* 标题和评分 */}
              <div className="mb-2">
                <div className="flex items-center gap-1 text-yellow-500 mb-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                  <span className="text-muted-foreground text-xs ml-1">({detailProduct.reviews})</span>
                </div>
                <h1 className="text-lg font-bold leading-tight">{detailProduct.name}</h1>
              </div>

              {/* 价格 */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-black text-price">${detailProduct.price}</span>
                <span className="text-sm text-muted-foreground line-through">${detailProduct.originalPrice}</span>
                <Badge className="bg-brand text-brand-foreground text-xs">{discount}% OFF</Badge>
              </div>

              {/* 图片画廊 - embla 轮播手势滑动 */}
              <div className="mb-3">
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex">
                    {productImages.map((img, idx) => (
                      <div key={idx} className="flex-none w-full">
                        <div className="relative aspect-square bg-muted rounded-xl overflow-hidden">
                          {productImages.length > 0 && (
                            <Image
                              src={img}
                              alt={`${detailProduct.name} ${idx + 1}`}
                              fill
                              className="object-cover cursor-zoom-in"
                              onClick={() => {
                                setSelectedImageIndex(idx)
                                setShowImageModal(true)
                              }}
                              sizes="(max-width: 768px) 100vw, 50vw"
                              priority={idx === 0}
                            />
                          )}
                          {idx === 0 && (
                            <Badge className="absolute top-2 left-2 bg-brand text-brand-foreground text-xs z-10">{t('product.limitedOffer')}</Badge>
                          )}
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="absolute top-2 right-2 w-9 h-9 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center z-10"
                          >
                            <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedImageIndex(idx)
                              setShowImageModal(true)
                            }}
                            className="absolute bottom-2 right-2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center z-10"
                          >
                            <ZoomIn className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* 指示器小圆点 */}
                {productImages.length > 1 && (
                  <div className="flex justify-center gap-1.5 mt-3">
                    {productImages.map((_, i) => (
                      <button
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${i === selectedIndex ? 'bg-brand w-4' : 'bg-muted-foreground/30'}`}
                        onClick={() => emblaApi?.scrollTo(i)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 库存和倒计时 */}
              <div className="flex items-center gap-2 mb-3">
                <StockBadge stock={product.stock ?? 0} />
                <CountdownTimer targetDate={product.saleEndsAt || DEFAULT_SALE_END} label={t('product.saleEndsIn')} />
              </div>

              {/* 描述 */}
              <div className="mb-3">
                <p className={`text-muted-foreground text-sm leading-relaxed ${descExpanded ? '' : 'line-clamp-3'}`}>{detailProduct.description}</p>
                {detailProduct.description.length > 120 && (
                  <button onClick={() => setDescExpanded(!descExpanded)} className="text-xs text-primary font-medium mt-1 flex items-center gap-0.5">
                    {descExpanded ? t('product.showLess') : t('product.showMore')}
                    {descExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>

              {/* 变体选择 */}
              <div className="mb-3">
                <VariantSelector selectedVariant={selectedVariant} onSelect={setSelectedVariant} />
              </div>

              {/* 信任栏 */}
              <div className="mb-3">
                <TrustBar />
              </div>

              {/* 商品详情 */}
              <Card className="mb-3">
                <CardContent className="p-3">
                  <h3 className="font-bold text-sm mb-2">{t('product.details')}</h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">{t('product.sku')}</span><span className="text-xs">{product.id.slice(0, 8)}...</span></div>
                    <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">{t('product.rating')}</span><span className="text-yellow-500">{detailProduct.rating} / 5.0</span></div>
                    <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">{t('product.sales')}</span><span>{detailProduct.sales} {t('product.units')}</span></div>
                    <div className="flex justify-between py-1"><span className="text-muted-foreground">{t('product.stock')}</span><span className="text-green-600">{t('product.inStock')}</span></div>
                  </div>
                </CardContent>
              </Card>

              {/* 分享 */}
              <div className="mb-3">
                <ShareMenu title={shareTitle} text={shareText} url={shareUrl} />
              </div>
            </div>

            {/* PC端布局：左图右信息 */}
            <div className="hidden md:flex md:gap-6 lg:gap-8">
              {/* 左侧图片 */}
              <div className="md:w-1/2 lg:w-5/12 md:sticky md:top-16 md:self-start">
                <div className="relative aspect-[4/3] bg-muted rounded-xl overflow-hidden">
                  {productImages.length > 0 && (
                    <Image
                      src={productImages[selectedImageIndex]}
                      alt={detailProduct.name}
                      fill
                      className="object-cover cursor-zoom-in"
                      onClick={() => setShowImageModal(true)}
                      sizes="50vw"
                      priority
                    />
                  )}
                  <Badge className="absolute top-3 left-3 bg-brand text-brand-foreground z-10">{t('product.limitedOffer')}</Badge>
                  <button onClick={() => toggleWishlist(product.id)} className="absolute top-3 right-3 w-9 h-9 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center z-10">
                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>
                {productImages.length > 1 && (
                  <div className="flex gap-2 mt-3">
                    {productImages.map((img, idx) => (
                      <button key={idx} onClick={() => setSelectedImageIndex(idx)} className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 ${idx === selectedImageIndex ? 'border-primary' : 'border-transparent'}`}>
                        <Image src={img} alt={`${detailProduct.name} ${idx + 1}`} fill className="object-cover" sizes="80px" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 右侧信息 */}
              <div className="md:w-1/2 lg:w-7/12">
                <div className="mb-3">
                  <div className="flex items-center gap-1 text-yellow-500 mb-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                    <span className="text-muted-foreground text-xs ml-1">({detailProduct.reviews})</span>
                  </div>
                  <h1 className="text-xl lg:text-2xl font-bold leading-tight">{detailProduct.name}</h1>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-black text-price">${detailProduct.price}</span>
                  <span className="text-base text-muted-foreground line-through">${detailProduct.originalPrice}</span>
                  <Badge className="bg-brand text-brand-foreground">{discount}% OFF</Badge>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <StockBadge stock={product.stock ?? 0} />
                  <CountdownTimer targetDate={product.saleEndsAt || DEFAULT_SALE_END} label={t('product.saleEndsIn')} />
                </div>

                <div className="mb-4">
                  <VariantSelector selectedVariant={selectedVariant} onSelect={setSelectedVariant} />
                </div>

                <div className="flex gap-2 mb-4">
                  <Button variant="outline" className="flex-1 rounded-full h-11 border-brand text-brand hover:bg-brand/5" onClick={handleAddToCart}>
                    <ShoppingCart className="w-4 h-4 mr-2" />{t('cart.addToCart')}
                  </Button>
                  <Button className="flex-1 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground h-11" onClick={() => setIsCheckoutOpen(true)}>
                    {t('product.buyNow')}
                  </Button>
                </div>

                {/* 信任栏 - 独立显示在 Tabs 上方 */}
                <div className="mb-4">
                  <TrustBar />
                </div>

                {/* PC端信息 Tabs：描述 | 规格 | 评价 */}
                <Tabs defaultValue="description" className="mb-4">
                  <TabsList variant="line">
                    <TabsTrigger value="description">{t('product.description')}</TabsTrigger>
                    <TabsTrigger value="specs">{t('product.specifications')}</TabsTrigger>
                    <TabsTrigger value="reviews">{t('product.reviews')}</TabsTrigger>
                  </TabsList>
                  {/* 描述 Tab */}
                  <TabsContent value="description" className="mt-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">{detailProduct.description}</p>
                  </TabsContent>
                  {/* 规格 Tab */}
                  <TabsContent value="specs" className="mt-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-1.5 border-b"><span className="text-muted-foreground">{t('product.sku')}</span><span>{product.id.slice(0, 8)}...</span></div>
                          <div className="flex justify-between py-1.5 border-b"><span className="text-muted-foreground">{t('product.rating')}</span><span className="text-yellow-500">{detailProduct.rating} / 5.0</span></div>
                          <div className="flex justify-between py-1.5 border-b"><span className="text-muted-foreground">{t('product.sales')}</span><span>{detailProduct.sales} {t('product.units')}</span></div>
                          <div className="flex justify-between py-1.5"><span className="text-muted-foreground">{t('product.stock')}</span><span className="text-green-600">{t('product.inStock')}</span></div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  {/* 评价 Tab */}
                  <TabsContent value="reviews" className="mt-4">
                    <ProductReviews productId={product.id} />
                  </TabsContent>
                </Tabs>

                <div className="mb-4">
                  <ShareMenu title={shareTitle} text={shareText} url={shareUrl} />
                </div>
              </div>
            </div>

            {/* 底部内容 - ProductReviews 在 PC 端已移入 Tabs，仅移动端显示 */}
            <div className="mt-6 space-y-6">
              {categoryId && <RelatedProducts categoryId={categoryId} currentProductId={product.id} />}
              <div className="md:hidden">
                <ProductReviews productId={product.id} />
              </div>
            </div>
          </main>
        </div>

        {/* 移动端底部购买栏 */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t md:hidden safe-area-pb">
          <div className="flex items-center gap-2 p-2 px-3">
            <div className="flex-shrink-0">
              <div className="text-lg font-black text-price">${detailProduct.price}</div>
              <div className="text-xs text-muted-foreground line-through">${detailProduct.originalPrice}</div>
            </div>
            <Button variant="outline" size="sm" className="flex-1 rounded-full h-10 border-brand text-brand hover:bg-brand/5" onClick={handleAddToCart}>
              <ShoppingCart className="w-4 h-4 mr-1" />{t('cart.addToCart')}
            </Button>
            <Button size="sm" className="flex-1 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground h-10" onClick={() => setIsCheckoutOpen(true)}>
              {t('product.buyNow')}
            </Button>
          </div>
        </div>

        {/* 图片大图弹窗 */}
        {showImageModal && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={() => setShowImageModal(false)}>
            <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center" onClick={() => setShowImageModal(false)}>
              <X className="w-6 h-6 text-white" />
            </button>
            <div className="relative w-full h-full max-w-4xl max-h-[80vh] m-4">
              <Image src={productImages[selectedImageIndex]} alt={detailProduct.name} fill className="object-contain" sizes="100vw" />
            </div>
            {productImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {productImages.map((img, idx) => (
                  <button key={idx} onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(idx); }} className={`w-12 h-12 rounded-xl overflow-hidden border-2 ${idx === selectedImageIndex ? 'border-white' : 'border-white/30'}`}>
                    <Image src={img} alt={`${detailProduct.name} ${idx + 1}`} width={48} height={48} className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <EnhancedCheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} product={detailProduct} />
        <RecentPurchases />
      </div>
    </ViewportWrapper>
  )
}
