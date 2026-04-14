"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, Package, Loader2, Copy, CheckCircle2 } from "lucide-react"
import { TrackingTimeline } from "@/components/order/TrackingTimeline"
import { useTranslations, useLocale } from "next-intl"

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
  updatedAt: string
  items: OrderItem[]
  shippingAddress?: string
  trackingNumber?: string
  contactInfo?: {
    name: string
    phone: string
    email: string
  }
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: _session, isPending } = useSession()
  const t = useTranslations()
  const locale = useLocale()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: t("orders.pending"), color: "bg-yellow-500" },
    PAID: { label: t("orders.paid"), color: "bg-blue-500" },
    SHIPPED: { label: t("orders.shipped"), color: "bg-purple-500" },
    DELIVERED: { label: t("orders.delivered"), color: "bg-green-500" },
    CANCELLED: { label: t("orders.cancelled"), color: "bg-gray-500" },
  }

  useEffect(() => {
    if (_session) {
      fetchOrder()
    }
  }, [_session])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders?id=${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      }
    } catch (error) {
      console.error(t("admin.fetchingOrders"), error)
    } finally {
      setLoading(false)
    }
  }

  const copyTrackingNumber = () => {
    if (order?.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">{t("orders.orderNotFound")}</p>
          <Button onClick={() => router.push("/orders")} className="mt-4">
            {t("orders.backToOrders")}
          </Button>
        </div>
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
          <h1 className="text-lg font-bold ml-2">{t("orders.orderDetails")}</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t("orders.orderInfo")}</CardTitle>
                <Badge className={`${statusLabels[order.status]?.color} text-white`}>
                  {statusLabels[order.status]?.label || order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("orders.orderNumber")}</span>
                <span className="font-mono text-sm">{order.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t("orders.createdAt")}</span>
                <span>{new Date(order.createdAt).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}</span>
              </div>
              {order.contactInfo && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t("orders.contact")}</span>
                  <span>{order.contactInfo.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("orders.orderTracking")}</CardTitle>
            </CardHeader>
            <CardContent>
              <TrackingTimeline currentStatus={order.status} />

              {order.trackingNumber && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{t("orders.trackingNumber")}</p>
                      <p className="font-mono font-medium">{order.trackingNumber}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyTrackingNumber}
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {order.shippingAddress && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{t("orders.shippingAddress")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{order.shippingAddress}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t("orders.items")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
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
                    <p className="font-medium line-clamp-2">{item.product.name}</p>
                    <p className="text-sm text-gray-500 mt-1">x{item.quantity}</p>
                    <p className="font-bold text-red-600 mt-1">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium">{t("common.total")}</span>
                <span className="text-xl font-bold text-red-600">
                  ${order.totalAmount.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
