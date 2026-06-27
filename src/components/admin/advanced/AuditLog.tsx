/**
 * ============================================
 * 审计日志查看器组件 (v1.2 Phase 4)
 * ============================================
 * 功能说明：
 *   - 表格展示所有管理员操作记录
 *   - 多维度筛选：操作类型、操作人、关键词搜索
 *   - 展开行查看变更数据快照（前后对比）
 *   - 支持分页导航
 * ============================================
 */

"use client"

import { useState, useMemo, Fragment } from "react"
import { useTranslations } from "next-intl"
import {
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  User,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ==================== 类型定义 ====================

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "EXPORT"

export interface AuditLogEntry {
  id: string
  userId: string
  userName: string
  action: AuditAction
  resource: string
  resourceId: string
  resourceName: string
  description: string
  beforeData?: Record<string, unknown>
  afterData?: Record<string, unknown>
  ipAddress?: string
  createdAt: string
}

// ==================== 操作类型配置 ====================

const ACTION_CONFIG: Record<AuditAction, { label: string; color: string }> = {
  CREATE: { label: "actionCreate", color: "text-success bg-success/10 dark:text-success dark:bg-success/20" },
  UPDATE: { label: "actionUpdate", color: "text-brand bg-brand/10 dark:text-brand dark:bg-brand/20" },
  DELETE: { label: "actionDelete", color: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20" },
  LOGIN: { label: "actionLogin", color: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/20" },
  LOGOUT: { label: "actionLogout", color: "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950/20" },
  EXPORT: { label: "actionExport", color: "text-accent bg-accent/10 dark:text-accent dark:bg-accent/20" },
}

// ==================== 模拟数据 ====================

export function generateMockLogs(count = 25): AuditLogEntry[] {
  const users = [
    { id: "u1", name: "Admin" },
    { id: "u2", name: "Manager Wang" },
    { id: "u3", name: "Operator Li" },
  ]

  const actions: AuditAction[] = ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "EXPORT"]
  const resourceNames = [
    "Wireless Earbuds", "Running Shoes", "Smart Watch", "Yoga Mat",
    "ORD-2024-001", "ORD-2024-002", "John Doe", "Jane Smith",
    "Store Settings", "Email Config", "Summer Sale 20%",
  ]

  const descriptions: Record<AuditAction, string[]> = {
    CREATE: ["Created item", "Added new item"],
    UPDATE: ["Updated item info", "Modified item price"],
    DELETE: ["Deleted item", "Removed item"],
    LOGIN: ["Logged into admin panel", "Logged in via OTP"],
    LOGOUT: ["Logged out of admin panel", "Session timeout logout"],
    EXPORT: ["Exported item data", "Downloaded item report"],
  }

  return Array.from({ length: count }, (_, i) => {
    const user = users[Math.floor(Math.random() * users.length)]
    const action = actions[Math.floor(Math.random() * actions.length)]
    const resourceName = resourceNames[Math.floor(Math.random() * resourceNames.length)]
    const descs = descriptions[action]
    const desc = descs[Math.floor(Math.random() * descs.length)]

    const createdAt = new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString()

    return {
      id: `log-${i + 1}`,
      userId: user.id,
      userName: user.name,
      action,
      resource: action === "LOGIN" || action === "LOGOUT" ? "SYSTEM" : "PRODUCT",
      resourceId: `${action.toLowerCase()}-${i + 1}`,
      resourceName,
      description: desc,
      beforeData:
        action === "UPDATE" || action === "DELETE"
          ? { price: Math.floor(Math.random() * 200) + 50, stock: Math.floor(Math.random() * 100) }
          : undefined,
      afterData:
        action === "CREATE" || action === "UPDATE"
          ? { price: Math.floor(Math.random() * 200) + 50, stock: Math.floor(Math.random() * 100) }
          : undefined,
      ipAddress: Math.random() > 0.3 ? `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : undefined,
      createdAt,
    }
  })
}

// ==================== 组件实现 ====================

interface AuditLogProps {
  logs?: AuditLogEntry[]
  loading?: boolean
}

const PAGE_SIZE = 10

export function AuditLog({ logs: propLogs, loading = false }: AuditLogProps) {
  const t = useTranslations("admin.advanced.auditLog")
  const [logs] = useState<AuditLogEntry[]>(propLogs || generateMockLogs())
  const [searchQuery, setSearchQuery] = useState("")
  const [filterAction, setFilterAction] = useState<AuditAction | "all">("all")
  const [filterUser, setFilterUser] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const uniqueUsers = useMemo(() => {
    const names = new Set(logs.map((l) => l.userName))
    return Array.from(names)
  }, [logs])

  const filteredLogs = useMemo(() => {
    let result = [...logs]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (l) =>
          l.resourceName.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.userName.toLowerCase().includes(q)
      )
    }
    if (filterAction !== "all") {
      result = result.filter((l) => l.action === filterAction)
    }
    if (filterUser !== "all") {
      result = result.filter((l) => l.userName === filterUser)
    }
    return result
  }, [logs, searchQuery, filterAction, filterUser])

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE))
  const pagedLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const clearFilters = () => {
    setSearchQuery("")
    setFilterAction("all")
    setFilterUser("all")
    setPage(1)
  }

  const hasActiveFilters = searchQuery || filterAction !== "all" || filterUser !== "all"

  if (loading) {
    return (
      <div className="border border-border rounded-lg p-6 bg-card">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* 标题栏 */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">{t("title")}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {t("totalRecords", { count: filteredLogs.length })}
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn("p-1.5 rounded-md border border-border hover:bg-muted transition-colors", showFilters && "bg-muted")}
              title={t("filter")}
            >
              <Filter className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
              placeholder={t("searchPlaceholder")}
              className="w-full h-9 pl-9 pr-8 text-sm border border-border rounded-lg bg-background outline-none focus:border-primary"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted shrink-0 flex items-center gap-1">
              <X className="h-3 w-3" />
              {t("clearAll")}
            </button>
          )}
        </div>

        {/* 高级筛选 */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">{t("actionType")}:</label>
              <select
                value={filterAction}
                onChange={(e) => { setFilterAction(e.target.value as AuditAction | "all"); setPage(1) }}
                className="h-8 px-2 text-xs border border-border rounded-md bg-background outline-none focus:border-primary"
              >
                <option value="all">{t("allActions")}</option>
                {Object.entries(ACTION_CONFIG).map(([key]) => (
                  <option key={key} value={key}>{t(ACTION_CONFIG[key as AuditAction].label)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground">{t("operator")}:</label>
              <select
                value={filterUser}
                onChange={(e) => { setFilterUser(e.target.value); setPage(1) }}
                className="h-8 px-2 text-xs border border-border rounded-md bg-background outline-none focus:border-primary"
              >
                <option value="all">{t("allUsers")}</option>
                {uniqueUsers.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">{t("timestamp")}</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">{t("operator")}</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">{t("actionType")}</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">{t("resource")}</th>
              <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground">{t("description")}</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {pagedLogs.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{t("noRecords")}</p>
                </td>
              </tr>
            )}
            {pagedLogs.map((log) => {
              const actionConf = ACTION_CONFIG[log.action]
              const isExpanded = expandedId === log.id
              const hasDataDiff = log.beforeData || log.afterData

              return (
                <Fragment key={log.id}>
                  {/* 数据行 */}
                  <tr className="border-b border-border last:border-none group hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="text-xs font-medium">{log.userName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium", actionConf.color)}>
                        {t(actionConf.label)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs">{log.resourceName}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-muted-foreground">{log.description}</span>
                    </td>
                    <td className="px-2 py-2.5">
                      {hasDataDiff && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                          className="p-1 rounded hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
                          title={isExpanded ? t("collapse") : t("expand")}
                        >
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* 展开的数据对比行 */}
                  {isExpanded && (
                    <tr className="border-b border-border bg-muted/20">
                      <td colSpan={6} className="px-4 py-3">
                        <div className="grid grid-cols-2 gap-4">
                          {log.beforeData && (
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground mb-1.5">{t("beforeChange")}</h4>
                              <pre className="text-xs bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded p-2 overflow-x-auto">
                                {JSON.stringify(log.beforeData, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.afterData && (
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground mb-1.5">{t("afterChange")}</h4>
                              <pre className="text-xs bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded p-2 overflow-x-auto">
                                {JSON.stringify(log.afterData, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                        {log.ipAddress && (
                          <div className="mt-2 text-[10px] text-muted-foreground">IP: {log.ipAddress}</div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
          <span className="text-xs text-muted-foreground">
            {t("pageInfo", { page, total: totalPages })}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    "w-8 h-8 text-xs rounded-md border border-border hover:bg-muted",
                    pageNum === page && "bg-primary text-primary-foreground border-primary"
                  )}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
