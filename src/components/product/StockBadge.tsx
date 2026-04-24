"use client"

import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"

interface StockBadgeProps {
  stock: number
}

export function StockBadge({ stock }: StockBadgeProps) {
  const t = useTranslations("urgency")

  if (stock > 50) return null

  if (stock === 0) {
    return (
      <Badge className="bg-gray-500 hover:bg-gray-600 border-none text-white text-xs px-2.5 py-1">
        {t("soldOut")}
      </Badge>
    )
  }

  if (stock <= 10) {
    return (
      <Badge className="bg-red-500 hover:bg-red-600 border-none text-white text-xs px-2.5 py-1">
        {t("onlyLeft", { count: stock })}
      </Badge>
    )
  }

  return (
    <Badge className="bg-yellow-500 hover:bg-yellow-600 border-none text-white text-xs px-2.5 py-1">
      {t("lowStock")}
    </Badge>
  )
}
