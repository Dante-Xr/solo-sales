/**
 * 修改时间：2026-06-04 16:28:48 +08:00
 * 修改内容：后台仪表盘数据库聚合查询接入统一外部依赖故障保护，避免数据库抖动时长时间阻塞后台高频查询。
 * 修改模型：gpt-5.5
 *
 * 聚合仪表盘 API (v0.4.1)
 * 单一端点返回所有仪表盘所需数据
 * 服务端并行查询，减少网络请求次数
 */

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { cacheGet, cacheSet, CACHE_KEYS, CACHE_TTL } from "@/lib/cache"
import { handleApiError, successResponse } from "@/server/contracts/api"
import { requireAdminPermission } from "@/server/services/admin-service"
import { withDependencyGuard } from "@/server/services/dependency-guard"

// 图表数据点类型
interface ChartDataPoint {
  date: string
  sales: number
  orders: number
  revenue: number
  conversionRate: number
  aov: number
  visitors: number
}

// 仪表盘数据类型
interface DashboardData {
  stats: {
    totalRevenue: number
    revenueChange: number
    totalOrders: number
    ordersChange: number
    activeProducts: number
    productsChange: number
    activeUsers: number
    usersChange: number
  }
  recentOrders: Array<{
    id: string
    customerName: string
    customerEmail: string
    totalAmount: number
    status: string
    createdAt: string
  }>
  chartData: ChartDataPoint[]
}

// 生成图表数据（最近30天）
function generateChartData(orders: { createdAt: Date; totalAmount: number }[]): ChartDataPoint[] {
  const days = 30
  const today = new Date()
  const chartData: ChartDataPoint[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    // 计算当天订单总额和数量
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const dayOrders = orders.filter((o) => {
      const orderDate = new Date(o.createdAt)
      return orderDate >= dayStart && orderDate <= dayEnd
    })

    chartData.push({
      date: dateStr,
      sales: dayOrders.length,
      orders: dayOrders.length,
      revenue: dayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      conversionRate: dayOrders.length > 0 ? Math.random() * 3 + 1 : 0,
      aov: dayOrders.length > 0 ? dayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0) / dayOrders.length : 0,
      visitors: dayOrders.length > 0 ? Math.floor(dayOrders.length * (Math.random() * 20 + 10)) : Math.floor(Math.random() * 50),
    })
  }

  return chartData
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminPermission(request, "dashboard.view")

    // 尝试从缓存获取
    const cached = await cacheGet<DashboardData>(CACHE_KEYS.ADMIN_DASHBOARD())
    if (cached) {
      return successResponse(cached, { fromCache: true })
    }

    // 并行查询所有数据
    const [orders, products, users, recentOrders] = await withDependencyGuard({
      dependency: "database",
      label: "admin.dashboard.aggregate",
      timeoutMs: 3000,
      maxAttempts: 1,
      unavailableMessage: "后台仪表盘数据暂时不可用，请稍后重试",
      operation: () =>
        Promise.all([
          // 最近30天的订单
          prisma.order.findMany({
            where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
            select: { totalAmount: true, status: true, createdAt: true },
          }),
          // 已上架商品数量
          prisma.product.count({
            where: { isPublished: true },
          }),
          // 普通用户数量
          prisma.user.count({
            where: { role: "USER" },
          }),
          // 最近5条订单
          prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
              user: {
                select: { name: true, email: true },
              },
            },
          }),
        ]),
    })

    // 计算统计数据
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
    const totalOrders = orders.length
    const activeProducts = products
    const activeUsers = users

    // 生成图表数据
    const ordersForChart = orders.map((o) => ({
      createdAt: o.createdAt,
      totalAmount: Number(o.totalAmount),
      status: o.status,
    }))
    const chartData = generateChartData(ordersForChart)

    // 构建结果
    const result: DashboardData = {
      stats: {
        totalRevenue,
        revenueChange: 12.5, // 模拟环比增长
        totalOrders,
        ordersChange: 180.1,
        activeProducts,
        productsChange: 5,
        activeUsers,
        usersChange: 201,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        customerName: o.user?.name || "匿名",
        customerEmail: o.user?.email || "",
        totalAmount: Number(o.totalAmount),
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      })),
      chartData,
    }

    // 缓存 5 分钟
    await cacheSet(CACHE_KEYS.ADMIN_DASHBOARD(), result, CACHE_TTL.MEDIUM)

    return successResponse(result)
  } catch (error: unknown) {
    return handleApiError(error)
  }
}
