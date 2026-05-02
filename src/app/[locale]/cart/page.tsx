/**
 * 修改时间：2026-05-02 21:19:13 +08:00
 * 修改内容：清理购物车页未使用的汇总字段，并将修改说明移动到文件头部。
 * 修改模型：gpt-5.5
 */

"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react"
import { useCartStore } from "@/stores/useCartStore"
import { useTranslations } from "next-intl"
import { EnhancedCheckoutModal } from "@/components/checkout/EnhancedCheckoutModal"
import { StorefrontPageLayout } from "@/components/storefront/StorefrontPageLayout"
import { CouponInput } from "@/components/checkout/CouponInput"
import { UpsellRecommendation } from "@/components/checkout/UpsellRecommendation"
import { SwipeToDelete } from "@/components/storefront/SwipeToDelete"
import { toast } from "sonner"

const FREE_SHIPPING_THRESHOLD = 50

export default function CartPage() {
  const router = useRouter()
  const t = useTranslations()
  const {
    cart, removeFromCart, updateQuantity, toggleSelect, toggleSelectAll,
    removeSelected, selectedTotal, selectedCount, isAllSelected,
  } = useCartStore()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)

  const shippingFee = useMemo(() => (selectedTotal >= FREE_SHIPPING_THRESHOLD ? 0 : 5.99), [selectedTotal])
  const finalTotal = useMemo(() => Math.max(0, selectedTotal - couponDiscount + shippingFee), [selectedTotal, couponDiscount, shippingFee])
  const freeShippingProgress = useMemo(() => Math.min(100, (selectedTotal / FREE_SHIPPING_THRESHOLD) * 100), [selectedTotal])
  const freeShippingRemaining = useMemo(() => Math.max(0, FREE_SHIPPING_THRESHOLD - selectedTotal), [selectedTotal])

  const handleRemoveSelected = () => {
    const count = cart.filter((item) => item.selected).length
    if (count === 0) return
    removeSelected()
    toast.success(t('cart.removedCount', { count }))
  }

  const handleQuantityChange = (id: string, delta: number) => {
    const item = cart.find((i) => i.id === id)
    if (!item) return
    const newQty = item.quantity + delta
    if (newQty < 1) {
      removeFromCart(id)
      toast.success(t('cart.itemRemoved'))
      return
    }
    updateQuantity(id, newQty)
  }

  const CartItemRow = ({ item, isMobile }: { item: typeof cart[number]; isMobile?: boolean }) => {
    const subtotal = item.price * item.quantity
    const discount = item.originalPrice ? (item.originalPrice - item.price) * item.quantity : 0

    return (
      <div className={`flex items-center gap-3 ${isMobile ? 'p-3' : 'p-4'} transition-colors`}>
        {/* 选择框 */}
        <button
          onClick={() => toggleSelect(item.id)}
          className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all ${
            item.selected
              ? 'bg-brand border-brand text-white'
              : 'border-muted-foreground/30 hover:border-brand/50'
          }`}
          aria-label={item.selected ? t('cart.deselect') : t('cart.select')}
        >
          {item.selected && (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6l3 3 5-5" />
            </svg>
          )}
        </button>

        {/* 商品图片 */}
        <div className="w-20 h-20 bg-muted rounded-xl overflow-hidden flex-shrink-0 relative">
          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
        </div>

        {/* 商品信息 */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'} line-clamp-2`}>{item.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-price font-bold text-sm">${item.price.toFixed(2)}</span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-xs text-muted-foreground line-through">${item.originalPrice.toFixed(2)}</span>
            )}
          </div>

          {/* 移动端：数量和小计 */}
          {isMobile && (
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button
                  className="w-9 h-9 flex items-center justify-center hover:bg-accent active:bg-accent/80 text-muted-foreground transition-colors"
                  onClick={() => handleQuantityChange(item.id, -1)}
                  aria-label={t('cart.decrease')}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                <button
                  className="w-9 h-9 flex items-center justify-center hover:bg-accent active:bg-accent/80 text-muted-foreground transition-colors"
                  onClick={() => handleQuantityChange(item.id, 1)}
                  aria-label={t('cart.increase')}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-sm font-bold text-foreground">${subtotal.toFixed(2)}</span>
            </div>
          )}

          {/* PC端：折扣标签 */}
          {!isMobile && discount > 0 && (
            <span className="inline-block mt-1 text-[10px] font-semibold bg-brand/10 text-brand px-1.5 py-0.5 rounded">
              -${discount.toFixed(2)}
            </span>
          )}
        </div>

        {/* PC端：数量调节 + 小计 + 删除 */}
        {!isMobile && (
          <>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                className="w-9 h-9 flex items-center justify-center hover:bg-accent active:bg-accent/80 text-muted-foreground transition-colors"
                onClick={() => handleQuantityChange(item.id, -1)}
                aria-label={t('cart.decrease')}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
              <button
                className="w-9 h-9 flex items-center justify-center hover:bg-accent active:bg-accent/80 text-muted-foreground transition-colors"
                onClick={() => handleQuantityChange(item.id, 1)}
                aria-label={t('cart.increase')}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="w-24 text-right">
              <span className="font-bold text-foreground">${subtotal.toFixed(2)}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive w-7 h-7 flex-shrink-0"
              onClick={() => { removeFromCart(item.id); toast.success(t('cart.itemRemoved')) }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </>
        )}
      </div>
    )
  }

  // 用 render 函数代替组件声明，避免每次渲染创建新组件导致状态被重置。
  const renderOrderSummary = () => (
    <div className="bg-card rounded-xl border shadow-sm p-4">
      <h2 className="text-base font-bold mb-3">{t('checkout.orderSummary')}</h2>

      {/* 免运费进度条 */}
      {freeShippingRemaining > 0 && (
        <div className="mb-4 p-3 bg-brand/5 rounded-lg border border-brand/10">
          <p className="text-xs text-muted-foreground mb-2">
            {t('cart.freeShippingRemaining', { amount: freeShippingRemaining.toFixed(2) })}
          </p>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-gradient-from to-brand-gradient-to rounded-full transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>
      )}
      {freeShippingRemaining <= 0 && selectedTotal > 0 && (
        <div className="mb-4 p-3 bg-success/10 rounded-lg border border-success/20 flex items-center gap-2">
          <Truck className="w-4 h-4 text-success flex-shrink-0" />
          <p className="text-xs font-medium text-success">{t('cart.freeShippingAchieved')}</p>
        </div>
      )}

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>{t('cart.subtotal')} ({selectedCount} {t('cart.items')})</span>
          <span>${selectedTotal.toFixed(2)}</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-success">
            <span>{t('cart.couponDiscount')}</span>
            <span>-${couponDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>{t('cart.shipping')}</span>
          <span>{shippingFee === 0 ? <span className="text-success font-medium">{t('cart.free')}</span> : `$${shippingFee.toFixed(2)}`}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold text-base">
          <span>{t('common.total')}</span>
          <span className="text-price">${finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* 优惠券输入 */}
      <div className="mb-4">
        <CouponInput onApply={(_, discount) => setCouponDiscount(discount)} onRemove={() => setCouponDiscount(0)} />
      </div>

      <Button
        size="default"
        className="w-full rounded-full bg-brand hover:bg-brand/90 text-brand-foreground shadow-lg text-sm h-11"
        onClick={() => setIsCheckoutOpen(true)}
        disabled={selectedCount === 0}
      >
        {t('cart.checkout')} {selectedCount > 0 ? `(${selectedCount})` : ''}
      </Button>

      {/* 信任标识 */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center gap-1 text-center">
          <ShieldCheck className="w-4 h-4 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">{t('cart.securePayment')}</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <Truck className="w-4 h-4 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">{t('cart.freeShippingLabel')}</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">{t('cart.easyReturns')}</span>
        </div>
      </div>

      <p className="text-[10px] text-center text-muted-foreground mt-3">
        {t('checkout.secureCheckout')}
      </p>
    </div>
  )

  // 空购物车视图依赖当前翻译和 router，保留在组件作用域内以复用上下文。
  const renderEmptyCart = () => (
    <div className="bg-card rounded-xl border shadow-sm">
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <ShoppingBag className="w-16 h-16 mb-4 text-muted-foreground/30" />
        <p className="mb-1 text-base font-medium text-foreground">{t('cart.empty')}</p>
        <p className="mb-4 text-sm">{t('cart.emptyHint')}</p>
        <Button onClick={() => router.push('/')} className="rounded-full bg-brand hover:bg-brand/90 text-brand-foreground">
          {t('common.shopNow')} <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  )

  return (
    <StorefrontPageLayout title={t('cart.title')} showBack>
      <div className="p-3 pb-28 md:pb-6">
        {cart.length === 0 ? (
          renderEmptyCart()
        ) : (
          <>
            {/* 全选栏 */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSelectAll}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    isAllSelected
                      ? 'bg-brand border-brand text-white'
                      : 'border-muted-foreground/30 hover:border-brand/50'
                  }`}
                  aria-label={isAllSelected ? t('cart.deselectAll') : t('cart.selectAll')}
                >
                  {isAllSelected && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </button>
                <span className="text-sm text-muted-foreground">
                  {t('cart.selectAll')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {t('cart.selectedCount', { count: selectedCount })}
                </span>
                {selectedCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive h-7 text-xs"
                    onClick={handleRemoveSelected}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    {t('cart.deleteSelected')}
                  </Button>
                )}
              </div>
            </div>

            {/* PC 端双栏布局 */}
            <div className="hidden md:flex md:gap-6">
              <div className="md:w-2/3">
                <div className="bg-card rounded-xl border shadow-sm divide-y">
                  {cart.map((item) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </div>
                <div className="mt-4">
                  <UpsellRecommendation />
                </div>
              </div>
              <div className="md:w-1/3">
                <div className="sticky top-16">
                  {renderOrderSummary()}
                </div>
              </div>
            </div>

            {/* 移动端布局 */}
            <div className="md:hidden">
              <div className="bg-card rounded-xl border shadow-sm divide-y">
                {cart.map((item) => (
                  <SwipeToDelete key={item.id} onDelete={() => { removeFromCart(item.id); toast.success(t('cart.itemRemoved')) }}>
                    <CartItemRow item={item} isMobile />
                  </SwipeToDelete>
                ))}
              </div>
              <div className="mt-4">
                {renderOrderSummary()}
              </div>
              <div className="mt-4">
                <UpsellRecommendation />
              </div>
            </div>
          </>
        )}
      </div>

      {/* 移动端固定底部结账栏 */}
      {cart.length > 0 && selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t md:hidden safe-area-pb">
          <div className="flex items-center gap-3 p-3">
            <div className="flex-shrink-0">
              <div className="text-xl font-black text-price">${finalTotal.toFixed(2)}</div>
              <div className="text-[10px] text-muted-foreground">{t('cart.itemCount', { count: selectedCount })}</div>
            </div>
            <Button
              size="lg"
              className="flex-1 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground h-12"
              onClick={() => setIsCheckoutOpen(true)}
            >
              {t('cart.checkout')} ({selectedCount})
            </Button>
          </div>
        </div>
      )}

      <EnhancedCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={{ name: `${t('cart.title')} (${selectedCount})`, price: finalTotal }}
        isCart={true}
        cartItems={cart.filter((item) => item.selected).map((item) => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity }))}
        cartTotal={finalTotal}
      />
    </StorefrontPageLayout>
  )
}
