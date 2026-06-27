/**
 * ============================================
 * 产品表格行组件 (v0.4.2)
 * ============================================
 * 修改时间：2026-06-27 05:25:00 +08:00
 * 修改内容：使用统一格式化工具函数替换本地重复代码
 * 修改依据：前端开发者专家建议 - P2优先级
 * 功能说明：
 *   - PC 端产品列表表格行组件
 *   - 使用 React.memo 优化渲染性能
 *   - 统一表格行样式
 * ============================================
 */

import { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ToggleLeft, ToggleRight, ImageIcon } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/format"

/**
 * 产品数据类型（与 products/page.tsx 保持一致）
 */
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

interface ProductRowProps {
  product: Product
  onEdit: (product?: Product) => void
  onDelete: (product: Product) => void
  onToggleStatus: (product: Product) => void
  isZh: boolean
}

/**
 * 产品表格行组件
 * 使用 memo 包装避免不必要的重新渲染
 */
const ProductRowComponent = ({
  product,
  onEdit,
  onDelete,
  onToggleStatus,
  isZh,
}: ProductRowProps) => {
  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      {/* 产品名称 */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {product.images && product.images.length > 0 ? (
            <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <span className="font-medium">{product.name}</span>
            {product.sku && (
              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
            )}
          </div>
        </div>
      </td>

      {/* 分类 */}
      <td className="px-4 py-3">
        {product.category ? (
          <Badge variant="outline">{product.category.name}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </td>

      {/* 价格 */}
      <td className="px-4 py-3 font-medium">{formatCurrency(product.price)}</td>

      {/* 库存 */}
      <td className="px-4 py-3">
        <span className={product.stock <= 10 ? "text-warning font-medium" : ""}>
          {product.stock}
          {product.stock <= 10 && (
            <span className="text-xs ml-1">({isZh ? "低库存" : "Low"})</span>
          )}
        </span>
      </td>

      {/* 状态 */}
      <td className="px-4 py-3">
        <button
          onClick={() => onToggleStatus(product)}
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
        >
          {product.isPublished ? (
            <>
              <ToggleRight className="w-4 h-4 text-success" />
              <span className="text-sm text-success">{isZh ? "上架" : "Active"}</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{isZh ? "下架" : "Inactive"}</span>
            </>
          )}
        </button>
      </td>

      {/* 创建日期 */}
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDate(product.createdAt, isZh ? "zh-CN" : "en-US")}
      </td>

      {/* 操作按钮 */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(product)}
          >
            <Edit className="w-4 h-4 mr-1" />
            {isZh ? "编辑" : "Edit"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(product)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {isZh ? "删除" : "Delete"}
          </Button>
        </div>
      </td>
    </tr>
  )
}

/**
 * 使用 React.memo 包装组件
 * 仅在 props 变化时重新渲染
 */
export const ProductRow = memo(ProductRowComponent, (prevProps, nextProps) => {
  // 自定义比较函数，优化渲染性能
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.name === nextProps.product.name &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.stock === nextProps.product.stock &&
    prevProps.product.isPublished === nextProps.product.isPublished &&
    prevProps.isZh === nextProps.isZh
  )
})
