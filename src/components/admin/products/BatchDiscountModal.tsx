/**
 * ============================================
 * 批量折扣弹窗组件 (v1.2 Phase 1)
 * ============================================
 * 功能说明：
 *   - 选择多个商品后统一设置折扣
 *   - 支持百分比折扣、固定金额减免、直接设置新价格
 *   - 预览折扣后价格
 *   - 支持恢复原价功能
 * ============================================
 * i18n: 使用 src/i18n/messages 中的翻译键
 * ============================================
 */

import { useState, useCallback, useMemo } from "react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Percent, DollarSign, Tag, RotateCcw } from "lucide-react"
import { toast } from "sonner"

/**
 * 折扣类型枚举
 */
type DiscountType = "percentage" | "fixed" | "override"

/**
 * 商品数据
 */
interface Product {
  id: string
  name: string
  price: number
}

/**
 * 批量折扣弹窗组件属性
 */
interface BatchDiscountModalProps {
  /** 是否打开 */
  open: boolean
  /** 关闭回调 */
  onClose: () => void
  /** 选中的商品 */
  selectedProducts: Product[]
  /** 应用折扣回调 */
  onApply: (
    productIds: string[],
    type: DiscountType,
    value: number
  ) => Promise<boolean>
}

/**
 * 批量折扣弹窗组件
 */
export function BatchDiscountModal({
  open,
  onClose,
  selectedProducts,
  onApply,
}: BatchDiscountModalProps) {
  const t = useTranslations("admin.products.batchDiscount")

  // 折扣类型
  const [discountType, setDiscountType] = useState<DiscountType>("percentage")
  // 折扣值
  const [discountValue, setDiscountValue] = useState("")
  // 是否正在应用
  const [isApplying, setIsApplying] = useState(false)

  /**
   * 计算折扣后价格
   */
  const calculateDiscountedPrice = useCallback(
    (originalPrice: number): number => {
      const value = parseFloat(discountValue)
      if (isNaN(value) || value < 0) return originalPrice

      switch (discountType) {
        case "percentage":
          const percent = Math.min(value, 100)
          return originalPrice * (1 - percent / 100)
        case "fixed":
          return Math.max(0, originalPrice - value)
        case "override":
          return value
        default:
          return originalPrice
      }
    },
    [discountType, discountValue]
  )

  /**
   * 验证输入
   */
  const validateInput = useCallback((): boolean => {
    const value = parseFloat(discountValue)
    if (isNaN(value) || value < 0) {
      toast.error(t("invalidDiscount"))
      return false
    }

    if (discountType === "percentage" && value > 100) {
      toast.error(t("percentageExceed"))
      return false
    }

    return true
  }, [discountValue, discountType, t])

  /**
   * 应用折扣
   */
  const handleApply = useCallback(async () => {
    if (!validateInput()) return
    if (selectedProducts.length === 0) {
      toast.error(t("pleaseSelectProducts"))
      return
    }

    setIsApplying(true)
    const productIds = selectedProducts.map((p) => p.id)
    const value = parseFloat(discountValue)

    const success = await onApply(productIds, discountType, value)

    setIsApplying(false)

    if (success) {
      toast.success(t("discountSuccess", { count: selectedProducts.length }))
      onClose()
      setDiscountValue("")
      setDiscountType("percentage")
    } else {
      toast.error(t("discountFailed"))
    }
  }, [validateInput, selectedProducts, onApply, discountType, discountValue, t, onClose])

  /**
   * 恢复原价
   */
  const handleReset = useCallback(async () => {
    if (selectedProducts.length === 0) {
      toast.error(t("pleaseSelectProducts"))
      return
    }

    setIsApplying(true)
    const productIds = selectedProducts.map((p) => p.id)

    const success = await onApply(productIds, "override", 0)

    setIsApplying(false)

    if (success) {
      toast.success(t("resetSuccess", { count: selectedProducts.length }))
      onClose()
    } else {
      toast.error(t("resetFailed"))
    }
  }, [selectedProducts, onApply, t, onClose])

  /**
   * 价格预览数据
   */
  const pricePreview = useMemo(() => {
    if (!discountValue || isNaN(parseFloat(discountValue))) return null

    return selectedProducts.slice(0, 3).map((product) => ({
      name: product.name,
      originalPrice: product.price,
      discountedPrice: calculateDiscountedPrice(product.price),
    }))
  }, [selectedProducts, discountValue, calculateDiscountedPrice])

  /**
   * 折扣类型选项
   */
  const discountTypeOptions = [
    {
      value: "percentage" as const,
      label: t("percentage"),
      icon: Percent,
    },
    {
      value: "fixed" as const,
      label: t("fixedAmount"),
      icon: DollarSign,
    },
    {
      value: "override" as const,
      label: t("newPrice"),
      icon: Tag,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("applyingTo", { count: selectedProducts.length })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 折扣类型选择 */}
          <div className="space-y-3">
            <Label>{t("discountType")}</Label>
            <div className="flex gap-2">
              {discountTypeOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={discountType === option.value ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setDiscountType(option.value)}
                >
                  <option.icon className="mr-1 h-4 w-4" />
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 折扣值输入 */}
          <div className="space-y-2">
            <Label htmlFor="discount-value">
              {discountType === "percentage"
                ? t("discountPercentage")
                : discountType === "fixed"
                  ? t("discountAmount")
                  : t("setNewPrice")}
            </Label>
            <Input
              id="discount-value"
              type="number"
              step={discountType === "percentage" ? "1" : "0.01"}
              min="0"
              max={discountType === "percentage" ? "100" : undefined}
              placeholder={
                discountType === "percentage"
                  ? "20"
                  : discountType === "fixed"
                    ? "10.00"
                    : "99.99"
              }
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          </div>

          {/* 价格预览 */}
          {pricePreview && pricePreview.length > 0 && (
            <div className="space-y-2">
              <Label>{t("preview")}</Label>
              <div className="rounded-md border p-3 space-y-2">
                {pricePreview.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[150px]" title={item.name}>
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground line-through">
                        ${item.originalPrice.toFixed(2)}
                      </span>
                      <Badge variant="secondary" className="text-green-600">
                        ${item.discountedPrice.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                ))}
                {selectedProducts.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    {t("andMore", { count: selectedProducts.length - 3 })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isApplying}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {t("resetPrice")}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isApplying}>
              {isApplying ? t("applying") : "Cancel"}
            </Button>
            <Button onClick={handleApply} disabled={isApplying || !discountValue}>
              {isApplying ? t("applying") : t("applyDiscount")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
