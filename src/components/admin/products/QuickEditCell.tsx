/**
 * ============================================
 * 快速编辑单元格组件 (v1.2 Phase 1)
 * ============================================
 * 功能说明：
 *   - 支持行内编辑价格和库存
 *   - 单击进入编辑模式，Enter保存，Esc取消
 *   - 乐观更新，失败时回滚并提示
 *   - 输入验证（价格>0，库存>=0）
 * ============================================
 * i18n: 使用 src/i18n/messages 中的翻译键
 * ============================================
 */

import { useState, useRef, useCallback, KeyboardEvent } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

/**
 * 编辑类型枚举
 */
type EditType = "price" | "stock"

/**
 * 快速编辑单元格组件属性
 */
interface QuickEditCellProps {
  /** 当前值 */
  value: number
  /** 编辑类型 */
  type: EditType
  /** 商品ID */
  productId: string
  /** 保存回调 */
  onSave: (productId: string, type: EditType, value: number) => Promise<boolean>
  /** 数字格式化选项 */
  formatOptions?: Intl.NumberFormatOptions
}

/**
 * 快速编辑单元格组件
 *
 * 使用方式：
 * <QuickEditCell
 *   value={product.price}
 *   type="price"
 *   productId={product.id}
 *   onSave={handleQuickSave}
 * />
 */
export function QuickEditCell({
  value,
  type,
  productId,
  onSave,
  formatOptions = {},
}: QuickEditCellProps) {
  const t = useTranslations("admin.products.quickEdit")

  // 编辑状态
  const [isEditing, setIsEditing] = useState(false)
  // 编辑值
  const [editValue, setEditValue] = useState(value.toString())
  // 原始值（用于回滚）
  const originalValueRef = useRef(value)
  // 输入框引用
  const inputRef = useRef<HTMLInputElement>(null)

  /**
   * 进入编辑模式
   */
  const handleStartEdit = useCallback(() => {
    setIsEditing(true)
    setEditValue(value.toString())
    originalValueRef.current = value
    // 聚焦输入框并选中内容
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    }, 0)
  }, [value])

  /**
   * 验证输入值
   */
  const validateValue = useCallback((val: string): number | null => {
    const num = parseFloat(val)
    if (isNaN(num)) return null
    if (type === "price" && num <= 0) return null
    if (type === "stock" && num < 0) return null
    return num
  }, [type])

  /**
   * 保存编辑
   */
  const handleSave = useCallback(async () => {
    const validatedValue = validateValue(editValue)

    if (validatedValue === null) {
      toast.error(type === "price" ? t("invalidPrice") : t("invalidStock"))
      return
    }

    // 值未改变，直接退出编辑
    if (validatedValue === originalValueRef.current) {
      setIsEditing(false)
      return
    }

    // 乐观更新：先更新UI
    setIsEditing(false)

    // 调用保存回调
    const success = await onSave(productId, type, validatedValue)

    if (!success) {
      // 保存失败，回滚到原始值
      setEditValue(originalValueRef.current.toString())
      toast.error(type === "price" ? t("priceUpdated").split("已")[0] + t("updateFailed") : t("stockUpdated").split("已")[0] + t("updateFailed"))
    } else {
      toast.success(type === "price" ? t("priceUpdated") : t("stockUpdated"))
    }
  }, [editValue, validateValue, onSave, productId, type, t])

  /**
   * 取消编辑
   */
  const handleCancel = useCallback(() => {
    setEditValue(originalValueRef.current.toString())
    setIsEditing(false)
  }, [])

  /**
   * 键盘事件处理
   */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleSave()
      } else if (e.key === "Escape") {
        e.preventDefault()
        handleCancel()
      }
    },
    [handleSave, handleCancel]
  )

  /**
   * 失去焦点时保存
   */
  const handleBlur = useCallback(() => {
    // 延迟执行，确保点击事件先处理
    setTimeout(() => {
      handleSave()
    }, 200)
  }, [handleSave])

  // 格式化显示值
  const displayValue =
    type === "price"
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          ...formatOptions,
        }).format(value)
      : value.toString()

  // 编辑模式
  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="number"
        step={type === "price" ? "0.01" : "1"}
        min={type === "price" ? "0.01" : "0"}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="h-8 w-24 text-sm"
        autoFocus
      />
    )
  }

  // 显示模式
  return (
    <button
      onClick={handleStartEdit}
      className="text-left hover:bg-muted/50 px-2 py-1 rounded transition-colors cursor-pointer min-w-[60px]"
      title={t("clickToEdit")}
    >
      <span className={type === "price" ? "font-medium" : ""}>
        {displayValue}
      </span>
    </button>
  )
}
