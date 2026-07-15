/**
 * 修改时间：2026-05-02 21:19:13 +08:00
 * 修改内容：清理导入页未使用 hook，并用 ImportLog 类型约束导入日志列表。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 批发商品导入管理页面 (Phase 5 管理后台重构)
 * ============================================
 * 功能说明：
 *   - 展示导入历史记录
 *   - 显示导入状态和结果
 *   - 手动触发导入任务
 *   - 使用 Refine useList hook 获取导入日志
 *   - 使用 Refine useCustom hook 触发导入
 * ============================================
 * 2026-04-13: 集成 Refine useList/useCustom hook
 * 2026-04-13 23:35: 迁移到 Refine 数据获取方案
 */

"use client"

import { useState, useMemo } from "react"
import { useList } from "@refinedev/core"
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
import { useTranslations, useLocale } from "next-intl"

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
  const t = useTranslations('admin.import')
  const locale = useLocale()

  const [importing, setImporting] = useState(false)
  const [selectedLog, setSelectedLog] = useState<ImportLog | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [resultDialogOpen, setResultDialogOpen] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const { query: { data: logsData, isLoading: loading, refetch } } = useList({
    resource: "import-logs",
    pagination: { currentPage: 1, pageSize: 100 },
    queryOptions: {
      enabled: true,
    },
  })

  const logs = useMemo<ImportLog[]>(() => {
    const raw = logsData?.data as ImportLog[] | { list?: ImportLog[] } | undefined
    // 兼容列表接口直接返回数组或分页对象两种结构，统一收敛为 ImportLog[]。
    if (Array.isArray(raw)) return raw
    return raw?.list || []
  }, [logsData])

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
      refetch()
    } catch (error: unknown) {
      console.error("导入失败:", error)
      setImportResult({
        success: false,
        message: t('importFailed'),
      })
      setResultDialogOpen(true)
    } finally {
      setImporting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")
  }

  const getStatusBadge = (status: ImportLog["status"]) => {
    const config: Record<
      ImportLog["status"],
      { icon: React.ReactNode; className: string; key: string }
    > = {
      PENDING: {
        icon: <Clock className="w-4 h-4" />,
        className: "bg-muted text-muted-foreground",
        key: 'status.pending',
      },
      RUNNING: {
        icon: <RefreshCw className="w-4 h-4 animate-spin" />,
        className: "bg-info text-white dark:text-[#0c1022]",
        key: 'status.running',
      },
      COMPLETED: {
        icon: <CheckCircle className="w-4 h-4" />,
        className: "bg-success text-white dark:text-[#0c1022]",
        key: 'status.completed',
      },
      FAILED: {
        icon: <XCircle className="w-4 h-4" />,
        className: "bg-destructive text-white dark:text-[#0c1022]",
        key: 'status.failed',
      },
    }
    const { icon, className, key } = config[status]
    return (
      <Badge className={`flex items-center gap-1 ${className}`}>
        {icon}
        {t(key)}
      </Badge>
    )
  }

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
              {t('pageTitle')}
            </h1>
          </div>
          <Button onClick={() => setImportDialogOpen(true)} disabled={importing}>
            {importing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                {t('importing')}
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('manualImport')}
              </>
            )}
          </Button>
        </div>

        {/* 提示信息 */}
        <Card className="border-info/30 bg-info/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-info" />
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  {t('importInstructions')}
                </p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  <li>
                    {t('instruction1')}
                  </li>
                  <li>
                    {t('instruction2')}
                  </li>
                  <li>
                    {t('instruction3')}
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
              {t('importHistory')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('loading')}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('noImportRecords')}
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
                          {t('triggeredBy')}: {log.triggeredBy} |{" "}
                          {formatDate(log.startedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm">
                          <span className="font-medium text-success">
                            +{log.successCount}
                          </span>
                          {log.failCount > 0 && (
                            <span className="ml-2 font-medium text-destructive">
                              -{log.failCount}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('successFailed')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{getDuration(log)}</div>
                        <div className="text-xs text-muted-foreground">
                          {t('duration')}
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
            <DialogTitle>{t('confirmImport')}</DialogTitle>
            <DialogDescription>
              {t('confirmImportDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('wholesaler')}:
                </span>
                <span className="font-medium">1866</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {t('skipDuplicates')}:
                </span>
                <span className="font-medium">{t('yes')}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              {t('buttons.cancel')}
            </Button>
            <Button onClick={handleImport}>
              {t('startImport')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 导入结果 Dialog */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {importResult?.success ? t('importCompleted') : t('importFailed')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {importResult?.success ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-5 h-5" />
                  <span>{importResult.message}</span>
                </div>
                {importResult.data && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-success">
                        {importResult.data.successCount}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t('imported')}
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-warning">
                        {importResult.data.skipped}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {t('skipped')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="w-5 h-5" />
                <span>{importResult?.message || t('unknownError')}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setResultDialogOpen(false)}>
              {t('buttons.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 日志详情 Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('importDetails')}
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {t('wholesaler')}
                  </div>
                  <div className="font-medium">{selectedLog.wholesaler}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {t('status')}
                  </div>
                  <div>{getStatusBadge(selectedLog.status)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {t('triggeredBy')}
                  </div>
                  <div className="font-medium">{selectedLog.triggeredBy}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {t('duration')}
                  </div>
                  <div className="font-medium">{getDuration(selectedLog)}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold">{selectedLog.totalProducts}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('total')}
                  </div>
                </div>
                <div className="rounded-lg bg-success/10 p-3 text-center">
                  <div className="text-2xl font-bold text-success">
                    {selectedLog.successCount}
                  </div>
                  <div className="text-sm text-success">
                    {t('success')}
                  </div>
                </div>
                <div className="rounded-lg bg-destructive/10 p-3 text-center">
                  <div className="text-2xl font-bold text-destructive">
                    {selectedLog.failCount}
                  </div>
                  <div className="text-sm text-destructive">
                    {t('failed')}
                  </div>
                </div>
              </div>

              {selectedLog.errorDetails.length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {t('errorDetails')}
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {selectedLog.errorDetails.map((error, index) => (
                      <div
                        key={index}
                        className="rounded bg-destructive/10 p-2 text-sm text-destructive"
                      >
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <div>
                  {t('started')}:
                  {formatDate(selectedLog.startedAt)}
                </div>
                {selectedLog.completedAt && (
                  <div>
                    {t('completed')}:
                    {formatDate(selectedLog.completedAt)}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLog(null)}>
              {t('buttons.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
