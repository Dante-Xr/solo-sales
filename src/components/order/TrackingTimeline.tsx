"use client"

// 2026-04-13: 更新为使用 next-intl 国际化

import { CheckCircle2, Circle, Truck, Package, CreditCard } from "lucide-react"
import { useTranslations } from "next-intl"

interface TimelineStep {
  status: string
  label: string
  icon: React.ReactNode
  completed: boolean
}

interface TrackingTimelineProps {
  currentStatus: string
}

const statusOrder = ["PENDING", "PAID", "SHIPPED", "DELIVERED"]

export function TrackingTimeline({ currentStatus }: TrackingTimelineProps) {
  const t = useTranslations('orders')

  const currentIndex = statusOrder.indexOf(currentStatus)

  const steps: TimelineStep[] = [
    {
      status: "PAID",
      label: t('paidStatus'),
      icon: <CreditCard className="w-5 h-5" />,
      completed: currentIndex >= 1,
    },
    {
      status: "SHIPPED",
      label: t('shippedStatus'),
      icon: <Truck className="w-5 h-5" />,
      completed: currentIndex >= 2,
    },
    {
      status: "DELIVERED",
      label: t('deliveredStatus'),
      icon: <CheckCircle2 className="w-5 h-5" />,
      completed: currentIndex >= 3,
    },
  ]

  if (currentStatus === "CANCELLED") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <Circle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <p className="text-red-600 font-medium">{t('orderCancelled')}</p>
      </div>
    )
  }

  if (currentStatus === "PENDING") {
    return (
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-center">
        <Package className="w-8 h-8 mx-auto mb-2 text-warning" />
        <p className="text-warning font-medium">{t('waitingPayment')}</p>
        <p className="text-sm text-warning mt-1">{t('pleasePay')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">{t('orderTracking')}</h3>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.status} className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step.completed
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {step.icon}
            </div>
            <p
              className={`text-xs mt-2 text-center ${
                step.completed ? "text-success" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </p>
            {index < steps.length - 1 && (
              <div
                className={`absolute h-0.5 w-full bg-gray-200 ${
                  step.completed ? "bg-green-500" : ""
                }`}
                style={{
                  left: "50%",
                  width: "calc(100% - 2.5rem)",
                  top: "1.25rem",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
