/**
 * ============================================
 * 信任元素组件 (v0.5.0)
 * ============================================
 * 功能说明：
 *   - 展示安全支付徽章
 *   - 展示配送信息
 *   - 展示退换货政策
 *   - 增强用户购买信心
 * ============================================
 */

"use client"

import { ShieldCheck, Truck, RotateCcw, Lock, Globe } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface TrustBadge {
  icon: React.ReactNode
  title: string
  description: string
  color: "green" | "blue" | "purple" | "orange"
}

/**
 * 默认信任徽章列表
 */
const defaultBadges: TrustBadge[] = [
  {
    icon: <ShieldCheck size={24} />,
    title: "安全支付",
    description: "SSL 加密，保障交易安全",
    color: "green",
  },
  {
    icon: <Truck size={24} />,
    title: "全球配送",
    description: "7-14 个工作日送达",
    color: "blue",
  },
  {
    icon: <RotateCcw size={24} />,
    title: "30天退换",
    description: "无理由退换货",
    color: "purple",
  },
  {
    icon: <Lock size={24} />,
    title: "数据保护",
    description: "GDPR 合规，您的隐私安全",
    color: "orange",
  },
]

/**
 * 信任徽章颜色映射
 * 修改时间：2026-06-27 04:00:00 +08:00
 * 修改内容：将硬编码颜色映射到主题变量，提升品牌一致性
 * 修改依据：UI设计师专家建议 - P0优先级
 */
const colorStyles = {
  green: "bg-success/10 text-success border-success/20",
  blue: "bg-brand/10 text-brand border-brand/20",
  purple: "bg-info/10 text-info border-info/20",
  orange: "bg-accent/10 text-accent border-accent/20",
}

interface TrustBadgesProps {
  /** 徽章列表，为空使用默认 */
  badges?: TrustBadge[]
  /** 展示模式 */
  variant?: "grid" | "row" | "compact"
  /** 自定义样式 */
  className?: string
}

/**
 * 信任徽章组件
 */
export function TrustBadges({
  badges = defaultBadges,
  variant = "grid",
  className = "",
}: TrustBadgesProps) {
  if (variant === "row") {
    return (
      <div className={`flex flex-wrap justify-center gap-4 ${className}`}>
        {badges.map((badge, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${colorStyles[badge.color]}`}
          >
            {badge.icon}
            <div>
              <p className="text-sm font-medium">{badge.title}</p>
              <p className="text-xs opacity-80">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {badges.map((badge, index) => (
          <div
            key={index}
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs ${colorStyles[badge.color]}`}
          >
            {badge.icon}
            <span className="font-medium">{badge.title}</span>
          </div>
        ))}
      </div>
    )
  }

  // 默认 grid 模式 - 移动端横向滚动，PC端网格
  return (
    <div className={`flex overflow-x-auto gap-3 md:grid md:grid-cols-4 pb-2 md:pb-0 snap-x snap-mandatory scrollbar-hide ${className}`}>
      {badges.map((badge, index) => (
        <div
          key={index}
          className={`flex flex-col items-center text-center p-4 rounded-lg border min-w-[140px] md:min-w-0 snap-start shrink-0 md:shrink ${colorStyles[badge.color]}`}
        >
          <div className="mb-2">{badge.icon}</div>
          <p className="text-sm font-semibold">{badge.title}</p>
          <p className="text-xs opacity-80 mt-1">{badge.description}</p>
        </div>
      ))}
    </div>
  )
}

/**
 * 支付方式展示组件
 */
export function PaymentMethods({
  showLabels = true,
  className = "",
}: {
  showLabels?: boolean
  className?: string
}) {
  const payments = [
    { name: "Visa", icon: "💳" },
    { name: "Mastercard", icon: "💳" },
    { name: "American Express", icon: "💳" },
  ]

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {showLabels && (
        <span className="text-xs text-muted-foreground">安全支付:</span>
      )}
      {payments.map((payment, index) => (
        <div
          key={index}
          className="px-2 py-1 bg-muted rounded text-xs font-medium"
        >
          {payment.icon} {payment.name}
        </div>
      ))}
    </div>
  )
}

/**
 * 安全认证徽章组件
 */
export function SecurityBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      <ShieldCheck size={16} className="text-success" />
      <span>受 SSL 加密保护</span>
      <span>•</span>
      <Globe size={16} className="text-brand" />
      <span>符合 GDPR 标准</span>
    </div>
  )
}

/**
 * 完整信任栏组件 (用于商品详情页)
 */
export function TrustBar({
  showPayment = true,
  className = "",
}: {
  showPayment?: boolean
  className?: string
}) {
  return (
    <Card className={className}>
      <CardContent className="p-3 md:p-4">
        <div className="space-y-3 md:space-y-4">
          {/* 信任徽章 - 移动端grid，PC端row */}
          <div className="grid grid-cols-2 md:hidden gap-2">
            {defaultBadges.map((badge, index) => (
              <div
                key={index}
                className={`flex flex-col items-center text-center p-2 rounded-xl border ${colorStyles[badge.color]}`}
              >
                <div className="mb-1 scale-75">{badge.icon}</div>
                <p className="text-xs font-semibold">{badge.title}</p>
                <p className="text-[10px] opacity-80 mt-0.5">{badge.description}</p>
              </div>
            ))}
          </div>
          <div className="hidden md:block">
            <TrustBadges variant="row" />
          </div>

          {/* 分隔线 */}
          {showPayment && <div className="border-t" />}

          {/* 支付方式 */}
          {showPayment && (
            <div className="pt-2 md:pt-4">
              <PaymentMethods showLabels />
            </div>
          )}

          {/* 安全认证 */}
          <div className="pt-2 md:pt-4 border-t">
            <SecurityBadge />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
