"use client"

import { useEffect } from "react"
import { useRouter, Link } from "@/i18n/navigation"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, ShoppingBag, AlertCircle } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslations, useLocale } from "next-intl"
import { useOrders } from "@/hooks/useOrders"
import { Skeleton } from "@/components/ui/skeleton"

function OrderListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="border rounded-lg p-4 lg:p-6 space-y-4 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: 4 }, (_, j) => (
              <Skeleton key={j} className="w-12 h-12 rounded-md" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function OrdersPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const t = useTranslations()
  const locale = useLocale()
  const { theme, setTheme } = useTheme()
  const { data: orders = [], isLoading, error } = useOrders()

  const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: t("orders.pending"), color: "bg-yellow-500" },
    PAID: { label: t("orders.paid"), color: "bg-blue-500" },
    SHIPPED: { label: t("orders.shipped"), color: "bg-purple-500" },
    DELIVERED: { label: t("orders.delivered"), color: "bg-green-500" },
    CANCELLED: { label: t("orders.cancelled"), color: "bg-gray-500" },
  }

  useEffect(() => {
    if (!session) {
      router.push("/")
    }
  }, [session, router])

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-brand-gradient-from/5 to-brand-gradient-to/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl" />
        </div>
        <div className="w-full max-w-[1440px] mx-auto relative">
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="px-4 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-8">
                  <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-gradient-from to-brand-gradient-to flex items-center justify-center">
                      <span className="text-brand-foreground font-bold text-sm">S</span>
                    </div>
                    <span className="text-xl font-bold text-foreground hidden sm:block">SoloSales</span>
                  </Link>
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
            <Skeleton className="h-9 w-48 mb-6" />
            <OrderListSkeleton />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-brand-gradient-from/5 to-brand-gradient-to/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[1440px] mx-auto relative">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="px-4 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-gradient-from to-brand-gradient-to flex items-center justify-center">
                    <span className="text-brand-foreground font-bold text-sm">S</span>
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
              <p className="text-lg mb-4">{t('orders.title')}</p>
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
                        <div className="w-16 h-16 bg-muted rounded-xl overflow-hidden">
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
                            {new Date(order.createdAt).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={`${statusLabels[order.status]?.color} text-white text-sm px-3 py-1`}>
                          {statusLabels[order.status]?.label || order.status}
                        </Badge>
                        <p className="font-bold text-lg text-price">
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
