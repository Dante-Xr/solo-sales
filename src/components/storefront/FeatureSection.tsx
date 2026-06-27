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
    <section className="bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-3 md:p-4 bg-background rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 group"
            >
              <div
                className={`p-2 md:p-3 rounded-full mb-2 md:mb-3 ${iconBgColors[index]} group-hover:scale-110 transition-transform duration-200`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xs md:text-sm font-semibold mb-1 md:mb-2">
                {t(feature.titleKey)}
              </h3>
              <p className={`text-[10px] md:text-xs text-muted-foreground line-clamp-2 md:line-clamp-none`}>
                {t(feature.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
