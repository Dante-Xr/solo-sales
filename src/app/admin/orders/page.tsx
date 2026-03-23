"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Truck } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

interface Order {
  id: string
  totalAmount: number
  status: string
  createdAt: string
  shippingAddress?: string
  trackingNumber?: string
  contactInfo?: {
    name: string
    phone: string
    email: string
  }
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      name: string
    }
  }>
}

const statusOptions = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]

export default function AdminOrdersPage() {
  const { t } = useLanguage()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [updating, setUpdating] = useState(false)

  const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: t("orders.pending"), color: "bg-yellow-500" },
    PAID: { label: t("orders.paid"), color: "bg-blue-500" },
    SHIPPED: { label: t("orders.shipped"), color: "bg-purple-500" },
    DELIVERED: { label: t("orders.delivered"), color: "bg-green-500" },
    CANCELLED: { label: t("orders.cancelled"), color: "bg-gray-500" },
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders")
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

  const handleUpdateTracking = async () => {
    if (!selectedOrder) return

    setUpdating(true)
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          trackingNumber,
          status: "SHIPPED",
        }),
      })

      if (res.ok) {
        await fetchOrders()
        setSelectedOrder(null)
      }
    } catch (error) {
      console.error(t("admin.updateFailed"), error)
    } finally {
      setUpdating(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      })

      if (res.ok) {
        await fetchOrders()
      }
    } catch (error) {
      console.error(t("admin.updateStatusFailed"), error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{t("admin.orderManagement")}</h2>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t("admin.allOrders")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.orderId")}</TableHead>
                <TableHead>{t("admin.customer")}</TableHead>
                <TableHead>{t("admin.amount")}</TableHead>
                <TableHead>{t("orders.status")}</TableHead>
                <TableHead>{t("admin.tracking")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{order.contactInfo?.name || t("common.guest")}</p>
                      <p className="text-gray-500">{order.contactInfo?.phone || "-"}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-red-600">
                    ${order.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]?.label || status}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    {order.trackingNumber ? (
                      <span className="font-mono text-sm">{order.trackingNumber}</span>
                    ) : (
                      <span className="text-gray-400 text-sm">{t("common.none")}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order)
                        setTrackingNumber(order.trackingNumber || "")
                      }}
                    >
                      <Truck className="w-4 h-4 mr-1" />
                      {order.trackingNumber ? t("admin.update") : t("admin.add")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.enterTrackingInfo")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedOrder && (
              <>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">{t("admin.orderId")}</p>
                  <p className="font-mono">{selectedOrder.id}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tracking">{t("admin.trackingNumber")}</Label>
                  <Input
                    id="tracking"
                    placeholder={t("admin.enterTrackingNumber")}
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  {t("admin.autoUpdateToShipped")}
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleUpdateTracking} disabled={updating || !trackingNumber}>
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("admin.updating")}
                </>
              ) : (
                t("common.confirm")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
