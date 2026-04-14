"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter, Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, Sun, Moon } from "lucide-react"
import { useCartStore } from "@/stores/useCartStore"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { EnhancedCheckoutModal } from "@/components/checkout/EnhancedCheckoutModal"
import { ViewportWrapper } from "@/components/storefront/ViewportWrapper"
import { LanguageSwitcher } from "@/components/storefront/LanguageSwitcher"
import { ViewportModeToggle } from "@/components/storefront/ViewportModeToggle"

export default function CartPage() {
  const router = useRouter()
  const t = useTranslations()
  const { theme, setTheme } = useTheme()
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCartStore()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

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
                <Button variant="ghost" size="icon" className="relative w-9 h-9" onClick={() => router.push("/cart")}>
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
          <h1 className="text-lg font-bold mb-3">{t('cart.title')} ({cart.length})</h1>

          <div className="bg-card rounded-xl border shadow-sm">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <ShoppingBag className="w-10 h-10 mb-3 text-muted-foreground/50" />
                <p className="mb-3 text-sm">{t('cart.empty')}</p>
                <Button onClick={() => router.push('/')} size="default" className="text-sm">{t('common.shopNow')}</Button>
              </div>
            ) : (
              <div className="divide-y">
                {cart.map((item) => (
                  <div key={item.id} className="p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-xs line-clamp-2">{item.name}</h3>
                      <p className="text-red-600 dark:text-red-500 font-bold mt-0.5 text-sm">${item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border rounded-lg">
                        <button
                          className="px-2 py-1 hover:bg-accent text-muted-foreground transition-colors"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-medium">{item.quantity}</span>
                        <button
                          className="px-2 py-1 hover:bg-accent text-muted-foreground transition-colors"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive w-8 h-8"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="mt-4">
              <div className="bg-card rounded-xl border shadow-sm p-4">
                <h2 className="text-base font-bold mb-3">{t('checkout.orderSummary')}</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>{t('checkout.orderSummary')}</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>{t('checkout.orderTotal')}</span>
                    <span className="text-green-600">{t('common.none')}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-base">
                    <span>{t('common.total')}</span>
                    <span className="text-red-600 dark:text-red-500">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  size="default"
                  className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg text-sm h-11"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  {t('cart.checkout')}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-3">
                  {t('checkout.secureCheckout')}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <EnhancedCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={{ name: `${t('cart.title')} (${cart.length})`, price: cartTotal }}
        isCart={true}
        cartItems={cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity }))}
        cartTotal={cartTotal}
      />
    </div>
    </ViewportWrapper>
  )
}
