/**
 * ============================================
 * 转化漏斗图表组件 (Phase 2 图表增强)
 * ============================================
 * 功能说明：
 *   - 漏斗图展示转化路径
 *   - 访问→商品页→加购→结账→支付
 *   - 显示各步骤转化率
 *   - 响应式设计，支持暗色模式
 * ============================================
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations, useLocale } from "next-intl"

interface FunnelStep {
  key: string
  value: number
}

interface ConversionFunnelProps {
  data?: FunnelStep[]
  loading?: boolean
}

const FUNNEL_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-green-500",
  "bg-amber-500",
  "bg-rose-500",
]

export function ConversionFunnel({ data: propData, loading: propLoading }: ConversionFunnelProps) {
  const t = useTranslations("admin.charts.funnel")
  const tAdmin = useTranslations("admin")
  const locale = useLocale()
  const [data, setData] = useState<FunnelStep[]>(propData || [])
  const [loading, setLoading] = useState(propLoading ?? true)

  useEffect(() => {
    if (propData && propData.length > 0) {
      setData(propData)
      setLoading(false)
      return
    }

    const generateMockData = (): FunnelStep[] => [
      { key: "visit", value: Math.floor(Math.random() * 5000) + 3000 },
      { key: "productView", value: Math.floor(Math.random() * 2000) + 1500 },
      { key: "addToCart", value: Math.floor(Math.random() * 800) + 400 },
      { key: "checkout", value: Math.floor(Math.random() * 300) + 150 },
      { key: "payment", value: Math.floor(Math.random() * 150) + 50 },
    ]

    setLoading(true)
    const timer = setTimeout(() => {
      setData(generateMockData())
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [locale])

  const getStepLabel = (key: string): string => {
    const labels: Record<string, string> = {
      visit: t("visit"),
      productView: t("productView"),
      addToCart: t("addToCart"),
      checkout: t("checkout"),
      payment: t("payment"),
    }
    return labels[key] || key
  }

  const maxValue = data.length > 0 ? data[0].value : 1

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading || propLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">{tAdmin("loading")}</div>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {data.map((step, index) => {
              const widthPercent = Math.max((step.value / maxValue) * 100, 15)
              const conversionRate = index > 0 && data[index - 1].value > 0
                ? ((step.value / data[index - 1].value) * 100).toFixed(1)
                : null
              const overallRate = index > 0 && data[0].value > 0
                ? ((step.value / data[0].value) * 100).toFixed(1)
                : null

              return (
                <div key={step.key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{getStepLabel(step.key)}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{step.value.toLocaleString()}</span>
                      {conversionRate && (
                        <span className="text-xs text-muted-foreground">
                          ({conversionRate}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative h-8 bg-muted rounded overflow-hidden">
                    <div
                      className={`h-full ${FUNNEL_COLORS[index % FUNNEL_COLORS.length]} rounded transition-all duration-500`}
                      style={{ width: `${widthPercent}%`, margin: "0 auto" }}
                    />
                  </div>
                  {overallRate && (
                    <div className="text-xs text-muted-foreground text-right">
                      {t("overallConversion")}: {overallRate}%
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
