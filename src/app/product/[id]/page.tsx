"use client"

import { useState } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ShieldCheck, Truck, ChevronLeft, ShoppingCart, Heart } from "lucide-react"
import { EnhancedCheckoutModal } from "@/components/checkout/EnhancedCheckoutModal"
import { useCart } from "@/context/CartContext"
import { useWishlist } from "@/context/WishlistContext"
import { useLanguage } from "@/context/LanguageContext"
import { FEATURED_PRODUCTS } from "@/components/storefront/HomeCarousel"
import { ShareMenu } from "@/components/storefront/ShareMenu"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { language } = useLanguage()
  const isZh = language === "zh"
  const { addToCart, cartCount } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  // 查找对应商品
  const product = FEATURED_PRODUCTS.find(p => p.id === params.id)

  if (!product) {
    return <div className="p-8 text-center">{isZh ? "商品未找到" : "Product not found"}</div>
  }

  // 补全商品详细信息（Mock）
  const detailProduct = {
    ...product,
    rating: 4.9,
    reviews: 1248,
    description: isZh
      ? "专为TikTok用户定制。小巧便携，支持RGB氛围灯效。静音运行，适合办公桌、床头使用。现在购买即享包邮服务！"
      : "Designed for TikTok users. Compact and portable with RGB ambient lighting. Quiet operation, perfect for desk or bedside use. Free shipping on all orders!",
  }

  const shareTitle = `${detailProduct.name} - ${isZh ? "发现好物" : "Check this out"}`
  const shareText = isZh
    ? `发现一个超赞的商品！${detailProduct.name} 只要 $${detailProduct.price}！`
    : `Check out this amazing product! ${detailProduct.name} for just $${detailProduct.price}!`
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

  const handleToggleWishlist = () => {
    toggleWishlist(product.id)
  }

  return (
    <div className="min-h-screen bg-muted flex justify-center">
      <main className="w-full max-w-md bg-card text-card-foreground min-h-screen shadow-xl flex flex-col relative pb-24">
        {/* 顶部导航 */}
        <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-50">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-bold truncate px-2">{detailProduct.name}</h1>
          <Button variant="ghost" size="icon" className="relative" onClick={() => router.push('/cart')}>
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
        </header>

        <div className="overflow-y-auto">
          {/* 商品主图 */}
          <div className="relative aspect-square bg-muted w-full overflow-hidden">
            <Image
              src={detailProduct.image}
              alt={detailProduct.name}
              fill
              className="object-cover"
              priority={true}
            />
            <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 border-none">
              {isZh ? "限时特惠" : "Limited Offer"}
            </Badge>
          </div>

          {/* 商品详情 */}
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-1 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
              <span className="text-muted-foreground text-sm ml-2">({detailProduct.reviews} {isZh ? "评价" : "reviews"})</span>
            </div>

            <h1 className="text-xl font-bold leading-tight">{detailProduct.name}</h1>

            <div className="flex items-end space-x-2">
              <span className="text-3xl font-black text-red-600 dark:text-red-500">${detailProduct.price}</span>
              <span className="text-lg text-muted-foreground line-through mb-1">${detailProduct.originalPrice}</span>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed">
              {detailProduct.description}
            </p>

            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground p-2 bg-muted rounded-md">
                <Truck className="w-4 h-4 text-green-600 dark:text-green-500" />
                <span>{isZh ? "全场包邮" : "Free Shipping"}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground p-2 bg-muted rounded-md">
                <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-500" />
                <span>{isZh ? "30天退换" : "30-Day Returns"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 底部购买悬浮栏 */}
        <div className="fixed bottom-0 w-full max-w-md bg-card border-t p-4 flex gap-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-50">
          {/* 收藏按钮 */}
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full border-gray-300 ${inWishlist ? 'bg-red-500 hover:bg-red-600 border-red-500' : ''}`}
            onClick={handleToggleWishlist}
          >
            <Heart className={`w-5 h-5 ${inWishlist ? 'fill-white text-white' : ''}`} />
          </Button>
          {/* 分享按钮 */}
          <ShareMenu
            title={shareTitle}
            text={shareText}
            url={shareUrl}
            isZh={isZh}
          />
          <Button variant="outline" size="lg" className="flex-1 rounded-full border-gray-300" onClick={handleAddToCart}>
            {isZh ? "加入购物车" : "Add to Cart"}
          </Button>
          <Button
            size="lg"
            className="flex-1 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200"
            onClick={() => setIsCheckoutOpen(true)}
          >
            {isZh ? "立即购买" : "Buy Now"}
          </Button>
        </div>

        <EnhancedCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          product={detailProduct}
        />
      </main>
    </div>
  )
}
