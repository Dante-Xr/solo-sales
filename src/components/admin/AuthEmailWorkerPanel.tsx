"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Play, RefreshCw, Timer } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type WorkerConfig = {
  id: string
  enabled: boolean
  intervalMinutes: number
  batchSize: number
  lastHeartbeatAt: string | null
  lastCompletedAt: string | null
  consecutiveFailures: number
  lastError: string | null
}

type WorkerStatus = {
  config: WorkerConfig
  runs: Array<{ id: string; trigger: string; status: string; processed: number; delivered: number; deadLettered: number; error: string | null; startedAt: string }>
  deadLetters: Array<{ id: string; attempts: number; maxAttempts: number; lastError: string | null; createdAt: string }>
}

export function AuthEmailWorkerPanel() {
  const [status, setStatus] = useState<WorkerStatus | null>(null)
  const [canManage, setCanManage] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [workerResponse, meResponse] = await Promise.all([
        fetch("/api/admin/settings/auth-email-worker", { cache: "no-store" }),
        fetch("/api/admin/auth/me", { cache: "no-store" }),
      ])
      if (!workerResponse.ok) throw new Error("无权查看认证邮件任务调度")
      const workerBody = await workerResponse.json() as { data: WorkerStatus }
      const meBody = await meResponse.json() as { data?: { permissions?: string[] } }
      setStatus(workerBody.data)
      setCanManage(meBody.data?.permissions?.includes("worker.manage") ?? false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "无法加载认证邮件任务调度")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const save = async (next: Pick<WorkerConfig, "enabled" | "intervalMinutes" | "batchSize">) => {
    setSaving(true)
    setError("")
    try {
      const response = await fetch("/api/admin/settings/auth-email-worker", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(next),
      })
      const body = await response.json() as { data?: WorkerConfig; error?: { message?: string } }
      if (!response.ok || !body.data) throw new Error(body.error?.message || "保存失败")
      setStatus((current) => current ? { ...current, config: body.data! } : current)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "保存失败")
    } finally {
      setSaving(false)
    }
  }

  const runNow = async () => {
    if (!window.confirm("立即执行会消费当前待发认证邮件，是否继续？")) return
    setSaving(true)
    try {
      const response = await fetch("/api/admin/settings/auth-email-worker/run", { method: "POST" })
      if (!response.ok) {
        const body = await response.json() as { error?: { message?: string } }
        throw new Error(body.error?.message || "手动执行失败")
      }
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "手动执行失败")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex min-h-52 items-center justify-center"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
  if (!status) return <p className="text-sm text-destructive">{error || "认证邮件任务调度不可用"}</p>

  const { config } = status
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2"><Timer className="size-5" />认证邮件任务</CardTitle>
            <CardDescription>每分钟由部署平台唤醒，实际消费频率由此配置控制。</CardDescription>
          </div>
          <Badge variant={config.enabled ? "default" : "secondary"}>{config.enabled ? "已启用" : "已停用"}</Badge>
        </CardHeader>
        <CardContent className="space-y-5">
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex items-center justify-between gap-4 border-b pb-4">
            <div><Label htmlFor="worker-enabled">启用认证邮件 worker</Label><p className="text-sm text-muted-foreground">启用前会验证数据库、Redis、加密密钥与 SMTP 登录。</p></div>
            <Switch id="worker-enabled" checked={config.enabled} disabled={!canManage || saving} onCheckedChange={(enabled) => void save({ enabled, intervalMinutes: config.intervalMinutes, batchSize: config.batchSize })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="worker-interval">执行间隔</Label><select id="worker-interval" value={config.intervalMinutes} disabled={!canManage || saving} onChange={(event) => void save({ enabled: config.enabled, intervalMinutes: Number(event.target.value), batchSize: config.batchSize })} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option value={1}>每 1 分钟</option><option value={2}>每 2 分钟</option><option value={5}>每 5 分钟</option><option value={10}>每 10 分钟</option></select></div>
            <div className="space-y-2"><Label htmlFor="worker-batch">单次批量</Label><select id="worker-batch" value={config.batchSize} disabled={!canManage || saving} onChange={(event) => void save({ enabled: config.enabled, intervalMinutes: config.intervalMinutes, batchSize: Number(event.target.value) })} className="h-9 w-full rounded-md border bg-background px-3 text-sm"><option value={1}>1 封</option><option value={3}>3 封</option><option value={5}>5 封</option><option value={10}>10 封</option></select></div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"><span>最近心跳：{formatDate(config.lastHeartbeatAt)}</span><span>连续失败：{config.consecutiveFailures}</span>{canManage && <Button size="sm" onClick={() => void runNow()} disabled={!config.enabled || saving}><Play className="size-4" />立即执行</Button>}</div>
        </CardContent>
      </Card>

      <Card><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle>最近运行</CardTitle><CardDescription>保留最近 30 天的运行记录。</CardDescription></div><Button variant="outline" size="icon" onClick={() => void load()} aria-label="刷新任务状态"><RefreshCw className="size-4" /></Button></CardHeader><CardContent>{status.runs.length === 0 ? <p className="text-sm text-muted-foreground">暂无运行记录</p> : <div className="space-y-3">{status.runs.map((run) => <div key={run.id} className="grid gap-1 border-b pb-3 text-sm sm:grid-cols-[1fr_auto_auto]"><span>{formatDate(run.startedAt)} · {triggerLabel(run.trigger)}</span><span>{run.status === "SUCCEEDED" ? `已投递 ${run.delivered} 封` : run.status === "SKIPPED" ? "已跳过" : "失败"}</span><span className="text-muted-foreground">{run.error || `处理 ${run.processed} 个任务`}</span></div>)}</div>}</CardContent></Card>

      <Card><CardHeader><CardTitle>认证邮件死信</CardTitle><CardDescription>超过 15 分钟未投递或重试耗尽的任务不会再发送。</CardDescription></CardHeader><CardContent>{status.deadLetters.length === 0 ? <p className="text-sm text-muted-foreground">暂无死信任务</p> : <div className="space-y-3">{status.deadLetters.map((job) => <div key={job.id} className="flex flex-wrap justify-between gap-2 border-b pb-3 text-sm"><span>{formatDate(job.createdAt)}</span><span>尝试 {job.attempts}/{job.maxAttempts}</span><span className="text-muted-foreground">{job.lastError || "未知错误"}</span></div>)}</div>}</CardContent></Card>
    </div>
  )
}

function formatDate(value: string | null) { return value ? new Date(value).toLocaleString() : "从未" }
function triggerLabel(value: string) { return value === "MANUAL" ? "手动" : value === "HTTP" ? "应急接口" : "定时任务" }
