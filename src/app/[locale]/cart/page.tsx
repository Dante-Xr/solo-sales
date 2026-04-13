"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Trash2, Minus, Plus, ShoppingBag } from "lucide-react"
import { useCartStore } from "@/stores/useCartStore"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { EnhancedCheckoutModal } from "@/components/checkout/EnhancedCheckoutModal"

export default function CartPage() {
  const router = useRouter()
  const t = useTranslations()
  const { theme, setTheme } = useTheme()
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCartStore()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

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
                  <span className="text-xl font-bold text-foreground hidden sm:block">SoloSales</span>
                </Link>
                <nav className="hidden lg:flex items-center gap-6">
                  <Link
                    href="/"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t('nav.shopName')}
                  </Link>
                  <Link
                    href="/products"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t('nav.allProducts')}
                  </Link>
                </nav>
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

        <main className="flex flex-col lg:flex-row gap-6 p-4 lg:p-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <h1 className="text-2xl font-bold">{t('cart.title')}</h1>
              <span className="text-muted-foreground">({cart.length} {t('common.order')})</span>
            </div>

            <div className="bg-card rounded-xl border shadow-sm">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <ShoppingBag className="w-16 h-16 mb-4 text-muted-foreground/50" />
                  <p className="mb-4 text-lg">{t('cart.empty')}</p>
                  <Button onClick={() => router.push('/')} size="lg">{t('common.shopNow')}</Button>
                </div>
              ) : (
                <div className="divide-y">
                  {cart.map((item) => (
                    <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                      <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                        <p className="text-red-600 dark:text-red-500 font-bold mt-1">${item.price}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border rounded-lg">
                          <button
                            className="px-3 py-2 hover:bg-accent text-muted-foreground transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 text-sm font-medium">{item.quantity}</span>
                          <button
                            className="px-3 py-2 hover:bg-accent text-muted-foreground transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="lg:w-96">
              <div className="bg-card rounded-xl border shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-bold mb-4">{t('checkout.orderSummary')}</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('checkout.orderSummary')}</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('checkout.orderTotal')}</span>
                    <span className="text-green-600">{t('common.none')}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>{t('common.total')}</span>
                    <span className="text-red-600 dark:text-red-500">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  size="lg"
                  className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  {t('cart.checkout')}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  {t('checkout.orderSummary')}
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
  )
}
