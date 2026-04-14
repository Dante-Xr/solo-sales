"use client"

import { useState } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useRouter, Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ShieldCheck, Truck, ShoppingCart, Heart, ShoppingBag, ArrowLeft, Sun, Moon } from "lucide-react"
import { EnhancedCheckoutModal } from "@/components/checkout/EnhancedCheckoutModal"
import { useCartStore } from "@/stores/useCartStore"
import { useWishlistStore } from "@/stores/useWishlistStore"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { FEATURED_PRODUCTS } from "@/components/storefront/HomeCarousel"
import { ShareMenu } from "@/components/storefront/ShareMenu"
import { ViewportWrapper } from "@/components/storefront/ViewportWrapper"
import { LanguageSwitcher } from "@/components/storefront/LanguageSwitcher"
import { ViewportModeToggle } from "@/components/storefront/ViewportModeToggle"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations()
  const { theme, setTheme } = useTheme()
  const { addToCart, cartCount } = useCartStore()
  const { isInWishlist, toggleWishlist } = useWishlistStore()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const product = FEATURED_PRODUCTS.find(p => p.id === params.id)

  if (!product) {
    return (
      <ViewportWrapper>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
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
    description: t('product.description'),
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

  return (
    <ViewportWrapper>
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[1440px] mx-auto relative">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="px-3">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9 hover:bg-accent active:bg-accent/80 transition-colors"
                  onClick={() => router.push('/')}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">S</span>
                  </div>
                  <span className="text-base font-bold text-foreground">Solo Sales</span>
                </Link>
              </div>

              <div className="flex items-center gap-0.5">
                <ViewportModeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-foreground" />
                  ) : (
                    <Moon className="w-4 h-4 text-foreground" />
                  )}
                </Button>
                <LanguageSwitcher />
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative w-9 h-9"
                  onClick={() => router.push("/cart")}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="p-3">
          <div className="space-y-4">
            <div className="relative aspect-square bg-muted rounded-xl overflow-hidden">
              <Image
                src={detailProduct.image}
                alt={detailProduct.name}
                fill
                className="object-cover"
                priority={true}
              />
              <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 border-none text-sm px-3 py-0.5">
                {t('product.limitedOffer')}
              </Badge>
              <button
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-3 right-3 w-9 h-9 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-1 text-yellow-500 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                  <span className="text-muted-foreground text-xs ml-1">({detailProduct.reviews})</span>
                </div>
                <h1 className="text-lg font-bold leading-tight line-clamp-2">{detailProduct.name}</h1>
              </div>

              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-red-600 dark:text-red-500">${detailProduct.price}</span>
                <span className="text-sm text-muted-foreground line-through mb-0.5">${detailProduct.originalPrice}</span>
                <Badge variant="destructive" className="text-xs px-2 py-0.5">{Math.round((1 - detailProduct.price / detailProduct.originalPrice) * 100)}% OFF</Badge>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                {detailProduct.description}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <CardContent className="flex items-center gap-2 p-3">
                    <Truck className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-green-700 dark:text-green-400">{t('product.freeShipping')}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="flex items-center gap-2 p-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-400">{t('product.returns')}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="default"
                  className="flex-1 rounded-full border-2 text-sm h-11"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-4 h-4 mr-1.5" />
                  {t('cart.addToCart')}
                </Button>
                <Button
                  size="default"
                  className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg text-sm h-11"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  {t('product.buyNow')}
                </Button>
              </div>

              <div className="flex gap-2">
                <ShareMenu
                  title={shareTitle}
                  text={shareText}
                  url={shareUrl}
                />
              </div>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold text-sm mb-3">{t('product.details')}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1.5 border-b">
                      <span className="text-muted-foreground">{t('product.sku')}</span>
                      <span className="truncate ml-2">{product.id}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b">
                      <span className="text-muted-foreground">{t('product.rating')}</span>
                      <span className="text-yellow-500">{detailProduct.rating} / 5.0</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b">
                      <span className="text-muted-foreground">{t('product.sales')}</span>
                      <span>{detailProduct.sales} {t('product.units')}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">{t('product.stock')}</span>
                      <span className="text-green-600">{t('product.inStock')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <EnhancedCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={detailProduct}
      />
    </div>
    </ViewportWrapper>
  )
}
