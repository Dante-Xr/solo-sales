/**
 * ============================================
 * 批发商品导入管理页面 (Task 1.11)
 * ============================================
 * 功能说明：
 *   - 展示导入历史记录
 *   - 显示导入状态和结果
 *   - 手动触发导入任务
 * ============================================
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import {
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Package,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { useLanguage } from "@/context/LanguageContext"

interface ImportLog {
  id: string
  wholesaler: string
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED"
  totalProducts: number
  successCount: number
  failCount: number
  errorDetails: string[]
  startedAt: string
  completedAt?: string
  triggeredBy: string
}

interface ImportResult {
  success: boolean
  message: string
  data?: {
    logId: string
    total: number
    successCount: number
    failCount: number
    skipped: number
  }
}

export default function ImportPage() {
  const { language } = useLanguage()
  const isZh = language === "zh"

  const [logs, setLogs] = useState<ImportLog[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [selectedLog, setSelectedLog] = useState<ImportLog | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [resultDialogOpen, setResultDialogOpen] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  // 获取导入历史
  const fetchLogs = useCallback(async () => {
    try {
      const response = await fetch("/api/import/logs")
      const result = await response.json()

      if (result.success) {
        setLogs(result.data.logs)
      }
    } catch (error) {
      console.error("获取导入日志失败:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // 初始加载
  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // 触发导入
  const handleImport = async () => {
    setImporting(true)
    setImportDialogOpen(false)

    try {
      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wholesaler: "1866",
          options: {
            pageSize: 50,
            skipDuplicates: true,
          },
        }),
      })

      const result = await response.json()
      setImportResult(result)
      setResultDialogOpen(true)

      // 刷新日志列表
      fetchLogs()
    } catch (error) {
      console.error("导入失败:", error)
      setImportResult({
        success: false,
        message: isZh ? "导入请求失败" : "Import request failed",
      })
      setResultDialogOpen(true)
    } finally {
      setImporting(false)
    }
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(isZh ? "zh-CN" : "en-US")
  }

  // 获取状态图标和颜色
  const getStatusBadge = (status: ImportLog["status"]) => {
    const config: Record<
      ImportLog["status"],
      { icon: React.ReactNode; color: string; label: string }
    > = {
      PENDING: {
        icon: <Clock className="w-4 h-4" />,
        color: "bg-gray-500",
        label: isZh ? "待处理" : "Pending",
      },
      RUNNING: {
        icon: <RefreshCw className="w-4 h-4 animate-spin" />,
        color: "bg-blue-500",
        label: isZh ? "运行中" : "Running",
      },
      COMPLETED: {
        icon: <CheckCircle className="w-4 h-4" />,
        color: "bg-green-500",
        label: isZh ? "已完成" : "Completed",
      },
      FAILED: {
        icon: <XCircle className="w-4 h-4" />,
        color: "bg-red-500",
        label: isZh ? "失败" : "Failed",
      },
    }
    const { icon, color, label } = config[status]
    return (
      <Badge className={`${color} text-white flex items-center gap-1`}>
        {icon}
        {label}
      </Badge>
    )
  }

  // 计算导入耗时
  const getDuration = (log: ImportLog) => {
    if (!log.completedAt) return "-"
    const start = new Date(log.startedAt).getTime()
    const end = new Date(log.completedAt).getTime()
    const duration = Math.round((end - start) / 1000)
    if (duration < 60) return `${duration}s`
    return `${Math.floor(duration / 60)}m ${duration % 60}s`
  }

  return (
    <div className="min-h-screen bg-muted/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">
              {isZh ? "商品导入管理" : "Product Import"}
            </h1>
          </div>
          <Button onClick={() => setImportDialogOpen(true)} disabled={importing}>
            {importing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {isZh ? "导入中..." : "Importing..."}
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {isZh ? "手动导入" : "Manual Import"}
              </>
            )}
          </Button>
        </div>

        {/* 提示信息 */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  {isZh ? "导入说明" : "Import Instructions"}
                </p>
                <ul className="mt-1 text-blue-700 dark:text-blue-300 space-y-1">
                  <li>
                    {isZh
                      ? "• 从 1866 批发网站获取商品数据"
                      : "• Fetch product data from 1866 wholesaler"}
                  </li>
                  <li>
                    {isZh
                      ? "• 自动跳过已存在的商品（基于 SKU）"
                      : "• Automatically skip existing products (based on SKU)"}
                  </li>
                  <li>
                    {isZh
                      ? "• 批发价基础上自动加价 50% 作为售价"
                      : "• Auto mark up 50% from wholesale price as selling price"}
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 导入历史列表 */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isZh ? "导入历史" : "Import History"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                {isZh ? "加载中..." : "Loading..."}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {isZh ? "暂无导入记录" : "No import records"}
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{log.wholesaler}</span>
                          {getStatusBadge(log.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {isZh ? "触发者" : "Triggered by"}: {log.triggeredBy} |{" "}
                          {formatDate(log.startedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">
                            +{log.successCount}
                          </span>
                          {log.failCount > 0 && (
                            <span className="text-red-600 font-medium ml-2">
                              -{log.failCount}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isZh ? "成功 / 失败" : "Success / Failed"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{getDuration(log)}</div>
                        <div className="text-xs text-muted-foreground">
                          {isZh ? "耗时" : "Duration"}
                        </div>
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

      {/* 导入确认 Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isZh ? "确认导入" : "Confirm Import"}</DialogTitle>
            <DialogDescription>
              {isZh
                ? "即将从 1866 批发网站导入商品，确定要继续吗？"
                : "About to import products from 1866 wholesaler. Continue?"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {isZh ? "批发商" : "Wholesaler"}:
                </span>
                <span className="font-medium">1866</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {isZh ? "跳过重复" : "Skip Duplicates"}:
                </span>
                <span className="font-medium">{isZh ? "是" : "Yes"}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              {isZh ? "取消" : "Cancel"}
            </Button>
            <Button onClick={handleImport}>
              {isZh ? "开始导入" : "Start Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 导入结果 Dialog */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {importResult?.success
                ? isZh
                  ? "导入完成"
                  : "Import Completed"
                : isZh
                  ? "导入失败"
                  : "Import Failed"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {importResult?.success ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>{importResult.message}</span>
                </div>
                {importResult.data && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {importResult.data.successCount}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isZh ? "成功导入" : "Imported"}
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {importResult.data.skipped}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isZh ? "跳过重复" : "Skipped"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span>{importResult?.message || (isZh ? "未知错误" : "Unknown error")}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setResultDialogOpen(false)}>
              {isZh ? "关闭" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 日志详情 Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isZh ? "导入详情" : "Import Details"}
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {isZh ? "批发商" : "Wholesaler"}
                  </div>
                  <div className="font-medium">{selectedLog.wholesaler}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {isZh ? "状态" : "Status"}
                  </div>
                  <div>{getStatusBadge(selectedLog.status)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {isZh ? "触发者" : "Triggered By"}
                  </div>
                  <div className="font-medium">{selectedLog.triggeredBy}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {isZh ? "耗时" : "Duration"}
                  </div>
                  <div className="font-medium">{getDuration(selectedLog)}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold">{selectedLog.totalProducts}</div>
                  <div className="text-sm text-muted-foreground">
                    {isZh ? "总数" : "Total"}
                  </div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedLog.successCount}
                  </div>
                  <div className="text-sm text-green-600">
                    {isZh ? "成功" : "Success"}
                  </div>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {selectedLog.failCount}
                  </div>
                  <div className="text-sm text-red-600">
                    {isZh ? "失败" : "Failed"}
                  </div>
                </div>
              </div>

              {selectedLog.errorDetails.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {isZh ? "错误详情" : "Error Details"}
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {selectedLog.errorDetails.map((error, index) => (
                      <div
                        key={index}
                        className="text-sm text-red-600 p-2 bg-red-50 dark:bg-red-950/20 rounded"
                      >
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <div>
                  {isZh ? "开始时间" : "Started"}:
                  {formatDate(selectedLog.startedAt)}
                </div>
                {selectedLog.completedAt && (
                  <div>
                    {isZh ? "完成时间" : "Completed"}:
                    {formatDate(selectedLog.completedAt)}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLog(null)}>
              {isZh ? "关闭" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}