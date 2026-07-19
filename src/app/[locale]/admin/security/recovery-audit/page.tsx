"use client"

import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

type AuditRecord = { id: string; scope: string; result: string; failureCode: string | null; accountFingerprint: string; ipFingerprint: string | null; jobId: string | null; createdAt: string }

export default function RecoveryAuditPage() {
  const [records, setRecords] = useState<AuditRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  async function load() {
    setLoading(true); setError("")
    try {
      const response = await fetch("/api/admin/security/recovery-audit", { cache: "no-store" })
      if (!response.ok) throw new Error("forbidden")
      const body = await response.json() as { records: AuditRecord[] }
      setRecords(body.records)
    } catch { setError("无权查看恢复安全审计。") } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])
  return <main className="space-y-6 p-6"><header className="flex items-center justify-between"><div><h1 className="text-2xl font-semibold">账号恢复安全审计</h1><p className="text-sm text-muted-foreground">仅显示脱敏账户和 IP 指纹。</p></div><Button variant="outline" size="icon" onClick={() => void load()} disabled={loading} aria-label="刷新"><RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} /></Button></header>{error ? <p className="text-sm text-destructive">{error}</p> : <div className="overflow-x-auto border"><table className="w-full text-sm"><thead className="bg-muted text-left"><tr><th className="p-3">时间</th><th className="p-3">范围</th><th className="p-3">结果</th><th className="p-3">原因</th><th className="p-3">账户指纹</th><th className="p-3">任务</th></tr></thead><tbody>{records.map((record) => <tr key={record.id} className="border-t"><td className="p-3 whitespace-nowrap">{new Date(record.createdAt).toLocaleString()}</td><td className="p-3">{record.scope}</td><td className="p-3">{record.result}</td><td className="p-3">{record.failureCode || "-"}</td><td className="p-3 font-mono">{record.accountFingerprint}</td><td className="p-3 font-mono">{record.jobId || "-"}</td></tr>)}{!loading && records.length === 0 && <tr><td className="p-6 text-center text-muted-foreground" colSpan={6}>暂无记录</td></tr>}</tbody></table></div>}</main>
}
