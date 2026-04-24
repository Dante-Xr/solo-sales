/**
 * ============================================
 * 产品表格行组件 (v1.2 Phase 1)
 * ============================================
 * 功能说明：
 *   - PC 端产品列表表格行组件
 *   - 使用 React.memo 优化渲染性能
 *   - 集成快速编辑功能（价格、库存行内编辑）
 *   - 集成库存快速调整器
 *   - 一键上下架开关
 * ============================================
 */

import { memo } from "react"
import { useTranslations } from "next-intl"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, ImageIcon } from "lucide-react"
import { QuickEditCell } from "./QuickEditCell"
import { StockAdjuster } from "./StockAdjuster"
import { Switch } from "@/components/ui/switch"

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
  /** 快速保存回调（价格/库存） */
  onQuickSave: (productId: string, type: "price" | "stock", value: number) => Promise<boolean>
}

/**
 * 格式化日期
 */
function formatDate(date: string, locale: string): string {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
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
  onQuickSave,
}: ProductRowProps) => {
  const t = useTranslations("admin.products.quickEdit")
  const tStatus = useTranslations("admin.products.stockAdjuster")

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

      {/* 价格 - 快速编辑 */}
      <td className="px-4 py-3">
        <QuickEditCell
          value={product.price}
          type="price"
          productId={product.id}
          onSave={onQuickSave}
        />
      </td>

      {/* 库存 - 快速调整 */}
      <td className="px-4 py-3">
        <StockAdjuster
          stock={product.stock}
          productId={product.id}
          onSave={(id, newStock) => onQuickSave(id, "stock", newStock)}
          compact={true}
        />
      </td>

      {/* 状态 - 开关切换 */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Switch
            checked={product.isPublished}
            onCheckedChange={() => onToggleStatus(product)}
          />
          <span className={`text-sm ${product.isPublished ? "text-green-600" : "text-muted-foreground"}`}>
            {product.isPublished ? tStatus("stockInsufficient").split(" ")[0] === "Low" ? "Active" : "上架" : product.isPublished ? "Active" : "Inactive"}
          </span>
        </div>
      </td>

      {/* 创建日期 */}
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDate(product.createdAt, "en-US")}
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
            {t("clickToEdit").includes("Click") ? "Edit" : "编辑"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(product)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {t("clickToEdit").includes("Click") ? "Delete" : "删除"}
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
    prevProps.product.isPublished === nextProps.product.isPublished
  )
})
