/**
 * 修改时间：2026-05-02 21:19:13 +08:00
 * 修改内容：清理功能区未使用的视口模式状态读取，推进 M5 lint warnings 收敛。
 * 修改模型：gpt-5.5
 */

"use client"

import { Rocket, Shield, Package, MessageCircle } from "lucide-react"
import { useTranslations } from "next-intl"

interface Feature {
  icon: React.ReactNode
  titleKey: string
  descriptionKey: string
}

const features: Feature[] = [
  {
    icon: <Rocket className="w-6 h-6" />,
    titleKey: "fastResponse",
    descriptionKey: "fastResponseDesc",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    titleKey: "securePayment",
    descriptionKey: "securePaymentDesc",
  },
  {
    icon: <Package className="w-6 h-6" />,
    titleKey: "freeReturns",
    descriptionKey: "freeReturnsDesc",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    titleKey: "support247",
    descriptionKey: "support247Desc",
  },
]

const iconBgColors = [
  "bg-brand/10 text-brand",
  "bg-success/10 text-success",
  "bg-accent/10 text-accent",
  "bg-info/10 text-info",
]

export function FeatureSection() {
  const t = useTranslations('feature')

  return (
    <section id="features" className="border-y border-border bg-muted/55 py-9 sm:py-11">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-7 lg:grid-cols-4 lg:gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group flex items-center gap-3 text-left"
            >
              <div
                className={`grid size-12 shrink-0 place-items-center rounded-full ${iconBgColors[index]} transition-transform duration-200 group-hover:scale-110`}
              >
                {feature.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground sm:text-base">{t(feature.titleKey)}</h3>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {t(feature.descriptionKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
