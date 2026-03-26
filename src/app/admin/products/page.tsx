/**
 * ============================================
 * 商品管理页面 (v0.4.1 优化版)
 * ============================================
 * 功能说明：
 *   - 商品列表展示（支持分页、筛选、搜索）
 *   - 商品创建、编辑、删除
 *   - 分类管理
 *   - 移动端卡片视图 + PC 端表格视图
 *   - React.memo 和 useMemo 优化渲染性能
 * ============================================
 */

"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Plus,
  Search,
  Package,
  ImageIcon,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { BatchActionBar } from "@/components/admin/BatchActionBar"
import { useLanguage } from "@/context/LanguageContext"
import { MobileProductCard } from "@/components/admin/MobileProductCard"

// ============================================
// 类型定义
// ============================================

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
interface _PaginatedResponse {
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
  const { language } = useLanguage()
  const isZh = language === "zh"

  // 状态定义
  const [productList, setProductList] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 0 })

  // 批量选择状态
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [batchDialogOpen, setBatchDialogOpen] = useState(false)
  const [batchAction, setBatchAction] = useState<"publish" | "unpublish" | "delete" | null>(null)

  // Dialog 状态
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>(DEFAULT_FORM_DATA)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  // 验证错误状态
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 移动端检测
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

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

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(productList.map(p => p.id)))
    } else {
      setSelectedProducts(new Set())
    }
  }

  // 选择/取消选择单个商品
  const handleSelectProduct = (productId: string, checked: boolean) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(productId)
      } else {
        newSet.delete(productId)
      }
      return newSet
    })
  }

  // 打开批量操作确认 Dialog
  const handleOpenBatchAction = (action: "publish" | "unpublish" | "delete") => {
    setBatchAction(action)
    setBatchDialogOpen(true)
  }

  // 执行批量操作
  const handleExecuteBatch = async () => {
    if (selectedProducts.size === 0 || !batchAction) return

    try {
      const ids = Array.from(selectedProducts)
      let url = "/api/products/batch?"
      let method = "PATCH"
      let body: Record<string, unknown> = {}

      if (batchAction === "delete") {
        url += "ids=" + ids.join("&ids=")
        method = "DELETE"
      } else {
        body = {
          ids,
          isPublished: batchAction === "publish",
        }
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method !== "DELETE" ? JSON.stringify(body) : undefined,
      })

      const result = await response.json()

      if (result.success) {
        setBatchDialogOpen(false)
        setSelectedProducts(new Set())
        fetchProductList()
      } else {
        alert(result.error || (isZh ? "批量操作失败" : "Batch operation failed"))
      }
    } catch (error) {
      console.error("批量操作失败:", error)
      alert(isZh ? "批量操作失败" : "Batch operation failed")
    }
  }

  // useMemo 优化：格式化后的产品列表
  const formattedProducts = useMemo(() => {
    return productList.map(product => ({
      ...product,
      formattedPrice: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(product.price),
      formattedDate: new Date(product.createdAt).toLocaleDateString(isZh ? "zh-CN" : "en-US"),
    }))
  }, [productList, isZh])

  return (
    <div className="space-y-6">
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
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isZh ? "商品列表" : "Products"}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({pagination.total} {isZh ? "件商品" : "items"})
              </span>
            </div>
            {selectedProducts.size > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {isZh ? "已选择" : "Selected"} {selectedProducts.size} {isZh ? "项" : "items"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenBatchAction("publish")}
                >
                  <ToggleRight className="w-4 h-4 mr-1" />
                  {isZh ? "批量上架" : "Batch Publish"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenBatchAction("unpublish")}
                >
                  <ToggleLeft className="w-4 h-4 mr-1" />
                  {isZh ? "批量下架" : "Batch Unpublish"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleOpenBatchAction("delete")}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {isZh ? "批量删除" : "Batch Delete"}
                </Button>
              </div>
            )}
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
          ) : isMobile ? (
            // 移动端卡片视图
            <div className="md:hidden">
              {productList.map((product) => (
                <MobileProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                  onToggleStatus={handleToggleStatus}
                  isZh={isZh}
                />
              ))}
            </div>
          ) : (
            // PC 端表格视图
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="w-12 py-3 px-4">
                      <Checkbox
                        checked={productList.length > 0 && selectedProducts.size === productList.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium">{isZh ? "商品名称" : "Product Name"}</th>
                    <th className="text-left py-3 px-4 font-medium">{isZh ? "分类" : "Category"}</th>
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
                        <Checkbox
                          checked={selectedProducts.has(product.id)}
                          onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                        />
                      </td>
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
                          <div>
                            <span className="font-medium">{product.name}</span>
                            {product.sku && (
                              <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {product.category ? (
                          <span className="px-2 py-1 text-xs rounded-full border">{product.category.name}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {formattedProducts.find(p => p.id === product.id)?.formattedPrice}
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
                            <span className="text-green-500 text-sm">{isZh ? "上架" : "Active"}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">{isZh ? "下架" : "Inactive"}</span>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">
                        {formattedProducts.find(p => p.id === product.id)?.formattedDate}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(product)}
                          >
                            {isZh ? "编辑" : "Edit"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDelete(product)}
                            className="text-destructive hover:text-destructive"
                          >
                            {isZh ? "删除" : "Delete"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

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
        </CardContent>
      </Card>

      {/* 创建/编辑 Dialog (PC) / Sheet (移动端) */}
      {isMobile ? (
        <Sheet open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl pb-safe max-h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>
                {editingProduct
                  ? (isZh ? "编辑商品" : "Edit Product")
                  : (isZh ? "添加商品" : "Add Product")}
              </SheetTitle>
            </SheetHeader>
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
                  className="h-12"
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
                  className="w-full min-h-[100px] px-3 py-3 border rounded-md bg-background resize-none"
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
                    className="h-12"
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
                    className="h-12"
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
                  className="h-12"
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
                  className="w-full px-3 py-3 border rounded-md bg-background h-12"
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
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  className="w-full min-h-[80px] px-3 py-3 border rounded-md bg-background resize-none"
                />
              </div>

              {/* 上架状态 */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant={formData.isPublished ? "default" : "outline"}
                  size="sm"
                  className="h-12 flex-1"
                  onClick={() => setFormData(prev => ({ ...prev, isPublished: true }))}
                >
                  {isZh ? "上架" : "Active"}
                </Button>
                <Button
                  type="button"
                  variant={!formData.isPublished ? "default" : "outline"}
                  size="sm"
                  className="h-12 flex-1"
                  onClick={() => setFormData(prev => ({ ...prev, isPublished: false }))}
                >
                  {isZh ? "下架" : "Inactive"}
                </Button>
              </div>
            </div>
            <SheetFooter className="flex flex-row gap-2 pt-2 border-t">
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={() => setEditDialogOpen(false)}
              >
                {isZh ? "取消" : "Cancel"}
              </Button>
              <Button
                className="flex-1 h-12"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (isZh ? "保存中..." : "Saving...") : (isZh ? "保存" : "Save")}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ) : (
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
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
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
      )}

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

      {/* 批量操作确认 Dialog */}
      <Dialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {batchAction === "publish" && (isZh ? "确认批量上架" : "Confirm Batch Publish")}
              {batchAction === "unpublish" && (isZh ? "确认批量下架" : "Confirm Batch Unpublish")}
              {batchAction === "delete" && (isZh ? "确认批量删除" : "Confirm Batch Delete")}
            </DialogTitle>
          </DialogHeader>
          <p className="py-4">
            {batchAction === "publish" && (isZh
              ? "确定要上架所选的 " + selectedProducts.size + " 个商品吗？"
              : "Are you sure you want to publish the selected " + selectedProducts.size + " products?")}
            {batchAction === "unpublish" && (isZh
              ? "确定要下架所选的 " + selectedProducts.size + " 个商品吗？"
              : "Are you sure you want to unpublish the selected " + selectedProducts.size + " products?")}
            {batchAction === "delete" && (isZh
              ? "确定要删除所选的 " + selectedProducts.size + " 个商品吗？此操作不可撤销。"
              : "Are you sure you want to delete the selected " + selectedProducts.size + " products? This action cannot be undone.")}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchDialogOpen(false)}>
              {isZh ? "取消" : "Cancel"}
            </Button>
            {batchAction === "delete" ? (
              <Button variant="destructive" onClick={handleExecuteBatch}>
                {isZh ? "删除" : "Delete"}
              </Button>
            ) : (
              <Button onClick={handleExecuteBatch}>
                {isZh ? "确认" : "Confirm"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量操作栏 */}
      {selectedProducts.size > 0 && !isMobile && (
        <BatchActionBar
          selectedCount={selectedProducts.size}
          onPublish={() => handleOpenBatchAction("publish")}
          onUnpublish={() => handleOpenBatchAction("unpublish")}
          onDelete={() => handleOpenBatchAction("delete")}
          onClear={() => setSelectedProducts(new Set())}
          isZh={isZh}
        />
      )}
    </div>
  )
}
