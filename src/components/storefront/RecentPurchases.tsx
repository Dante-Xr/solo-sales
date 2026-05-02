/**
 * 修改时间：2026-05-02 21:19:13 +08:00
 * 修改内容：清理最近购买提示中未使用的英文地区列表，推进 M5 lint warnings 收敛。
 * 修改模型：gpt-5.5
 */

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

/**
 * 检测页面中是否存在底部栏（BottomNav 或结账栏）
 * @returns 是否存在底部栏
 */
function hasBottomBar(): boolean {
  if (typeof document === "undefined") return false
  // 检测 BottomNav 组件（固定底部导航）
  const bottomNav = document.querySelector("nav[aria-label]")
  // 检测固定底部结账栏
  const checkoutBar = document.querySelector(".fixed.bottom-0")
  return !!(bottomNav || checkoutBar)
}

export function RecentPurchases() {
  const t = useTranslations("urgency")
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [message, setMessage] = useState("")
  const [timeLabel, setTimeLabel] = useState("")
  /** 底部栏存在时增加偏移 */
  const [bottomOffset, setBottomOffset] = useState(16)

  /** 检测底部栏并调整偏移 */
  useEffect(() => {
    const checkBottomBar = () => {
      setBottomOffset(hasBottomBar() ? 80 : 16)
    }
    checkBottomBar()
    // 页面加载后延迟再次检测（底部栏可能延迟渲染）
    const timer = setTimeout(checkBottomBar, 1000)
    return () => clearTimeout(timer)
  }, [])

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
    <div className="fixed left-4 z-50" style={{ bottom: `${bottomOffset}px` }}>
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
