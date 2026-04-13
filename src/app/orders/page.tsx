"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Loader2, ShoppingBag, AlertCircle } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"
import { useTheme } from "next-themes"
import { useOrders } from "@/hooks/useOrders"

export default function OrdersPage() {
  const router = useRouter()
  const { status } = useSession()
  const { t, language } = useLanguage()
  const { theme, setTheme } = useTheme()
  const { data: orders = [], isLoading, error } = useOrders()

  const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: t("orders.pending"), color: "bg-yellow-500" },
    PAID: { label: t("orders.paid"), color: "bg-blue-500" },
    SHIPPED: { label: t("orders.shipped"), color: "bg-purple-500" },
    DELIVERED: { label: t("orders.delivered"), color: "bg-green-500" },
    CANCELLED: { label: t("orders.cancelled"), color: "bg-gray-500" },
  }

  const isZh = language === "zh"

  const navItems = [
    { labelKey: "nav.home", href: "/" },
    { labelKey: "nav.shop", href: "/products" },
    { labelKey: "nav.about", href: "/about" },
    { labelKey: "nav.contact", href: "/contact" },
  ]

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    )
  }

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
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isZh ? item.labelKey.replace("nav.", "") : item.labelKey.replace("nav.", "")}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? "☀️" : "🌙"}
                </Button>
                <Button variant="ghost" size="icon" className="relative" onClick={() => router.push("/cart")}>
                  <ShoppingBag className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <h1 className="text-2xl lg:text-3xl font-bold mb-6">{t("orders.title")}</h1>

          {error ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <AlertCircle className="w-16 h-16 mb-4 text-red-500" />
              <p className="text-lg mb-4">{isZh ? "加载订单失败" : "Failed to load orders"}</p>
              <Button onClick={() => router.push("/")}>{t("common.shopNow")}</Button>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Package className="w-20 h-20 mb-4 text-muted-foreground/50" />
              <p className="text-lg mb-4">{t("orders.noOrders")}</p>
              <Button onClick={() => router.push("/")}>{t("common.shopNow")}</Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {orders.map((order) => (
                <Card
                  key={order.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/orders/${order.id}`)}
                >
                  <CardContent className="p-4 lg:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                          {order.items[0]?.product.images?.[0] ? (
                            <img
                              src={order.items[0].product.images[0]}
                              alt={order.items[0].product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Package className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {t("orders.orderNumber")}: {order.id.slice(0, 8)}...
                          </p>
                          <p className="text-sm mt-1">
                            {new Date(order.createdAt).toLocaleDateString(language === "zh" ? "zh-CN" : "en-US")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={`${statusLabels[order.status]?.color} text-white text-sm px-3 py-1`}>
                          {statusLabels[order.status]?.label || order.status}
                        </Badge>
                        <p className="font-bold text-lg text-red-600 dark:text-red-500">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {order.items.slice(0, 4).map((item) => (
                        <div key={item.id} className="w-12 h-12 bg-muted rounded-md overflow-hidden flex-shrink-0">
                          {item.product.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground flex-shrink-0">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>

                    {order.trackingNumber && (
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        {t("orders.tracking")}: {order.trackingNumber}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
