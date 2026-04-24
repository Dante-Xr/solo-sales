"use client"

import { Rocket, Shield, Package, MessageCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { useViewportModeStore } from "@/stores/useViewportModeStore"

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
  "bg-blue-50 text-blue-600",
  "bg-green-50 text-green-600",
  "bg-orange-50 text-orange-600",
  "bg-purple-50 text-purple-600",
]

export function FeatureSection() {
  const t = useTranslations('feature')
  const { mode: viewportMode } = useViewportModeStore()
  const isMobileView = viewportMode === "mobile"

  return (
    <section className="bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-3 md:p-4 bg-background rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 group"
            >
              <div
                className={`p-2 md:p-3 rounded-full mb-2 md:mb-3 ${iconBgColors[index]} group-hover:scale-110 transition-transform duration-200`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xs md:text-sm font-semibold mb-1 md:mb-2">
                {t(feature.titleKey)}
              </h3>
              <p className={`text-[10px] md:text-xs text-muted-foreground ${isMobileView ? "" : "hidden sm:block"}`}>
                {t(feature.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
