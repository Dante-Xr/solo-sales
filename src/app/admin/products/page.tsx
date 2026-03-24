/**
 * ============================================
 * 商品管理页面 (Task 2.4)
 * ============================================
 * 功能说明：
 *   - 商品列表展示（支持分页、筛选、搜索）
 *   - 商品创建、编辑、删除
 *   - 分类管理
 * ============================================
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  ImageIcon,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useLanguage } from "@/context/LanguageContext"

// ============================================
// 类型定义
// ============================================

/** 商品状态 */
type ProductStatus = "ACTIVE" | "INACTIVE"

/** 商品数据 */
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

/** 分类数据 */
interface Category {
  id: string
  name: string
  description: string | null
  parentId: string | null
  order: number
  _count?: { products: number }
}

/** 商品表单数据 */
interface ProductFormData {
  name: string
  description: string
  price: string
  stock: string
  images: string
  sku: string
  categoryId: string
  isPublished: boolean
}

/** 分页结果 */
interface PaginatedResponse {
  list: Product[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// ============================================
// 默认表单数据
// ============================================

const DEFAULT_FORM_DATA: ProductFormData = {
  name: "",
  description: "",
  price: "",
  stock: "0",
  images: "",
  sku: "",
  categoryId: "",
  isPublished: true,
}

// ============================================
// 主组件
// ============================================

export default function ProductsPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const isZh = language === "zh"

  // 状态定义
  const [productList, setProductList] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 0 })

  // Dialog 状态
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>(DEFAULT_FORM_DATA)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  // 验证错误状态
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 获取商品列表
  const fetchProductList = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      })
      if (searchKeyword) params.append("keyword", searchKeyword)
      if (selectedCategory) params.append("category", selectedCategory)

      const response = await fetch("/api/products?" + params.toString())
      const result = await response.json()

      if (result.success) {
        setProductList(result.data.list)
        setPagination(result.data.pagination)
      }
    } catch (error) {
      console.error("获取商品列表失败:", error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.pageSize, searchKeyword, selectedCategory])

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories")
      const result = await response.json()
      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error("获取分类失败:", error)
    }
  }, [])

  // 初始加载
  useEffect(() => {
    fetchProductList()
    fetchCategories()
  }, [fetchProductList, fetchCategories])

  // 搜索处理
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchProductList()
  }

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = isZh ? "请输入商品名称" : "Product name is required"
    }
    if (!formData.description.trim()) {
      newErrors.description = isZh ? "请输入商品描述" : "Product description is required"
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = isZh ? "请输入有效的价格" : "Please enter a valid price"
    }
    if (formData.stock && (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0)) {
      newErrors.stock = isZh ? "请输入有效的库存" : "Please enter a valid stock"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 打开编辑 Dialog
  const handleOpenEdit = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        images: product.images?.join(", ") || "",
        sku: product.sku || "",
        categoryId: product.category?.id || "",
        isPublished: product.isPublished,
      })
    } else {
      setEditingProduct(null)
      setFormData(DEFAULT_FORM_DATA)
    }
    setErrors({})
    setEditDialogOpen(true)
  }

  // 保存商品（创建或更新）
  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: formData.stock ? parseInt(formData.stock) : 0,
        images: formData.images ? formData.images.split(",").map(s => s.trim()).filter(Boolean) : [],
        sku: formData.sku.trim() || null,
        categoryId: formData.categoryId || null,
        isPublished: formData.isPublished,
      }

      const url = editingProduct ? "/api/products/" + editingProduct.id : "/api/products"
      const method = editingProduct ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        setEditDialogOpen(false)
        fetchProductList()
        if (formData.categoryId) {
          fetchCategories()
        }
      } else {
        alert(result.error || (isZh ? "保存失败" : "Save failed"))
      }
    } catch (error) {
      console.error("保存商品失败:", error)
      alert(isZh ? "保存失败" : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  // 打开删除确认 Dialog
  const handleOpenDelete = (product: Product) => {
    setDeletingProduct(product)
    setDeleteDialogOpen(true)
  }

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return

    try {
      const response = await fetch("/api/products/" + deletingProduct.id, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        setDeleteDialogOpen(false)
        fetchProductList()
      } else {
        alert(result.error || (isZh ? "删除失败" : "Delete failed"))
      }
    } catch (error) {
      console.error("删除商品失败:", error)
      alert(isZh ? "删除失败" : "Delete failed")
    }
  }

  // 切换商品上架状态
  const handleToggleStatus = async (product: Product) => {
    try {
      const response = await fetch("/api/products/" + product.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !product.isPublished }),
      })

      const result = await response.json()

      if (result.success) {
        fetchProductList()
      } else {
        alert(result.error || (isZh ? "操作失败" : "Operation failed"))
      }
    } catch (error) {
      console.error("切换状态失败:", error)
      alert(isZh ? "操作失败" : "Operation failed")
    }
  }

  // 格式化价格
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(isZh ? "zh-CN" : "en-US")
  }

  return (
    <div className="min-h-screen bg-muted/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">{isZh ? "商品管理" : "Product Management"}</h1>
          </div>
          <Button onClick={() => handleOpenEdit()}>
            <Plus className="w-4 h-4 mr-2" />
            {isZh ? "添加商品" : "Add Product"}
          </Button>
        </div>

        {/* 搜索和筛选 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              {/* 关键词搜索 */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={isZh ? "搜索商品名称或描述..." : "Search product name or description..."}
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 分类筛选 */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="px-3 py-2 border rounded-md bg-background min-w-[150px]"
              >
                <option value="">{isZh ? "全部分类" : "All Categories"}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <Button variant="outline" onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                {isZh ? "搜索" : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 商品列表 */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isZh ? "商品列表" : "Products"}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({pagination.total} {isZh ? "件商品" : "items"})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                {isZh ? "加载中..." : "Loading..."}
              </div>
            ) : productList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {isZh ? "暂无数据" : "No data"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">{isZh ? "商品名称" : "Product Name"}</th>
                      <th className="text-left py-3 px-4 font-medium">{isZh ? "分类" : "Category"}</th>
                      <th className="text-left py-3 px-4 font-medium">{isZh ? "SKU" : "SKU"}</th>
                      <th className="text-left py-3 px-4 font-medium">{isZh ? "价格" : "Price"}</th>
                      <th className="text-left py-3 px-4 font-medium">{isZh ? "库存" : "Stock"}</th>
                      <th className="text-left py-3 px-4 font-medium">{isZh ? "状态" : "Status"}</th>
                      <th className="text-left py-3 px-4 font-medium">{isZh ? "创建时间" : "Created"}</th>
                      <th className="text-right py-3 px-4 font-medium">{isZh ? "操作" : "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productList.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
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
                            <span className="font-medium truncate max-w-[200px]">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {product.category ? (
                            <Badge variant="outline">{product.category.name}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">
                          {product.sku || "-"}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {formatPrice(product.price)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={product.stock <= 10 ? "text-orange-500" : ""}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleStatus(product)}
                            className="flex items-center gap-1"
                          >
                            {product.isPublished ? (
                              <>
                                <ToggleRight className="w-5 h-5 text-green-500" />
                                <span className="text-green-500 text-sm">{isZh ? "上架" : "Active"}</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                                <span className="text-muted-foreground text-sm">{isZh ? "下架" : "Inactive"}</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">
                          {formatDate(product.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(product)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              {isZh ? "编辑" : "Edit"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDelete(product)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              {isZh ? "删除" : "Delete"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 分页 */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      {isZh ? "上一页" : "Previous"}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      {isZh ? "下一页" : "Next"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 创建/编辑 Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct
                ? (isZh ? "编辑商品" : "Edit Product")
                : (isZh ? "添加商品" : "Add Product")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* 商品名称 */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                {isZh ? "商品名称" : "Product Name"} *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                  if (errors.name) setErrors(prev => ({ ...prev, name: "" }))
                }}
                placeholder={isZh ? "请输入商品名称" : "Enter product name"}
              />
              {errors.name && (
                <p className="text-xs text-destructive mt-1">{errors.name}</p>
              )}
            </div>

            {/* 商品描述 */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                {isZh ? "商品描述" : "Description"} *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, description: e.target.value }))
                  if (errors.description) setErrors(prev => ({ ...prev, description: "" }))
                }}
                placeholder={isZh ? "请输入商品描述" : "Enter product description"}
                className="w-full min-h-[100px] px-3 py-2 border rounded-md bg-background resize-none"
              />
              {errors.description && (
                <p className="text-xs text-destructive mt-1">{errors.description}</p>
              )}
            </div>

            {/* 价格和库存 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {isZh ? "价格" : "Price"} *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, price: e.target.value }))
                    if (errors.price) setErrors(prev => ({ ...prev, price: "" }))
                  }}
                  placeholder={isZh ? "0.00" : "0.00"}
                />
                {errors.price && (
                  <p className="text-xs text-destructive mt-1">{errors.price}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {isZh ? "库存" : "Stock"}
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, stock: e.target.value }))
                    if (errors.stock) setErrors(prev => ({ ...prev, stock: "" }))
                  }}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="text-xs text-destructive mt-1">{errors.stock}</p>
                )}
              </div>
            </div>

            {/* SKU */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                {isZh ? "SKU" : "SKU"}
              </label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder={isZh ? "可选，用于批发导入去重" : "Optional, for wholesale import deduplication"}
              />
            </div>

            {/* 分类 */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                {isZh ? "分类" : "Category"}
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">{isZh ? "选择分类" : "Select category"}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 图片链接 */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                {isZh ? "图片链接" : "Image URLs"}
                <span className="text-xs text-muted-foreground font-normal ml-1">
                  ({isZh ? "用逗号分隔多个链接" : "Separate multiple URLs with comma"})
                </span>
              </label>
              <textarea
                value={formData.images}
                onChange={(e) => setFormData(prev => ({ ...prev, images: e.target.value }))}
                placeholder={isZh ? "https://example.com/image1.jpg, https://example.com/image2.jpg" : "https://example.com/image1.jpg, https://example.com/image2.jpg"}
                className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background resize-none"
              />
            </div>

            {/* 上架状态 */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={formData.isPublished ? "default" : "outline"}
                size="sm"
                onClick={() => setFormData(prev => ({ ...prev, isPublished: true }))}
              >
                {isZh ? "上架" : "Active"}
              </Button>
              <Button
                type="button"
                variant={!formData.isPublished ? "default" : "outline"}
                size="sm"
                onClick={() => setFormData(prev => ({ ...prev, isPublished: false }))}
              >
                {isZh ? "下架" : "Inactive"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {isZh ? "取消" : "Cancel"}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (isZh ? "保存中..." : "Saving...") : (isZh ? "保存" : "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isZh ? "确认删除" : "Confirm Delete"}</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            {isZh
              ? "确定要删除商品「" + deletingProduct?.name + "」吗？此操作不可撤销。"
              : "Are you sure you want to delete product 「" + deletingProduct?.name + "」? This action cannot be undone."}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {isZh ? "取消" : "Cancel"}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {isZh ? "删除" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
