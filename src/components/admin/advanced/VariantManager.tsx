/**
 * 修改时间：2026-05-02 21:19:13 +08:00
 * 修改内容：清理未使用的变体操作图标导入，推进 M5 lint warnings 收敛。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 商品变体管理组件 (v1.2 Phase 4)
 * ============================================
 * 功能说明：
 *   - 定义商品属性组（颜色、尺寸、材质等）
 *   - 自动生成变体组合矩阵
 *   - 每个变体独立设置 SKU/价格/库存/图片
 *   - 批量编辑变体价格和库存
 *   - 支持变体启用/禁用
 * ============================================
 */

"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import {
  Plus,
  Trash2,
  X,
  Package,
  AlertTriangle,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ==================== 类型定义 ====================

/** 属性选项 */
interface AttributeOption {
  value: string
}

/** 属性组（如颜色、尺寸） */
interface AttributeGroup {
  id: string
  name: string
  options: AttributeOption[]
}

/** 单个变体 */
interface Variant {
  id: string
  sku: string
  attributes: Record<string, string>
  price: number
  stock: number
  image?: string
  enabled: boolean
}

// ==================== 常量 ====================

/** 预设属性组模板 */
const PRESET_GROUPS: { name: string; options: string[] }[] = [
  { name: "Color", options: ["Black", "White", "Red", "Blue", "Green", "Gray"] },
  { name: "Size", options: ["S", "M", "L", "XL", "2XL", "3XL"] },
  { name: "Material", options: ["Cotton", "Polyester", "Leather", "Wool", "Silk"] },
  { name: "Style", options: ["Classic", "Modern", "Vintage", "Sport"] },
]

let attributeGroupSequence = 0

function createAttributeGroupId(): string {
  // 属性组 ID 只需在当前页面会话内稳定唯一，模块级递增避免渲染期 impure 调用。
  attributeGroupSequence += 1
  return `group-${attributeGroupSequence}`
}

// ==================== 工具函数 ====================

/** 生成变体组合 */
function generateVariantCombinations(
  groups: AttributeGroup[],
  baseSku: string,
  basePrice: number,
  baseStock: number
): Variant[] {
  if (groups.length === 0 || groups.some((g) => g.options.length === 0)) return []

  const combinations = cartesianProduct(groups)
  return combinations.map((attrs, index) => {
    const skuParts = Object.values(attrs).map((v) => v.toUpperCase().replace(/\s/g, "-"))
    return {
      id: `variant-${index}-${Date.now()}`,
      sku: `${baseSku}-${skuParts.join("-")}`,
      attributes: attrs,
      price: basePrice,
      stock: baseStock,
      enabled: true,
    }
  })
}

/** 笛卡尔积 */
function cartesianProduct(groups: AttributeGroup[]): Record<string, string>[] {
  if (groups.length === 0) return []

  let results: Record<string, string>[] = [{ }]

  for (const group of groups) {
    const next: Record<string, string>[] = []
    for (const result of results) {
      for (const option of group.options) {
        next.push({ ...result, [ group.name]: option.value })
      }
    }
    results = next
  }

  return results
}

// ==================== 组件 Props ====================

interface VariantManagerProps {
  baseSku?: string
  basePrice?: number
  baseStock?: number
  initialVariants?: Variant[]
  onChange?: (variants: Variant[], groups: AttributeGroup[]) => void
}

// ==================== 子组件：属性组编辑器 ====================

function AttributeGroupsEditor({
  groups,
  onGroupsChange,
}: {
  groups: AttributeGroup[]
  onGroupsChange: (groups: AttributeGroup[]) => void
}) {
  const t = useTranslations("admin.advanced.variants")
  const [newGroupName, setNewGroupName] = useState("")

  /** 添加属性组 */
  const addGroup = (name: string) => {
    if (!name.trim()) return
    const trimmed = name.trim()
    if (groups.some((g) => g.name === trimmed)) return
    const newGroup: AttributeGroup = {
      id: createAttributeGroupId(),
      name: trimmed,
      options: [],
    }
    onGroupsChange([...groups, newGroup])
    setNewGroupName("")
  }

  /** 添加预设属性组 */
  const addPresetGroup = (preset: (typeof PRESET_GROUPS)[0]) => {
    if (groups.some((g) => g.name === preset.name)) return
    const newGroup: AttributeGroup = {
      id: createAttributeGroupId(),
      name: preset.name,
      options: preset.options.map((v) => ({ value: v })),
    }
    onGroupsChange([...groups, newGroup])
  }

  /** 移除属性组 */
  const removeGroup = (id: string) => {
    onGroupsChange(groups.filter((g) => g.id !== id))
  }

  /** 添加选项 */
  const addOption = (groupId: string, value: string) => {
    if (!value.trim()) return
    onGroupsChange(
      groups.map((g) => {
        if (g.id !== groupId) return g
        if (g.options.some((o) => o.value === value.trim())) return g
        return { ...g, options: [...g.options, { value: value.trim() }] }
      })
    )
  }

  /** 移除选项 */
  const removeOption = (groupId: string, optionValue: string) => {
    onGroupsChange(
      groups.map((g) => {
        if (g.id !== groupId) return g
        return { ...g, options: g.options.filter((o) => o.value !== optionValue) }
      })
    )
  }

  /** 重命名属性组 */
  const renameGroup = (id: string, newName: string) => {
    if (!newName.trim()) return
    if (groups.some((g) => g.id !== id && g.name === newName.trim())) return
    onGroupsChange(
      groups.map((g) => (g.id === id ? { ...g, name: newName.trim() } : g))
    )
  }

  const usedPresets = groups.map((g) => g.name)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium">{t("attributeGroups")}</h3>
      </div>

      {/* 预设模板 */}
      <div className="flex flex-wrap gap-2">
        {PRESET_GROUPS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => addPresetGroup(preset)}
            disabled={usedPresets.includes(preset.name)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-full border border-border hover:bg-muted transition-colors",
              usedPresets.includes(preset.name) && "opacity-50 cursor-not-allowed bg-muted"
            )}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* 已添加的属性组 */}
      {groups.map((group) => (
        <div key={group.id} className="border border-border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <input
              value={group.name}
              onChange={(e) => renameGroup(group.id, e.target.value)}
              className="text-sm font-medium bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none px-1 py-0.5 w-24"
            />
            <button
              onClick={() => removeGroup(group.id)}
              className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
              title={t("removeGroup")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 选项列表 */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {group.options.map((opt) => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted rounded-full text-xs"
              >
                {opt.value}
                <button
                  onClick={() => removeOption(group.id, opt.value)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          {/* 添加选项 */}
          <div className="flex items-center gap-1">
            <input
              placeholder={t("addOption")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addOption(group.id, (e.target as HTMLInputElement).value)
                  ;(e.target as HTMLInputElement).value = ""
                }
              }}
              className="flex-1 h-7 text-xs px-2 border border-border rounded bg-background outline-none focus:border-primary transition-colors"
            />
            <button
              onClick={(e) => {
                const input = (e.currentTarget.previousElementSibling as HTMLInputElement)
                addOption(group.id, input.value)
                input.value = ""
              }}
              className="p-1 rounded hover:bg-muted transition-colors"
              title={t("addOption")}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}

      {/* 添加自定义属性组 */}
      <div className="flex items-center gap-2">
        <input
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addGroup(newGroupName)
            }
          }}
          placeholder={t("customGroup")}
          className="flex-1 h-9 px-3 text-sm border border-border rounded-lg bg-background outline-none focus:border-primary transition-colors"
        />
        <button
          onClick={() => addGroup(newGroupName)}
          className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("addGroup")}
        </button>
      </div>
    </div>
  )
}

// ==================== 主组件 ====================

export function VariantManager({
  baseSku = "PROD",
  basePrice = 0,
  baseStock = 0,
  initialVariants,
  onChange,
}: VariantManagerProps) {
  const t = useTranslations("admin.advanced.variants")
  const [groups, setGroups] = useState<AttributeGroup[]>([])
  const [variants, setVariants] = useState<Variant[]>(initialVariants || [])

  /** 生成变体 */
  const handleGenerate = () => {
    const newVariants = generateVariantCombinations(groups, baseSku, basePrice, baseStock)
    setVariants(newVariants)
    onChange?.(newVariants, groups)
  }

  /** 更新单个变体字段 */
  const updateVariant = (id: string, field: keyof Variant, value: string | number | boolean) => {
    const updated = variants.map((v) =>
      v.id === id ? { ...v, [field]: value } : v
    )
    setVariants(updated)
    onChange?.(updated, groups)
  }

  /** 批量设置价格 */
  const batchSetPrice = (price: number) => {
    const updated = variants.map((v) => ({ ...v, price }))
    setVariants(updated)
    onChange?.(updated, groups)
  }

  /** 批量设置库存 */
  const batchSetStock = (stock: number) => {
    const updated = variants.map((v) => ({ ...v, stock }))
    setVariants(updated)
    onChange?.(updated, groups)
  }

  /** 切换变体启用状态 */
  const toggleVariant = (id: string) => {
    const updated = variants.map((v) =>
      v.id === id ? { ...v, enabled: !v.enabled } : v
    )
    setVariants(updated)
    onChange?.(updated, groups)
  }

  /** 删除变体 */
  const removeVariant = (id: string) => {
    const updated = variants.filter((v) => v.id !== id)
    setVariants(updated)
    onChange?.(updated, groups)
  }

  /** 是否有属性组可以生成变体 */
  const canGenerate = groups.length > 0 && groups.every((g) => g.options.length > 0)

  /** 变体总数与活跃数 */
  const variantCounts = useMemo(() => {
    const total = variants.length
    const active = variants.filter((v) => v.enabled).length
    return { total, active }
  }, [variants])

  return (
    <div className="space-y-6">
      {/* 属性组编辑区 */}
      <div className="border border-border rounded-lg p-4 bg-card">
        <h3 className="text-sm font-medium mb-4">{t("attributeSettings")}</h3>
        <AttributeGroupsEditor groups={groups} onGroupsChange={setGroups} />

        {/* 生成按钮 */}
        <div className="mt-4 pt-4 border-t border-border">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className={cn(
              "px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2",
              canGenerate
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <Package className="h-4 w-4" />
            {t("generateVariants")}
            {canGenerate && groups.length > 0 && (
              <span className="ml-1 text-xs opacity-70">
                ({groups.reduce((acc, g) => acc * g.options.length, 1)} {t("variants")})
              </span>
            )}
          </button>

          {!canGenerate && groups.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {t("eachGroupNeedsOptions")}
            </p>
          )}
        </div>
      </div>

      {/* 变体列表 */}
      {variants.length > 0 && (
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          {/* 表头 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-medium">{t("variantList")}</h3>
              <span className="text-xs text-muted-foreground">
                {t("variantCounts", { total: variantCounts.total, active: variantCounts.active })}
              </span>
            </div>

            {/* 批量操作 */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">{t("batchPrice")}:</label>
                <input
                  type="number"
                  placeholder={String(basePrice)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      batchSetPrice(Number((e.target as HTMLInputElement).value))
                      ;(e.target as HTMLInputElement).value = ""
                    }
                  }}
                  className="w-20 h-7 text-xs px-2 border border-border rounded bg-background outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">{t("batchStock")}:</label>
                <input
                  type="number"
                  placeholder={String(baseStock)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      batchSetStock(Number((e.target as HTMLInputElement).value))
                      ;(e.target as HTMLInputElement).value = ""
                    }
                  }}
                  className="w-20 h-7 text-xs px-2 border border-border rounded bg-background outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 变体表格 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">SKU</th>
                  {groups.map((g) => (
                    <th key={g.id} className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">
                      {g.name}
                    </th>
                  ))}
                  <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">
                    {t("price")}
                  </th>
                  <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">
                    {t("stock")}
                  </th>
                  <th className="text-center px-3 py-2 text-xs font-medium text-muted-foreground">
                    {t("enabled")}
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => (
                  <tr
                    key={variant.id}
                    className={cn(
                      "border-b border-border last:border-none transition-colors",
                      !variant.enabled && "opacity-50 bg-muted/10",
                      variant.stock <= 5 && variant.enabled && "bg-red-50/30 dark:bg-red-950/10"
                    )}
                  >
                    {/* SKU */}
                    <td className="px-4 py-2">
                      <input
                        value={variant.sku}
                        onChange={(e) => updateVariant(variant.id, "sku", e.target.value)}
                        className="w-full min-w-[120px] text-sm bg-transparent border border-transparent hover:border-border focus:border-primary rounded px-2 py-1 outline-none transition-colors"
                      />
                    </td>

                    {/* 属性值 */}
                    {groups.map((g) => (
                      <td key={g.id} className="px-3 py-2">
                        <span className="text-sm">
                          {variant.attributes[g.name] || "-"}
                        </span>
                      </td>
                    ))}

                    {/* 价格 */}
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => updateVariant(variant.id, "price", Number(e.target.value))}
                        className="w-20 text-right text-sm bg-transparent border border-transparent hover:border-border focus:border-primary rounded px-2 py-1 outline-none transition-colors"
                        min="0"
                        step="0.01"
                      />
                    </td>

                    {/* 库存 */}
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        {variant.stock <= 5 && variant.enabled && (
                          <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
                        )}
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(variant.id, "stock", Number(e.target.value))}
                          className="w-16 text-right text-sm bg-transparent border border-transparent hover:border-border focus:border-primary rounded px-2 py-1 outline-none transition-colors"
                          min="0"
                        />
                      </div>
                    </td>

                    {/* 启用状态 */}
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => toggleVariant(variant.id)}
                        className={cn(
                          "w-8 h-5 rounded-full transition-colors relative",
                          variant.enabled ? "bg-primary" : "bg-muted-foreground/30"
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm",
                            variant.enabled ? "left-[14px]" : "left-0.5"
                          )}
                        />
                      </button>
                    </td>

                    {/* 删除 */}
                    <td className="px-1 py-2">
                      <button
                        onClick={() => removeVariant(variant.id)}
                        className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
                        title={t("removeVariant")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 空状态 */}
          {variants.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{t("noVariants")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
