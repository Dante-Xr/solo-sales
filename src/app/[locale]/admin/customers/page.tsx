/**
 * 修改时间：2026-05-02 21:19:13 +08:00
 * 修改内容：用 Customer 列表类型替代客户页 any，并修复详情点击传参为客户 ID。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 客户管理页面 (Phase 5 管理后台重构)
 * ============================================
 * 功能说明：
 *   - 客户列表展示
 *   - 客户搜索和筛选
 *   - 客户详情查看
 *   - 使用 Refine useList hook
 * ============================================
 * 2026-04-13: 集成 Refine useList hook
 */

"use client"

import { useState, useMemo } from "react"
import { useList } from "@refinedev/core"
import {
  Users,
  Search,
  ChevronRight,
  Mail,
  ShoppingBag,
  Calendar,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTranslations, useLocale } from "next-intl"

interface Customer {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: "USER" | "ADMIN"
  createdAt: string
  _count: {
    orders: number
  }
}

interface CustomerDetail extends Customer {
  orders: Array<{
    id: string
    totalAmount: number
    status: string
    createdAt: string
  }>
}

interface CustomerListPayload {
  list?: Customer[]
}

export default function CustomersPage() {
  const t = useTranslations('admin.customers')
  const locale = useLocale()

  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const { query: { data: customersData, isLoading: loading, refetch } } = useList({
    resource: "customers",
    pagination: { currentPage: 1, pageSize: 100 },
    filters: [
      ...(searchKeyword ? [{ field: "keyword", operator: "eq" as const, value: searchKeyword }] : []),
    ],
  })

  const customers = useMemo<Customer[]>(() => {
    const raw = customersData?.data as CustomerListPayload | undefined
    // 客户列表接口返回分页对象，页面只消费 list 中的 Customer[]。
    return raw?.list || []
  }, [customersData])

  const handleSearch = () => {
    refetch()
  }

  const handleViewDetail = async (id: string) => {
    setDetailLoading(true)
    setDetailDialogOpen(true)

    try {
      const response = await fetch(`/api/customers/${id}`)
      const result = await response.json()

      if (result.success) {
        setSelectedCustomer(result.data)
      }
    } catch (error: unknown) {
      console.error("获取客户详情失败:", error)
    } finally {
      setDetailLoading(false)
    }
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")
  }

  // 获取订单状态标签
  const getOrderStatusBadge = (status: string) => {
    const config: Record<string, { className: string; key: string }> = {
      PENDING: { className: "bg-warning text-[#0c1022]", key: 'orderStatus.pending' },
      PAID: { className: "bg-info text-white dark:text-[#0c1022]", key: 'orderStatus.paid' },
      SHIPPED: { className: "bg-info text-white dark:text-[#0c1022]", key: 'orderStatus.shipped' },
      DELIVERED: { className: "bg-success text-white dark:text-[#0c1022]", key: 'orderStatus.delivered' },
      CANCELLED: { className: "bg-destructive text-white dark:text-[#0c1022]", key: 'orderStatus.cancelled' },
    }
    const { className, key } = config[status] || { className: "bg-muted text-muted-foreground", key: status }
    return <Badge className={className}>{t(key)}</Badge>
  }

  return (
    <div className="min-h-screen bg-muted/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">
              {t('pageTitle')}
            </h1>
          </div>
          <div className="text-sm text-muted-foreground">
            {t('totalCustomers', { count: customers.length })}
          </div>
        </div>

        {/* 搜索框 */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* 客户列表 */}
        <Card>
          <CardHeader>
            <CardTitle>{t('customerList')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('loading')}
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('noData')}
              </div>
            ) : (
              <div className="space-y-4">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleViewDetail(customer.id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* 头像 */}
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {customer.image ? (
                          <img
                            src={customer.image}
                            alt={customer.name || "Avatar"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>

                      {/* 信息 */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {customer.name || t('noName')}
                          </span>
                          {customer.role === "ADMIN" && (
                            <Badge variant="outline">{t('admin')}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {customer.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {customer.email}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <ShoppingBag className="w-3 h-3" />
                            {customer._count.orders} {t('orders')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {t('joined')}
                        </div>
                        <div className="text-sm">{formatDate(customer.createdAt)}</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 客户详情 Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('customerDetails')}
            </DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('loading')}
            </div>
          ) : selectedCustomer ? (
            <div className="space-y-6 py-4">
              {/* 基本信息 */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {selectedCustomer.image ? (
                    <img
                      src={selectedCustomer.image}
                      alt={selectedCustomer.name || "Avatar"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl font-bold">
                      {selectedCustomer.name || t('noName')}
                    </span>
                    {selectedCustomer.role === "ADMIN" && (
                      <Badge variant="outline">{t('admin')}</Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {selectedCustomer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {selectedCustomer.email}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {t('joined')} {formatDate(selectedCustomer.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 订单统计 */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold">
                    {selectedCustomer._count.orders}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('totalOrders')}
                  </div>
                </div>
                <div className="rounded-lg bg-success/10 p-4 text-center">
                  <div className="text-2xl font-bold text-success">
                    {selectedCustomer.orders.filter((o) => o.status === "DELIVERED").length}
                  </div>
                  <div className="text-sm text-success">
                    {t('completed')}
                  </div>
                </div>
                <div className="rounded-lg bg-warning/10 p-4 text-center">
                  <div className="text-2xl font-bold text-warning">
                    {selectedCustomer.orders.filter((o) => o.status === "PENDING" || o.status === "PAID").length}
                  </div>
                  <div className="text-sm text-warning">
                    {t('processing')}
                  </div>
                </div>
                <div className="rounded-lg bg-destructive/10 p-4 text-center">
                  <div className="text-2xl font-bold text-destructive">
                    {selectedCustomer.orders.filter((o) => o.status === "CANCELLED").length}
                  </div>
                  <div className="text-sm text-destructive">
                    {t('cancelled')}
                  </div>
                </div>
              </div>

              {/* 订单列表 */}
              <div>
                <h3 className="font-medium mb-3">{t('recentOrders')}</h3>
                {selectedCustomer.orders.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    {t('noOrders')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedCustomer.orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-sm">{order.id}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold">${order.totalAmount.toFixed(2)}</span>
                          {getOrderStatusBadge(order.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
