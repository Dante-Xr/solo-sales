/**
 * ============================================
 * 客户管理页面 (Task 2.1)
 * ============================================
 * 功能说明：
 *   - 客户列表展示
 *   - 客户搜索和筛选
 *   - 客户详情查看
 * ============================================
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Users,
  Search,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLanguage } from "@/context/LanguageContext"

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

export default function CustomersPage() {
  const { language } = useLanguage()
  const isZh = language === "zh"

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // 获取客户列表
  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchKeyword) params.append("keyword", searchKeyword)

      const response = await fetch(`/api/customers?${params}`)
      const result = await response.json()

      if (result.success) {
        setCustomers(result.data.list)
      }
    } catch (error) {
      console.error("获取客户列表失败:", error)
    } finally {
      setLoading(false)
    }
  }, [searchKeyword])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // 查看客户详情
  const handleViewDetail = async (customer: Customer) => {
    setDetailLoading(true)
    setDetailDialogOpen(true)

    try {
      const response = await fetch(`/api/customers/${customer.id}`)
      const result = await response.json()

      if (result.success) {
        setSelectedCustomer(result.data)
      }
    } catch (error) {
      console.error("获取客户详情失败:", error)
    } finally {
      setDetailLoading(false)
    }
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(isZh ? "zh-CN" : "en-US")
  }

  // 获取订单状态标签
  const getOrderStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      PENDING: { color: "bg-yellow-500", label: isZh ? "待处理" : "Pending" },
      PAID: { color: "bg-blue-500", label: isZh ? "已支付" : "Paid" },
      SHIPPED: { color: "bg-purple-500", label: isZh ? "已发货" : "Shipped" },
      DELIVERED: { color: "bg-green-500", label: isZh ? "已完成" : "Delivered" },
      CANCELLED: { color: "bg-red-500", label: isZh ? "已取消" : "Cancelled" },
    }
    const { color, label } = config[status] || { color: "bg-gray-500", label: status }
    return <Badge className={`${color} text-white`}>{label}</Badge>
  }

  return (
    <div className="min-h-screen bg-muted/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">
              {isZh ? "客户管理" : "Customer Management"}
            </h1>
          </div>
          <div className="text-sm text-muted-foreground">
            {isZh ? "共" : "Total"} {customers.length} {isZh ? "位客户" : "customers"}
          </div>
        </div>

        {/* 搜索框 */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={isZh ? "搜索客户邮箱或名称..." : "Search by email or name..."}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchCustomers()}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* 客户列表 */}
        <Card>
          <CardHeader>
            <CardTitle>{isZh ? "客户列表" : "Customer List"}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                {isZh ? "加载中..." : "Loading..."}
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {isZh ? "暂无数据" : "No data"}
              </div>
            ) : (
              <div className="space-y-4">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleViewDetail(customer)}
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
                            {customer.name || (isZh ? "未设置姓名" : "No name")}
                          </span>
                          {customer.role === "ADMIN" && (
                            <Badge variant="outline">{isZh ? "管理员" : "Admin"}</Badge>
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
                            {customer._count.orders} {isZh ? "笔订单" : "orders"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {isZh ? "注册时间" : "Joined"}
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
              {isZh ? "客户详情" : "Customer Details"}
            </DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {isZh ? "加载中..." : "Loading..."}
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
                      {selectedCustomer.name || (isZh ? "未设置姓名" : "No name")}
                    </span>
                    {selectedCustomer.role === "ADMIN" && (
                      <Badge variant="outline">{isZh ? "管理员" : "Admin"}</Badge>
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
                      {isZh ? "注册于" : "Joined"} {formatDate(selectedCustomer.createdAt)}
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
                    {isZh ? "总订单" : "Total Orders"}
                  </div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedCustomer.orders.filter((o) => o.status === "DELIVERED").length}
                  </div>
                  <div className="text-sm text-green-600">
                    {isZh ? "已完成" : "Completed"}
                  </div>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {selectedCustomer.orders.filter((o) => o.status === "PENDING" || o.status === "PAID").length}
                  </div>
                  <div className="text-sm text-yellow-600">
                    {isZh ? "进行中" : "Processing"}
                  </div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {selectedCustomer.orders.filter((o) => o.status === "CANCELLED").length}
                  </div>
                  <div className="text-sm text-red-600">
                    {isZh ? "已取消" : "Cancelled"}
                  </div>
                </div>
              </div>

              {/* 订单列表 */}
              <div>
                <h3 className="font-medium mb-3">{isZh ? "最近订单" : "Recent Orders"}</h3>
                {selectedCustomer.orders.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    {isZh ? "暂无订单" : "No orders yet"}
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