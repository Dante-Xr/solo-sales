/**
 * ============================================
 * 智能库存预警组件 (v1.2 Phase 4)
 * ============================================
 * 功能说明：
 *   - 基于日均销量计算库存可售天数
 *   - 三级预警：紧急(<3天)、警告(<7天)、注意(<14天)
 *   - 显示库存状态和补货建议
 *   - 多维度筛选和排序
 * ============================================
 */

"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import {
  AlertTriangle,
  AlertCircle,
  Bell,
  ArrowUpDown,
  Clock,
  Package,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ==================== 类型定义 ====================

export type AlertLevel = "critical" | "warning" | "notice" | "safe"

/** 库存预警项 */
export interface InventoryAlertItem {
  productId: string
  productName: string
  sku: string
  currentStock: number
  dailyAvgSales: number
  daysRemaining: number
  safetyStock: number
  lastRestockDate?: string
  alertLevel: AlertLevel
  suggestedOrder: number
}

/** 计算库存天数 */
function calculateDaysRemaining(currentStock: number, dailyAvgSales: number): number {
  if (dailyAvgSales <= 0) return 999
  return Math.round((currentStock / dailyAvgSales) * 10) / 10
}

/** 计算预警级别 */
function calculateAlertLevel(daysRemaining: number): AlertLevel {
  if (daysRemaining < 3) return "critical"
  if (daysRemaining < 7) return "warning"
  if (daysRemaining < 14) return "notice"
  return "safe"
}

/** 计算建议补货量（补足30天库存） */
function calculateSuggestedOrder(currentStock: number, dailyAvgSales: number, daysRemaining: number): number {
  if (dailyAvgSales <= 0) return 0
  // 建议补足到30天的库存量
  const target = Math.ceil(dailyAvgSales * 30)
  const suggested = Math.max(0, target - currentStock)
  return suggested
}

/** 生成模拟预警数据 */
export function generateMockAlerts(count = 15): InventoryAlertItem[] {
  const productNames = [
    "Wireless Earbuds Pro",
    "Running Shoes Ultra",
    "Smart Watch Series 5",
    "Yoga Mat Premium",
    "Bluetooth Speaker Mini",
    "LED Desk Lamp",
    "Portable Charger 20W",
    "Mechanical Keyboard",
    "Water Bottle Insulated",
    "Laptop Stand Aluminum",
    "Phone Case MagSafe",
    "USB-C Hub 7-in-1",
    "Backpack Waterproof",
    "Mouse Pad Extended",
    "Monitor Light Bar",
  ]

  const skus = productNames.map((n) =>
    n
      .split(" ")
      .map((w) => w.toUpperCase().slice(0, 3))
      .join("-")
  )

  const namesToUse = productNames.slice(0, count)
  const skusToUse = skus.slice(0, count)

  return namesToUse.map((name, i) => {
    const dailyAvgSales = Math.floor(Math.random() * 20) + 1
    const currentStock = Math.floor(Math.random() * 200)
    const daysRemaining = calculateDaysRemaining(currentStock, dailyAvgSales)
    const alertLevel = calculateAlertLevel(daysRemaining)
    const suggestedOrder = calculateSuggestedOrder(currentStock, dailyAvgSales, daysRemaining)
    const safetyStock = Math.ceil(dailyAvgSales * 7 * 1.5)

    return {
      productId: `prod-${i + 1}`,
      productName: name,
      sku: `SKU-${skusToUse[i]}`,
      currentStock,
      dailyAvgSales,
      daysRemaining,
      safetyStock,
      alertLevel,
      suggestedOrder,
      lastRestockDate:
        Math.random() > 0.5
          ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 10)
          : undefined,
    }
  })
}

// ==================== 预警级别配置 ====================

const LEVEL_CONFIG: Record<AlertLevel, { label: string; color: string; bg: string; icon: typeof AlertTriangle }> = {
  critical: {
    label: "alertCritical",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900",
    icon: AlertTriangle,
  },
  warning: {
    label: "alertWarning",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900",
    icon: AlertCircle,
  },
  notice: {
    label: "alertNotice",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900",
    icon: Bell,
  },
  safe: {
    label: "alertSafe",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900",
    icon: AlertTriangle,
  },
}

// ==================== 组件实现 ====================

interface InventoryAlertProps {
  alerts?: InventoryAlertItem[]
  loading?: boolean
}

export function InventoryAlert({ alerts: propAlerts, loading = false }: InventoryAlertProps) {
  const t = useTranslations("admin.advanced.inventory")
  const [alerts] = useState<InventoryAlertItem[]>(propAlerts || generateMockAlerts())
  const [filterLevel, setFilterLevel] = useState<AlertLevel | "all">("all")
  const [sortField, setSortField] = useState<keyof InventoryAlertItem>("daysRemaining")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  /** 筛选并排序 */
  const filteredAlerts = useMemo(() => {
    let result = [...alerts]

    if (filterLevel !== "all") {
      result = result.filter((a) => a.alertLevel === filterLevel)
    }

    result.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal
      }
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return 0
    })

    return result
  }, [alerts, filterLevel, sortField, sortDir])

  /** 统计 */
  const stats = useMemo(() => {
    const critical = alerts.filter((a) => a.alertLevel === "critical").length
    const warning = alerts.filter((a) => a.alertLevel === "warning").length
    const notice = alerts.filter((a) => a.alertLevel === "notice").length
    const total = alerts.length
    return { critical, warning, notice, total }
  }, [alerts])

  /** 切换排序 */
  const handleSort = (field: keyof InventoryAlertItem) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  if (loading) {
    return (
      <div className="border border-border rounded-lg p-6 bg-card">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* 标题和统计卡片 */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium mb-3">{t("title")}</h3>
        <div className="grid grid-cols-4 gap-3">
          {(["critical", "warning", "notice", "total"] as const).map((level) => {
            const config = level === "total"
              ? { label: "totalProducts", color: "text-foreground", bg: "bg-muted/50", icon: Package }
              : LEVEL_CONFIG[level as AlertLevel]

            return (
              <button
                key={level}
                onClick={() => setFilterLevel(level === "total" ? "all" : level)}
                className={cn(
                  "flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors",
                  filterLevel === (level === "total" ? "all" : level) ? "border-primary" : "border-border hover:bg-muted/50",
                  level === "total" ? "bg-muted/20" : (LEVEL_CONFIG[level as AlertLevel] || {}).bg
                )}
              >
                <span className={cn("text-lg font-bold", config.color)}>
                  {level === "total" ? stats.total : stats[level]}
                </span>
                <span className="text-[10px] text-muted-foreground">{t(config.label)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort("productName")}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  {t("product")}
                  {sortField === "productName" && (
                    <ArrowUpDown className="h-3 w-3" />
                  )}
                </button>
              </th>
              <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort("currentStock")}
                  className="flex items-center gap-1 hover:text-foreground transition-colors ml-auto"
                >
                  {t("currentStock")}
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort("dailyAvgSales")}
                  className="flex items-center gap-1 hover:text-foreground transition-colors ml-auto"
                >
                  {t("dailySales")}
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground">
                <button
                  onClick={() => handleSort("daysRemaining")}
                  className="flex items-center gap-1 hover:text-foreground transition-colors ml-auto"
                >
                  {t("daysRemaining")}
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="text-center px-3 py-2.5 text-xs font-medium text-muted-foreground">
                {t("alertLevel")}
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">
                {t("suggestedOrder")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{t("noAlerts")}</p>
                </td>
              </tr>
            )}
            {filteredAlerts.map((item) => {
              const levelConf = LEVEL_CONFIG[item.alertLevel]
              const Icon = levelConf.icon

              return (
                <tr
                  key={item.productId}
                  className={cn(
                    "border-b border-border last:border-none transition-colors",
                    item.alertLevel !== "safe" && "hover:bg-muted/30"
                  )}
                >
                  {/* 产品名称 */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-3.5 w-3.5 shrink-0", levelConf.color)} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.sku}</p>
                      </div>
                    </div>
                  </td>

                  {/* 当前库存 */}
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-sm">{item.currentStock}</span>
                    <div className="flex justify-end items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">
                        {t("safetyStock")}: {item.safetyStock}
                      </span>
                    </div>
                  </td>

                  {/* 日均销量 */}
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-sm">{item.dailyAvgSales}</span>
                  </td>

                  {/* 可售天数 */}
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className={cn("text-sm font-medium", levelConf.color)}>
                        {item.daysRemaining >= 999 ? "∞" : item.daysRemaining}
                      </span>
                      {item.daysRemaining < 999 && (
                        <span className="text-[10px] text-muted-foreground">{t("dayUnit")}</span>
                      )}
                    </div>
                  </td>

                  {/* 预警级别标签 */}
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
                        levelConf.bg,
                        levelConf.color
                      )}
                    >
                      {t(levelConf.label)}
                    </span>
                  </td>

                  {/* 建议补货 */}
                  <td className="px-4 py-2.5 text-right">
                    {item.suggestedOrder > 0 ? (
                      <span className="text-sm font-medium text-primary">{item.suggestedOrder}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                    {item.lastRestockDate && (
                      <div className="text-[10px] text-muted-foreground">
                        {t("lastRestock")}: {item.lastRestockDate}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
