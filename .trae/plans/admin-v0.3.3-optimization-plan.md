# SoloSales 后台管理系统 v0.3.3 优化实施计划

## 一、计划概述

### 1.1 背景与目标
基于 v0.3.2 后台管理系统的技术评估结果，制定 v0.3.3 版本的详细优化实施计划。本次优化重点解决性能瓶颈、提升用户体验，并实现全面的移动端适配。

### 1.2 目标设备适配规格
| 设备 | 屏幕尺寸 | 分辨率 | DPR | 视口宽度 |
|------|----------|--------|-----|----------|
| iPhone 13 Pro Max | 6.7" | 428 x 926 | 3x | 428px |
| Xiaomi 14 Ultra | 6.73" | 1440 x 3200 | 3x | 393px (360dp) |

> 注：小米17可能指代小米14 Pro或小米14 Ultra，采用主流旗舰规格（1440p分辨率，393dp视口）进行适配。

---

## 二、功能模块调整计划

### 2.1 模块划分

| 模块编号 | 模块名称 | 优先级 | 工作类型 |
|----------|----------|--------|----------|
| M1 | 仪表盘性能优化 | P0 | 性能 |
| M2 | 数据缓存层 | P0 | 性能 |
| M3 | 列表渲染优化 | P1 | 性能 |
| M4 | 移动端基础框架 | P0 | 适配 |
| M5 | 移动端组件适配 | P0 | 适配 |
| M6 | 触控交互优化 | P1 | 适配 |
| M7 | 批量操作功能 | P1 | 功能 |
| M8 | 表单体验增强 | P1 | 功能 |
| M9 | 无障碍访问 | P2 | 质量 |

---

## 三、详细技术实现方案

### 3.1 M1: 仪表盘性能优化

#### 问题分析
当前 admin/page.tsx 串行处理 3 个 API 请求，且错误处理嵌套过深。

#### 实现方案

**步骤 1: 创建聚合 API**
```
文件: src/app/api/admin/dashboard/route.ts
```

```typescript
/**
 * 聚合仪表盘数据 API
 * 单一端点返回所有仪表盘所需数据
 * 减少客户端请求次数，利用服务端并行查询
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cacheGet, cacheSet, CACHE_TTL } from "@/lib/cache"

export async function GET() {
  // 尝试从缓存获取
  const cached = await cacheGet("admin:dashboard")
  if (cached) {
    return NextResponse.json({ ...cached, fromCache: true })
  }

  // 并行查询所有数据
  const [orders, products, users, recentOrders] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      select: { totalAmount: true, status: true, createdAt: true }
    }),
    prisma.product.aggregate({
      _count: { _all: true },
      where: { isPublished: true }
    }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } }
    })
  ])

  const result = {
    stats: {
      totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      totalOrders: orders.length,
      activeProducts: products._count._all,
      activeUsers: users
    },
    recentOrders: recentOrders.map(o => ({
      id: o.id,
      customerName: o.user.name || "匿名",
      customerEmail: o.user.email,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt.toISOString()
    })),
    chartData: generateChartData(orders)
  }

  // 缓存 5 分钟
  await cacheSet("admin:dashboard", result, CACHE_TTL.MEDIUM)

  return NextResponse.json({ success: true, data: result })
}
```

**步骤 2: 更新前端页面**
```typescript
// admin/page.tsx
const fetchDashboardData = useCallback(async () => {
  setLoading(true)
  try {
    const response = await fetch("/api/admin/dashboard")
    const result = await response.json()
    if (result.success) {
      setStats(result.data.stats)
      setRecentOrders(result.data.recentOrders)
      // 图表数据直接传给 SalesChart
    }
  } finally {
    setLoading(false)
  }
}, [])
```

#### 预期效果
- 仪表盘加载时间: 800ms → 200ms (4x 提升)
- 减少网络请求: 4次 → 1次

---

### 3.2 M2: 数据缓存层

#### 实现方案

**步骤 1: 扩展缓存工具**
```
文件: src/lib/cache.ts
```

```typescript
// 添加缓存键和 TTL
export const CACHE_KEYS = {
  // ... 现有键
  ADMIN_DASHBOARD: "admin:dashboard",
  PRODUCT_LIST: "product:list",
  CUSTOMER_LIST: "customer:list",
}

export const CACHE_TTL = {
  // ... 现有 TTL
  MEDIUM: 300,      // 5分钟
  LONG: 600,        // 10分钟
}
```

**步骤 2: 在产品 API 应用缓存**
```typescript
// src/app/api/products/route.ts GET handler
const cacheKey = "product:list:" + JSON.stringify({ page, pageSize, keyword, category })

let cached = await cacheGet(cacheKey)
if (cached) {
  return NextResponse.json({ ...cached, fromCache: true })
}

// ... 查询逻辑后
await cacheSet(cacheKey, { data: { list, pagination } }, CACHE_TTL.MEDIUM)
```

---

### 3.3 M3: 列表渲染优化

#### 实现方案

**步骤 1: 创建可复用表格行组件**
```
文件: src/components/admin/DataTableRow.tsx
```

```typescript
"use client"

import React, { memo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: string
  name: string
  price: number
  stock: number
  isPublished: boolean
  category?: { name: string } | null
}

interface ProductRowProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  isSelected?: boolean
  onSelect?: (id: string) => void
}

export const ProductRow = memo(function ProductRow({
  product,
  onEdit,
  onDelete,
  isSelected,
  onSelect
}: ProductRowProps) {
  return (
    <tr className="hover:bg-muted/50 transition-colors">
      {onSelect && (
        <td className="w-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(product.id)}
            className="rounded border-input"
          />
        </td>
      )}
      <td className="py-3 px-4">
        <span className="font-medium truncate max-w-[200px] block">{product.name}</span>
      </td>
      <td className="py-3 px-4">
        {product.category ? (
          <Badge variant="outline">{product.category.name}</Badge>
        ) : "-"}
      </td>
      <td className="py-3 px-4 font-medium">
        {formatCurrency(product.price)}
      </td>
      <td className="py-3 px-4">
        <span className={product.stock <= 10 ? "text-orange-500" : ""}>
          {product.stock}
        </span>
      </td>
      <td className="py-3 px-4">
        <Badge variant={product.isPublished ? "default" : "secondary"}>
          {product.isPublished ? "上架" : "下架"}
        </Badge>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(product)}
            className="text-destructive hover:text-destructive"
          >
            删除
          </Button>
        </div>
      </td>
    </tr>
  )
})
```

**步骤 2: 使用 useMemo 优化数据处理**
```typescript
// 在 ProductsPage 中
const processedProducts = useMemo(() =>
  productList.map(p => ({
    ...p,
    priceDisplay: formatCurrency(p.price),
    stockWarning: p.stock <= 10
  })),
  [productList]
)
```

---

### 3.4 M4: 移动端基础框架

#### 目标设备视口分析
| 设备 | 逻辑分辨率 | DPR | CSS 视口 |
|------|------------|-----|----------|
| iPhone 13 Pro Max | 428 x 926 | 3x | 428 x 886 |
| Xiaomi 14 Ultra | 393 x 852 | 3x | 393 x 852 |

#### 实现方案

**步骤 1: 创建移动端布局组件**
```
文件: src/components/admin/AdminLayout.tsx
```

```typescript
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  BookOpen,
  Users,
  ShoppingCart,
  Upload,
  MessageSquare,
  Settings,
  Menu,
  X,
  ChevronLeft
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, label: "仪表盘" },
  { href: "/admin/products", icon: Package, label: "商品管理" },
  { href: "/admin/knowledge", icon: BookOpen, label: "知识库" },
  { href: "/admin/customers", icon: Users, label: "客户管理" },
  { href: "/admin/orders", icon: ShoppingCart, label: "订单管理" },
  { href: "/admin/import", icon: Upload, label: "导入管理" },
  { href: "/admin/chat", icon: MessageSquare, label: "客服聊天" },
  { href: "/admin/settings", icon: Settings, label: "系统设置" },
]

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <div className="min-h-screen bg-muted/50">
      {/* 移动端顶部栏 */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b z-40 flex items-center justify-between px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-md hover:bg-muted"
            aria-label="打开菜单"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold">后台管理</span>
          <div className="w-10" /> {/* 占位 */}
        </header>
      )}

      {/* 移动端侧边栏 Overlay */}
      {isMobile && sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-background z-50 transform transition-transform duration-200 ease-out">
            <div className="h-14 border-b flex items-center justify-between px-4">
              <span className="font-semibold">后台管理</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md hover:bg-muted"
                aria-label="关闭菜单"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </aside>
        </>
      )}

      {/* PC 端侧边栏 */}
      {!isMobile && (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-background border-r z-30">
          <div className="h-16 border-b flex items-center px-6">
            <span className="font-semibold text-lg">SoloSales</span>
          </div>
          <nav className="p-3">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>
      )}

      {/* 主内容区 */}
      <main className={cn(
        "min-h-screen transition-all duration-200",
        isMobile ? "pt-14" : "lg:pl-64"
      )}>
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
```

**步骤 2: 应用布局到所有管理页面**
```typescript
// 在各页面中使用布局组件
import { AdminLayout } from "@/components/admin/AdminLayout"

export default function ProductsPage() {
  return (
    <AdminLayout>
      <ProductsContent />
    </AdminLayout>
  )
}
```

---

### 3.5 M5: 移动端组件适配

#### 5.1 响应式表格 → 卡片列表

**问题**: 移动端（< 768px）表格横向滚动体验差

**实现方案**:
```typescript
// 文件: src/components/admin/ResponsiveProductTable.tsx

"use client"

import { useState } from "react"
import { Product } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface ResponsiveProductTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onToggleStatus: (product: Product) => void
  isZh: boolean
}

// 移动端卡片视图
const MobileProductCard = ({ product, onEdit, onDelete, onToggleStatus, isZh }: ResponsiveProductTableProps) => {
  const [actionsOpen, setActionsOpen] = useState(false)

  return (
    <div className="bg-background rounded-xl border shadow-sm p-4 mb-3 lg:hidden">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-base truncate">{product.name}</h3>
          {product.category && (
            <Badge variant="outline" className="mt-1 text-xs">
              {product.category.name}
            </Badge>
          )}
        </div>
        <button
          onClick={() => setActionsOpen(true)}
          className="p-2 -mr-2 rounded-md hover:bg-muted"
          aria-label="操作菜单"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <p className="text-muted-foreground text-xs">{isZh ? "价格" : "Price"}</p>
          <p className="font-semibold">{formatCurrency(product.price)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">{isZh ? "库存" : "Stock"}</p>
          <p className={product.stock <= 10 ? "text-orange-500 font-medium" : ""}>
            {product.stock}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => onToggleStatus(product)}
          className="flex items-center gap-1.5 text-sm"
        >
          {product.isPublished ? (
            <>
              <ToggleRight className="w-5 h-5 text-green-500" />
              <span className="text-green-600">{isZh ? "上架中" : "Active"}</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground">{isZh ? "已下架" : "Inactive"}</span>
            </>
          )}
        </button>
        <span className="text-xs text-muted-foreground">
          {new Date(product.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* 移动端操作 Sheet */}
      <Sheet open={actionsOpen} onOpenChange={setActionsOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{product.name}</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button variant="outline" onClick={() => { onEdit(product); setActionsOpen(false) }}>
              <Edit className="w-4 h-4 mr-2" />
              {isZh ? "编辑" : "Edit"}
            </Button>
            <Button variant="destructive" onClick={() => { onDelete(product); setActionsOpen(false) }}>
              <Trash2 className="w-4 h-4 mr-2" />
              {isZh ? "删除" : "Delete"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
```

#### 5.2 响应式统计卡片

```typescript
// 文件: src/components/admin/StatCard.tsx

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ElementType
  isMobile?: boolean
}

export function StatCard({ title, value, change, icon: Icon, isMobile }: StatCardProps) {
  return (
    <Card className={cn(
      "hover:shadow-md transition-shadow",
      isMobile ? "border-l-4 border-l-primary" : ""
    )}>
      <CardContent className={cn(
        "p-4",
        isMobile ? "p-4" : "p-6"
      )}>
        <div className="flex items-center justify-between">
          <div>
            <p className={cn(
              "text-muted-foreground",
              isMobile ? "text-xs" : "text-sm"
            )}>
              {title}
            </p>
            <p className={cn(
              "font-bold mt-1",
              isMobile ? "text-2xl" : "text-3xl"
            )}>
              {value}
            </p>
            {change !== undefined && (
              <p className={cn(
                "text-xs mt-1",
                change >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {change >= 0 ? "+" : ""}{change}%
              </p>
            )}
          </div>
          <div className={cn(
            "rounded-full p-2",
            isMobile ? "p-2" : "p-3"
          )}>
            <Icon className={cn(
              "text-primary",
              isMobile ? "w-5 h-5" : "w-6 h-6"
            )} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### 5.3 响应式对话框

```typescript
// 移动端使用 Sheet 替代 Dialog
// 表格中编辑按钮改为触发 Sheet

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

const EditForm = ({ product, onSave, onClose, isMobile }) => {
  if (isMobile) {
    return (
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>编辑商品</SheetTitle>
          </SheetHeader>
          {/* 表单内容 - 滚动区域 */}
          <div className="overflow-y-auto h-[calc(100vh-200px)] pb-20">
            {/* 表单字段 - 增大触控区域 */}
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">商品名称</label>
                <input className="w-full h-12 px-4 border rounded-lg" /> {/* 移动端增大高度 */}
              </div>
              {/* ... */}
            </div>
          </div>
          {/* 固定底部按钮 */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
            <Button className="w-full h-12" onClick={onSave}>
              保存
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        {/* 原有 Dialog 内容 */}
      </DialogContent>
    </Dialog>
  )
}
```

---

### 3.6 M6: 触控交互优化

#### 6.1 增大触控目标
```css
/* globals.css 或 Tailwind 配置 */

/* 移动端最小触控区域 44x44px (Apple HIG) */
@media (max-width: 768px) {
  button,
  [role="button"],
  a,
  input[type="checkbox"],
  input[type="radio"],
  select {
    min-height: 44px;
    min-width: 44px;
  }

  /* 表格行触控 */
  .table-row-touch {
    min-height: 56px;
    padding: 12px 16px;
  }
}
```

#### 6.2 滑动删除/编辑
```typescript
// 使用第三方库 react-swipeable 或自定义实现
import { useSwipeable } from "react-swipeable"

const SwipeableProductRow = ({ product, onEdit, onDelete }) => {
  const handlers = useSwipeable({
    onSwipedLeft: ({ deltaX }) => {
      if (deltaX < -100) {
        // 显示操作按钮
      }
    },
    onSwipedRight: ({ deltaX }) => {
      if (deltaX > 100) {
        // 快速删除
      }
    },
    trackMouse: false
  })

  return (
    <div {...handlers} className="relative overflow-hidden">
      <div className="flex justify-end gap-2 absolute inset-y-0 right-0 bg-red-500 items-center px-4">
        <button onClick={onEdit} className="p-3 bg-blue-500 text-white rounded">
          编辑
        </button>
        <button onClick={onDelete} className="p-3 bg-red-600 text-white rounded">
          删除
        </button>
      </div>
      <div className="bg-white relative">
        {/* 行内容 */}
      </div>
    </div>
  )
}
```

#### 6.3 下拉刷新
```typescript
// hooks/usePullToRefresh.ts
import { useState, useCallback, useRef } from "react"

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [pulling, setPulling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY
    if (currentY - startY.current > 60 && !refreshing) {
      setPulling(true)
    }
  }, [refreshing])

  const handleTouchEnd = useCallback(async () => {
    if (pulling) {
      setPulling(false)
      setRefreshing(true)
      await onRefresh()
      setRefreshing(false)
    }
  }, [pulling, onRefresh])

  return { pulling, refreshing, handlers: { handleTouchStart, handleTouchMove, handleTouchEnd } }
}
```

---

### 3.7 M7: 批量操作功能

#### 实现方案

```typescript
// 步骤 1: 添加批量选择状态
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

const toggleSelect = (id: string) => {
  setSelectedIds(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  })
}

const selectAll = () => {
  if (selectedIds.size === productList.length) {
    setSelectedIds(new Set())
  } else {
    setSelectedIds(new Set(productList.map(p => p.id)))
  }
}

// 步骤 2: 批量操作栏
{selectedIds.size > 0 && (
  <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-1/2 lg:-translate-x-1/2 lg:w-auto bg-zinc-900 text-white rounded-xl p-3 flex items-center gap-4 shadow-xl z-50">
    <span className="text-sm">
      已选择 {selectedIds.size} 项
    </span>
    <div className="flex-1 flex items-center gap-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={() => handleBatchPublish(true)}
      >
        批量上架
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => handleBatchPublish(false)}
      >
        批量下架
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={handleBatchDelete}
      >
        批量删除
      </Button>
    </div>
    <button
      onClick={() => setSelectedIds(new Set())}
      className="p-1 hover:bg-white/20 rounded"
    >
      <X className="w-5 h-5" />
    </button>
  </div>
)}

// 步骤 3: 批量 API
// POST /api/products/batch
const handleBatchPublish = async (isPublished: boolean) => {
  await fetch("/api/products/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ids: Array.from(selectedIds),
      action: isPublished ? "publish" : "unpublish"
    })
  })
  setSelectedIds(new Set())
  fetchProductList()
}
```

---

### 3.8 M8: 表单体验增强

#### 8.1 即时验证
```typescript
// hooks/useFormValidation.ts
export function useFormValidation<T extends Record<string, string>>(
  schema: Record<keyof T, (value: string) => string | null>
) {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Set<keyof T>>(new Set())

  const validateField = useCallback((field: keyof T, value: string) => {
    const error = schema[field]?.(value)
    setErrors(prev => ({ ...prev, [field]: error || "" }))
  }, [schema])

  const handleBlur = useCallback((field: keyof T, value: string) => {
    setTouched(prev => new Set(prev).add(field))
    validateField(field, value)
  }, [validateField])

  const isValid = useMemo(() =>
    Object.values(errors).every(e => !e),
    [errors]
  )

  return { errors, touched, handleBlur, validateField, isValid }
}
```

#### 8.2 键盘快捷键
```typescript
// hooks/useKeyboardShortcuts.ts
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = [
        e.metaKey && "cmd",
        e.ctrlKey && "ctrl",
        e.shiftKey && "shift",
        e.key.toLowerCase()
      ].filter(Boolean).join("+")

      if (shortcuts[key]) {
        e.preventDefault()
        shortcuts[key]()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts])
}

// 使用
useKeyboardShortcuts({
  "cmd+s": handleSave,
  "cmd+n": () => handleOpenEdit(),
  "escape": () => setEditDialogOpen(false),
  "cmd+f": () => searchInputRef.current?.focus()
})
```

---

### 3.9 M9: 无障碍访问

```typescript
// Dialog 增强
<Dialog
  open={open}
  onOpenChange={setOpen}
>
  <DialogContent
    role="dialog"
    aria-labelledby="dialog-title"
    aria-describedby="dialog-description"
    aria-modal="true"
  >
    <DialogTitle id="dialog-title">编辑商品</DialogTitle>
    <DialogDescription id="dialog-description">
      修改商品信息后点击保存按钮完成编辑
    </DialogDescription>
    {/* 表单 */}
  </DialogContent>
</Dialog>

// 表格增强
<table role="grid" aria-label="商品列表">
  <thead>
    <tr role="row">
      <th role="columnheader" scope="col" aria-sort="none">商品名称</th>
      {/* ... */}
    </tr>
  </thead>
  <tbody>
    <tr
      role="row"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleOpenEdit(product)
        }
      }}
    >
      <td role="cell">{product.name}</td>
    </tr>
  </tbody>
</table>

// 操作反馈
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {announcement}
</div>
```

---

## 四、开发时间表

### Phase 1: 性能优化 (预计 1 周)

| 任务 | 负责 | 工时 | 交付物 |
|------|------|------|--------|
| M1.1 创建聚合 Dashboard API | 后端 | 4h | /api/admin/dashboard |
| M1.2 更新仪表盘页面 | 前端 | 2h | admin/page.tsx |
| M2.1 扩展缓存工具 | 后端 | 2h | cache.ts |
| M2.2 产品 API 缓存 | 后端 | 2h | products/route.ts |
| M2.3 知识库 API 缓存 | 后端 | 1h | knowledge/route.ts |
| M3.1 创建 ProductRow 组件 | 前端 | 3h | DataTableRow.tsx |
| M3.2 应用 useMemo 优化 | 前端 | 2h | products/page.tsx |

**里程碑**: 仪表盘加载时间 < 200ms

### Phase 2: 移动端适配 (预计 1.5 周)

| 任务 | 负责 | 工时 | 交付物 |
|------|------|------|--------|
| M4.1 创建 AdminLayout | 前端 | 4h | AdminLayout.tsx |
| M4.2 应用布局到所有页面 | 前端 | 3h | 各 admin/*/page.tsx |
| M5.1 响应式表格/卡片组件 | 前端 | 6h | ResponsiveProductTable.tsx |
| M5.2 响应式统计卡片 | 前端 | 2h | StatCard.tsx |
| M5.3 移动端表单 Sheet | 前端 | 4h | EditForm.tsx |
| M6.1 触控区域优化 | 前端 | 2h | globals.css |
| M6.2 滑动操作 | 前端 | 4h | SwipeableRow.tsx |
| M6.3 下拉刷新 | 前端 | 3h | usePullToRefresh.ts |
| M5.4 移动端测试调优 | QA | 4h | 测试报告 |

**里程碑**: iPhone 13 Pro Max & 小米14 Ultra 全流程可用

### Phase 3: 功能增强 (预计 1 周)

| 任务 | 负责 | 工时 | 交付物 |
|------|------|------|--------|
| M7.1 批量选择状态 | 前端 | 2h | products/page.tsx |
| M7.2 批量操作栏 | 前端 | 3h | BatchActionBar.tsx |
| M7.3 批量 API | 后端 | 2h | /api/products/batch |
| M8.1 表单验证 Hook | 前端 | 3h | useFormValidation.ts |
| M8.2 键盘快捷键 | 前端 | 2h | useKeyboardShortcuts.ts |
| M9.1 ARIA 标签 | 前端 | 2h | Dialog/Table 组件 |
| M9.2 焦点管理 | 前端 | 2h | FocusTrap.tsx |

**里程碑**: 批量操作效率提升 5x

### Phase 4: 测试与优化 (预计 0.5 周)

| 任务 | 负责 | 工时 | 交付物 |
|------|------|------|--------|
| 设备兼容性测试 | QA | 4h | 测试报告 |
| 性能基准测试 | DevOps | 2h | 性能报告 |
| Bug 修复 | 全员 | 4h | 代码库 |
| 文档更新 | Dev | 2h | README 更新 |

---

## 五、资源分配

### 5.1 人力需求
| 角色 | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|------|---------|---------|---------|---------|
| 前端开发 | 1 人 | 2 人 | 1 人 | 1 人 |
| 后端开发 | 1 人 | 0 人 | 0.5 人 | 0 人 |
| QA | 0 人 | 0.5 人 | 0.5 人 | 1 人 |

### 5.2 测试设备
| 设备 | 系统版本 | 用途 |
|------|----------|------|
| iPhone 13 Pro Max | iOS 17 | iOS Safari 适配 |
| 小米 14 Ultra | MIUI 15 / HyperOS | Android Chrome 适配 |
| iPad Pro 11" | iPadOS 17 | 平板横屏适配 |
| Desktop 1920x1080 | Windows 11 | PC 端回归测试 |

---

## 六、验收标准

### 6.1 性能指标
| 指标 | 基线 | 目标 | 测试方法 |
|------|------|------|----------|
| Dashboard FCP | 800ms | < 200ms | Lighthouse |
| 产品列表 TTI | 500ms | < 300ms | Lighthouse |
| 资金消耗 | - | 减少 30% | Chrome DevTools |

### 6.2 移动端适配标准
| 检查项 | iPhone 13 Pro Max | 小米 14 Ultra |
|--------|-------------------|---------------|
| 布局无溢出 | ✅ | ✅ |
| 触控区域 ≥ 44px | ✅ | ✅ |
| 表单可正常填写 | ✅ | ✅ |
| 列表滚动流畅 60fps | ✅ | ✅ |
| 横屏布局正确 | ✅ | ✅ |

### 6.3 功能验收
- [ ] 仪表盘数据准确显示
- [ ] 产品 CRUD 完整可用
- [ ] 批量选择和操作正常
- [ ] 移动端所有页面可访问
- [ ] 键盘快捷键正常响应
- [ ] 屏幕阅读器可正确朗读

---

## 七、风险与对策

| 风险 | 影响 | 概率 | 对策 |
|------|------|------|------|
| Recharts 移动端性能 | 中 | 低 | 考虑使用更轻量的图表库如轻量级 SVG |
| 缓存导致数据不一致 | 高 | 中 | 实现缓存失效机制 + 手动刷新按钮 |
| 移动端表单体验差 | 中 | 中 | 使用原生 input 配合 CSS 优化 |
| 测试设备不足 | 低 | 中 | 使用 BrowserStack 云测试 |

---

## 八、后续规划 (v0.4.0)

1. **实时协作** - 多管理员同时编辑冲突处理
2. **操作日志** - 完整的行为审计追踪
3. **数据导出** - Excel/CSV 批量导出
4. **高级筛选** - 多条件组合筛选器
5. **PWA 支持** - 离线访问能力

---

*计划版本: v0.3.3*
*创建日期: 2026-03-24*
*预计完成周期: 4 周*
