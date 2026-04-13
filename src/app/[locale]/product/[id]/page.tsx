"use client"

// 2026-04-13: 更新为使用 next-intl 国际化

import { useState } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ShieldCheck, Truck, ShoppingCart, Heart, ShoppingBag } from "lucide-react"
import { EnhancedCheckoutModal } from "@/components/checkout/EnhancedCheckoutModal"
import { useCartStore } from "@/stores/useCartStore"
import { useWishlistStore } from "@/stores/useWishlistStore"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { FEATURED_PRODUCTS } from "@/components/storefront/HomeCarousel"
import { ShareMenu } from "@/components/storefront/ShareMenu"

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('product.notFound')}</h1>
          <Button onClick={() => router.push('/')}>{t('common.backToHome')}</Button>
        </div>
      </div>
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-red-500/5 to-pink-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[1440px] mx-auto relative">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="px-4 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <span className="text-xl font-bold text-foreground hidden sm:block">{t('nav.shopName')}</span>
                </Link>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? "☀️" : "🌙"}
                </Button>
                <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/cart")}>
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">{t('nav.home')}</Link>
            <span>/</span>
            <span className="text-foreground">{detailProduct.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="relative aspect-square bg-muted rounded-2xl overflow-hidden">
                <Image
                  src={detailProduct.image}
                  alt={detailProduct.name}
                  fill
                  className="object-cover"
                  priority={true}
                />
                <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 border-none text-lg px-4 py-1">
                  {t('product.limitedOffer')}
                </Badge>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-1 text-yellow-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                  <span className="text-muted-foreground text-sm ml-2">({detailProduct.reviews} {t('product.reviews')})</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold leading-tight">{detailProduct.name}</h1>
              </div>

              <div className="flex items-end space-x-4">
                <span className="text-4xl lg:text-5xl font-black text-red-600 dark:text-red-500">${detailProduct.price}</span>
                <span className="text-xl text-muted-foreground line-through mb-1">${detailProduct.originalPrice}</span>
                <Badge variant="destructive" className="text-lg px-3 py-1">{Math.round((1 - detailProduct.price / detailProduct.originalPrice) * 100)}% OFF</Badge>
              </div>

              <p className="text-muted-foreground text-lg leading-relaxed">
                {detailProduct.description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <CardContent className="flex items-center gap-3 p-4">
                    <Truck className="w-6 h-6 text-green-600 dark:text-green-500" />
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-400">{t('product.freeShipping')}</p>
                      <p className="text-sm text-green-600 dark:text-green-500">{t('product.freeOnAllOrders')}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="flex items-center gap-3 p-4">
                    <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                    <div>
                      <p className="font-medium text-blue-700 dark:text-blue-400">{t('product.returns')}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-500">{t('product.hassleFreeReturns')}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 rounded-full border-2"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {t('cart.addToCart')}
                </Button>
                <Button
                  size="lg"
                  className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200 dark:shadow-red-900"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  {t('product.buyNow')}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className={`rounded-full border-2 ${inWishlist ? 'bg-red-100 border-red-300' : ''}`}
                  onClick={() => toggleWishlist(product.id)}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <ShareMenu
                  title={shareTitle}
                  text={shareText}
                  url={shareUrl}
                />
              </div>

              <Card className="mt-8">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">{t('product.details')}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">{t('product.sku')}</span>
                      <span>{product.id}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">{t('product.rating')}</span>
                      <span className="text-yellow-500">{detailProduct.rating} / 5.0</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">{t('product.sales')}</span>
                      <span>{detailProduct.sales} {t('product.units')}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
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
  )
}
