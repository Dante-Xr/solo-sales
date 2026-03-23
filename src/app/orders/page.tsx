"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Package, Loader2 } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    images: string[]
  }
}

interface Order {
  id: string
  totalAmount: number
  status: string
  createdAt: string
  items: OrderItem[]
  shippingAddress?: string
  trackingNumber?: string
}

export default function OrdersPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { t, language } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: t("orders.pending"), color: "bg-yellow-500" },
    PAID: { label: t("orders.paid"), color: "bg-blue-500" },
    SHIPPED: { label: t("orders.shipped"), color: "bg-purple-500" },
    DELIVERED: { label: t("orders.delivered"), color: "bg-green-500" },
    CANCELLED: { label: t("orders.cancelled"), color: "bg-gray-500" },
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
      return
    }

    if (status === "authenticated") {
      fetchOrders()
    }
  }, [status, router])

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders")
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error(t("admin.fetchingOrders"), error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <main className="w-full max-w-md bg-white min-h-screen shadow-xl flex flex-col">
        <header className="flex items-center p-4 border-b sticky top-0 bg-white z-50">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-bold ml-2">{t("orders.title")}</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Package className="w-16 h-16 mb-4 text-gray-300" />
              <p className="mb-4">{t("orders.noOrders")}</p>
              <Button onClick={() => router.push("/")}>{t("common.shopNow")}</Button>
            </div>
          ) : (
            orders.map((order) => (
              <Card
                key={order.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {t("orders.orderNumber")}: {order.id.slice(0, 8)}...
                    </span>
                    <Badge className={`${statusLabels[order.status]?.color} text-white`}>
                      {statusLabels[order.status]?.label || order.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                          {item.product.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-2">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            x{item.quantity}
                          </p>
                        </div>
                        <p className="font-bold text-red-600">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-sm text-gray-500">
                        {t("orders.moreItems").replace("{count}", String(order.items.length - 2))}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString(language === "zh" ? "zh-CN" : "en-US")}
                    </span>
                    <p className="font-bold text-red-600">
                      {t("common.total")}: ${order.totalAmount.toFixed(2)}
                    </p>
                  </div>

                  {order.trackingNumber && (
                    <div className="text-sm text-blue-600">
                      {t("orders.tracking")}: {order.trackingNumber}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
