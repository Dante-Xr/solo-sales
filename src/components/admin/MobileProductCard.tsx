/**
 * ============================================
 * 移动端产品卡片组件 (v0.4.2)
 * ============================================
 * 修改时间：2026-06-27 05:20:00 +08:00
 * 修改内容：使用统一格式化工具函数替换本地重复代码
 * 修改依据：前端开发者专家建议 - P2优先级
 * 功能说明：
 *   - 移动端 (< 768px) 产品列表项卡片视图
 *   - 支持底部 Sheet 弹出操作菜单
 *   - 响应式信息展示
 *   - 触控区域优化 (44x44px 最小)
 * ============================================
 */

"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Edit, MoreVertical, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { formatCurrency } from "@/lib/format"

// 产品类型定义（与 products/page.tsx 保持一致）
interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  images: string[]
  sku: string | null
  isPublished: boolean
  category: { id: string; name: string } | null
  createdAt: string
  updatedAt: string
  _count?: { orderItems: number }
}

interface MobileProductCardProps {
  product: Product
  onEdit: (product?: Product) => void
  onDelete: (product: Product) => void
  onToggleStatus: (product: Product) => void
  isZh: boolean
}

/**
 * 移动端产品卡片组件
 */
export function MobileProductCard({
  product,
  onEdit,
  onDelete,
  onToggleStatus,
  isZh,
}: MobileProductCardProps) {
  const [actionsOpen, setActionsOpen] = useState(false)

  return (
    <div className="bg-background rounded-xl border shadow-sm p-4 mb-3">
      {/* 头部：产品名称和 分类 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-base truncate">{product.name}</h3>
          {product.category && (
            <Badge variant="outline" className="mt-1 text-xs">
              {product.category.name}
            </Badge>
          )}
        </div>
        {/* 操作按钮 */}
        <button
          onClick={() => setActionsOpen(true)}
          className="p-2 -mr-2 rounded-md hover:bg-muted active:bg-muted/80"
          aria-label="操作菜单"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* 价格和库存 */}
      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <p className="text-muted-foreground text-xs">{isZh ? "价格" : "Price"}</p>
          <p className="font-semibold">{formatCurrency(product.price)}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs">{isZh ? "库存" : "Stock"}</p>
          <p className={product.stock <= 10 ? "text-warning font-medium" : ""}>
            {product.stock}
          </p>
        </div>
      </div>

      {/* 状态和日期 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onToggleStatus(product)}
          className="flex items-center gap-1.5 text-sm py-2 -ml-2 rounded-md hover:bg-muted/50 active:bg-muted/30"
        >
          {product.isPublished ? (
            <>
              <ToggleRight className="w-5 h-5 text-success" />
              <span className="text-success">{isZh ? "上架中" : "Active"}</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground">{isZh ? "已下架" : "Inactive"}</span>
            </>
          )}
        </button>
        <span className="text-xs text-muted-foreground">
          {new Date(product.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* 底部操作 Sheet */}
      <Sheet open={actionsOpen} onOpenChange={setActionsOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-safe">
          <SheetHeader>
            <SheetTitle>{product.name}</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button
              variant="outline"
              className="h-12"
              onClick={() => {
                onEdit(product)
                setActionsOpen(false)
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              {isZh ? "编辑" : "Edit"}
            </Button>
            <Button
              variant="destructive"
              className="h-12"
              onClick={() => {
                onDelete(product)
                setActionsOpen(false)
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isZh ? "删除" : "Delete"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
