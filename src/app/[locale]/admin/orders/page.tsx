/**
 * ============================================
 * 订单管理页面 (Phase 5 管理后台重构)
 * ============================================
 * 功能说明：
 *   - 订单列表展示
 *   - 物流信息更新
 *   - 订单状态管理
 *   - 使用 Refine useList hook
 * ============================================
 * 2026-04-13: 集成 Refine useList hook
 */

"use client"

import { useState } from "react"
import { useList } from "@refinedev/core"
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
import { useTranslations, useLocale } from "next-intl"

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
  const t = useTranslations('admin')
  const ordersT = useTranslations('orders')
  const commonT = useTranslations('common')
  const locale = useLocale()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [updating, setUpdating] = useState(false)

  const { query: { data: ordersData, isLoading: loading, refetch } } = useList({
    resource: "orders",
    pagination: {
      currentPage: 1,
      pageSize: 100,
    },
  })

  const orders = (ordersData?.data as any) || []

  const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: ordersT("pending"), color: "bg-yellow-500" },
    PAID: { label: ordersT("paid"), color: "bg-blue-500" },
    SHIPPED: { label: ordersT("shipped"), color: "bg-purple-500" },
    DELIVERED: { label: ordersT("delivered"), color: "bg-green-500" },
    CANCELLED: { label: ordersT("cancelled"), color: "bg-gray-500" },
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
        refetch()
        setSelectedOrder(null)
      }
    } catch (error) {
      console.error(t("updateFailed"), error)
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
        refetch()
      }
    } catch (error) {
      console.error(t("updateStatusFailed"), error)
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
        <h2 className="text-2xl font-bold tracking-tight">{t("orderManagement")}</h2>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t("allOrders")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("orderId")}</TableHead>
                <TableHead>{t("customer")}</TableHead>
                <TableHead>{t("amount")}</TableHead>
                <TableHead>{ordersT("status")}</TableHead>
                <TableHead>{t("tracking")}</TableHead>
                <TableHead className="text-right">{commonT("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{order.contactInfo?.name || commonT("guest")}</p>
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
                      <span className="text-gray-400 text-sm">{commonT("none")}</span>
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
                      {order.trackingNumber ? t("update") : t("add")}
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
            <DialogTitle>{t("enterTrackingInfo")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedOrder && (
              <>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">{t("orderId")}</p>
                  <p className="font-mono">{selectedOrder.id}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tracking">{t("trackingNumber")}</Label>
                  <Input
                    id="tracking"
                    placeholder={t("enterTrackingNumber")}
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  {t("autoUpdateToShipped")}
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              {commonT("cancel")}
            </Button>
            <Button onClick={handleUpdateTracking} disabled={updating || !trackingNumber}>
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("updating")}
                </>
              ) : (
                commonT("confirm")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
