"use client"

import { useState, useEffect, useCallback } from "react"
import { X, ShoppingCart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslations } from "next-intl"

const REGIONS_ZH = [
  "北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京",
  "重庆", "西安", "苏州", "长沙", "天津", "青岛", "郑州", "东莞",
  "纽约", "洛杉矶", "伦敦", "东京", "首尔", "新加坡", "悉尼",
]

const REGIONS_EN = [
  "New York", "Los Angeles", "London", "Tokyo", "Seoul", "Singapore",
  "Sydney", "Toronto", "Paris", "Berlin", "Dubai", "Mumbai",
  "Beijing", "Shanghai", "Shenzhen", "Hangzhou",
]

const PRODUCTS = [
  "Wireless Earbuds Pro", "Smart Watch X1", "LED Desk Lamp",
  "Portable Charger", "Bluetooth Speaker", "Phone Case",
  "USB-C Hub", "Mechanical Keyboard", "Mouse Pad XL",
  "Webcam HD", "Ring Light", "Cable Organizer",
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInterval(): number {
  return 5000 + Math.random() * 3000
}

export function RecentPurchases() {
  const t = useTranslations("urgency")
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [message, setMessage] = useState("")
  const [timeLabel, setTimeLabel] = useState("")

  const showNotification = useCallback(() => {
    if (dismissed) return

    const region = randomItem(REGIONS_ZH)
    const product = randomItem(PRODUCTS)
    setMessage(t("recentPurchase", { region, product }))
    setTimeLabel(t("justNow"))
    setVisible(true)

    const hideTimer = setTimeout(() => {
      setVisible(false)
    }, 5000)

    return () => clearTimeout(hideTimer)
  }, [dismissed, t])

  useEffect(() => {
    if (dismissed) return

    const initialTimer = setTimeout(() => {
      showNotification()
    }, 3000)

    const intervalId = setInterval(() => {
      showNotification()
    }, randomInterval())

    return () => {
      clearTimeout(initialTimer)
      clearInterval(intervalId)
    }
  }, [dismissed, showNotification])

  if (dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Card
        className={`shadow-lg border-none transition-all duration-500 ease-in-out max-w-[300px] ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <CardContent className="p-3 flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs leading-snug text-foreground">{message}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{timeLabel}</p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
