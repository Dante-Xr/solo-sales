/**
 * ============================================
 * 库存快速调整组件 (v1.2 Phase 1)
 * ============================================
 * 功能说明：
 *   - 支持 +/- 按钮快速调整库存
 *   - 支持直接输入修改
 *   - 库存预警显示（<10 标红）
 *   - 支持批量调整库存
 * ============================================
 * i18n: 使用 src/i18n/messages 中的翻译键
 * ============================================
 */

import { useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus } from "lucide-react"
import { toast } from "sonner"

/**
 * 库存调整器组件属性
 */
interface StockAdjusterProps {
  /** 当前库存 */
  stock: number
  /** 商品ID */
  productId: string
  /** 保存回调 */
  onSave: (productId: string, newStock: number) => Promise<boolean>
  /** 是否紧凑模式（表格内使用） */
  compact?: boolean
}

/**
 * 库存调整器组件
 *
 * 使用方式：
 * <StockAdjuster
 *   stock={product.stock}
 *   productId={product.id}
 *   onSave={handleStockSave}
 *   compact={true}
 * />
 */
export function StockAdjuster({
  stock,
  productId,
  onSave,
  compact = false,
}: StockAdjusterProps) {
  const t = useTranslations("admin.products.stockAdjuster")

  // 输入值
  const [inputValue, setInputValue] = useState(stock.toString())
  // 是否正在保存
  const [isSaving, setIsSaving] = useState(false)

  /**
   * 调整库存
   */
  const handleAdjust = useCallback(async (delta: number) => {
    const newStock = Math.max(0, stock + delta)

    if (newStock === stock) return

    setIsSaving(true)
    const success = await onSave(productId, newStock)
    setIsSaving(false)

    if (success) {
      setInputValue(newStock.toString())
      toast.success(
        delta > 0
          ? t("stockIncreased", { count: newStock })
          : t("stockDecreased", { count: newStock })
      )
    } else {
      toast.error(t("updateFailed"))
    }
  }, [stock, productId, onSave, t])

  /**
   * 直接输入保存
   */
  const handleInputSave = useCallback(async () => {
    const newStock = parseInt(inputValue, 10)

    if (isNaN(newStock) || newStock < 0) {
      toast.error(t("invalidStock"))
      setInputValue(stock.toString())
      return
    }

    if (newStock === stock) return

    setIsSaving(true)
    const success = await onSave(productId, newStock)
    setIsSaving(false)

    if (success) {
      toast.success(t("stockUpdatedTo", { count: newStock }))
    } else {
      setInputValue(stock.toString())
      toast.error(t("updateFailed"))
    }
  }, [inputValue, stock, productId, onSave, t])

  /**
   * 键盘事件
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleInputSave()
    }
  }, [handleInputSave])

  /**
   * 失去焦点保存
   */
  const handleBlur = useCallback(() => {
    handleInputSave()
  }, [handleInputSave])

  // 库存预警样式
  const stockClassName =
    stock <= 10 ? "text-warning font-medium" : ""

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => handleAdjust(-1)}
          disabled={isSaving || stock <= 0}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          min="0"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={`h-7 w-14 text-center text-sm ${stockClassName}`}
          disabled={isSaving}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => handleAdjust(1)}
          disabled={isSaving}
        >
          <Plus className="h-3 w-3" />
        </Button>
        {stock <= 10 && (
          <span className="text-xs text-warning ml-1">
            {t("low")}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleAdjust(-10)}
        disabled={isSaving || stock < 10}
      >
        <Minus className="h-4 w-4" />
        <span className="sr-only">-10</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleAdjust(-1)}
        disabled={isSaving || stock <= 0}
      >
        <Minus className="h-4 w-4" />
        <span className="sr-only">-1</span>
      </Button>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="0"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={`w-20 text-center ${stockClassName}`}
          disabled={isSaving}
        />
        {stock <= 10 && (
          <span className="text-sm text-warning">
            {t("stockInsufficient")}
          </span>
        )}
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleAdjust(1)}
        disabled={isSaving}
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">+1</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleAdjust(10)}
        disabled={isSaving}
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">+10</span>
      </Button>
    </div>
  )
}
