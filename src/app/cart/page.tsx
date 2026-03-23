"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Trash2, Minus, Plus } from "lucide-react"
import { useCart } from "@/context/CartContext"
import { useLanguage } from "@/context/LanguageContext"
import { EnhancedCheckoutModal } from "@/components/checkout/EnhancedCheckoutModal"

export default function CartPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const isZh = language === "zh"
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const checkoutProduct = {
    id: "cart_checkout",
    name: isZh ? `购物车商品 (共 ${cart.length} 件)` : `Cart Items (Total ${cart.length})`,
    price: cartTotal,
  }

  return (
    <div className="min-h-screen bg-muted flex justify-center">
      <main className="w-full max-w-md bg-card text-card-foreground min-h-screen shadow-xl flex flex-col relative pb-24">
        {/* 顶部导航 */}
        <header className="flex items-center p-4 border-b sticky top-0 bg-card z-50">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-bold ml-2">{isZh ? "购物车" : "Shopping Cart"}</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <p className="mb-4">{isZh ? "您的购物车是空的" : "Your cart is empty"}</p>
              <Button onClick={() => router.push('/')}>{isZh ? "去逛逛" : "Browse"}</Button>
            </div>
          ) : (
            cart.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-3 flex gap-4">
                  <div className="w-24 h-24 bg-muted rounded-md overflow-hidden flex-shrink-0 relative">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                      <p className="text-red-600 dark:text-red-500 font-bold mt-1">${item.price}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-md">
                        <button
                          className="px-2 py-1 hover:bg-accent text-muted-foreground"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                        <button
                          className="px-2 py-1 hover:bg-accent text-muted-foreground"
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
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 底部结算栏 */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 w-full max-w-md bg-card border-t p-4 flex items-center justify-between shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-50">
            <div>
              <p className="text-sm text-muted-foreground">{isZh ? "合计:" : "Total:"}</p>
              <p className="text-2xl font-black text-red-600 dark:text-red-500">${cartTotal.toFixed(2)}</p>
            </div>
            <Button
              size="lg"
              className="rounded-full bg-red-600 hover:bg-red-700 text-white px-8 shadow-lg shadow-red-200"
              onClick={() => setIsCheckoutOpen(true)}
            >
              {isZh ? "去结算" : "Checkout"}
            </Button>
          </div>
        )}

        <EnhancedCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          product={{ name: isZh ? `购物车商品 (共 ${cart.length} 件)` : `Cart Items (Total ${cart.length})`, price: cartTotal }}
          isCart={true}
          cartItems={cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity }))}
          cartTotal={cartTotal}
        />
      </main>
    </div>
  )
}
