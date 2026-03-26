/**
 * ============================================
 * RAG 知识库管理页面 (Task 1.4)
 * ============================================
 * 功能说明：
 *   - 知识库列表展示（支持分页、筛选、搜索）
 *   - 知识内容创建、编辑、删除
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
  BookOpen,
  Tag,
  FolderOpen,
  History,
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

/** 知识库条目状态 */
type KnowledgeStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

/** 知识库条目 */
interface KnowledgeItem {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  version: number
  status: KnowledgeStatus
  createdAt: string
  updatedAt: string
  createdBy: string
  categoryRelation?: { id: string; name: string }
  history?: Array<{
    version: number
    changedAt: string
    changedBy: string
  }>
}

/** 知识分类 */
interface KnowledgeCategory {
  id: string
  name: string
  parentId?: string
  order: number
  _count?: { articles: number }
}

/** 创建/编辑知识的表单数据 */
interface KnowledgeFormData {
  title: string
  content: string
  category: string
  tags: string
  status: KnowledgeStatus
}

/** 分页结果 */
interface _PaginatedResponse {
  list: KnowledgeItem[]
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

const DEFAULT_FORM_DATA: KnowledgeFormData = {
  title: "",
  content: "",
  category: "",
  tags: "",
  status: "DRAFT",
}

// ============================================
// 主组件
// ============================================

export default function KnowledgePage() {
  const _router = useRouter()
  const { language } = useLanguage()
  const isZh = language === "zh"

  // 状态定义
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeItem[]>([])
  const [categories, setCategories] = useState<KnowledgeCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<KnowledgeStatus | "">("")
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 0 })

  // Dialog 状态
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [formData, setFormData] = useState<KnowledgeFormData>(DEFAULT_FORM_DATA)
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<KnowledgeItem | null>(null)
  const [selectedHistory, setSelectedHistory] = useState<KnowledgeItem | null>(null)
  const [saving, setSaving] = useState(false)

  // 获取知识列表
  const fetchKnowledgeList = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      })
      if (searchKeyword) params.append("keyword", searchKeyword)
      if (selectedCategory) params.append("category", selectedCategory)
      if (selectedStatus) params.append("status", selectedStatus)

      const response = await fetch(`/api/knowledge?${params}`)
      const result = await response.json()

      if (result.success) {
        setKnowledgeList(result.data.list)
        setPagination(result.data.pagination)
      }
    } catch (error) {
      console.error("获取知识列表失败:", error)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.pageSize, searchKeyword, selectedCategory, selectedStatus])

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/knowledge/categories")
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
    fetchKnowledgeList()
    fetchCategories()
  }, [fetchKnowledgeList, fetchCategories])

  // 搜索处理
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchKnowledgeList()
  }

  // 打开编辑 Dialog
  const handleOpenEdit = (item?: KnowledgeItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        title: item.title,
        content: item.content,
        category: item.category,
        tags: item.tags.join(", "),
        status: item.status,
      })
    } else {
      setEditingItem(null)
      setFormData(DEFAULT_FORM_DATA)
    }
    setEditDialogOpen(true)
  }

  // 保存知识（创建或更新）
  const handleSave = async () => {
    setSaving(true)
    try {
      // 构建请求 payload
      const payload: Record<string, unknown> = {
        ...formData,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      }

      const url = editingItem ? "/api/knowledge/" + editingItem.id : "/api/knowledge"
      const method = editingItem ? "PATCH" : "POST"

      if (editingItem) {
        payload.changedBy = editingItem.createdBy
      } else {
        payload.createdBy = "admin"
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        setEditDialogOpen(false)
        fetchKnowledgeList()
        fetchCategories()
      } else {
        alert(result.error || (isZh ? "保存失败" : "Save failed"))
      }
    } catch (error) {
      console.error("保存知识失败:", error)
      alert(isZh ? "保存失败" : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  // 打开删除确认 Dialog
  const handleOpenDelete = (item: KnowledgeItem) => {
    setDeletingItem(item)
    setDeleteDialogOpen(true)
  }

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deletingItem) return

    try {
      const response = await fetch(`/api/knowledge/${deletingItem.id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        setDeleteDialogOpen(false)
        fetchKnowledgeList()
      } else {
        alert(result.error || (isZh ? "删除失败" : "Delete failed"))
      }
    } catch (error) {
      console.error("删除知识失败:", error)
      alert(isZh ? "删除失败" : "Delete failed")
    }
  }

  // 查看历史
  const handleViewHistory = async (item: KnowledgeItem) => {
    try {
      const response = await fetch(`/api/knowledge/${item.id}`)
      const result = await response.json()

      if (result.success) {
        setSelectedHistory(result.data)
        setHistoryDialogOpen(true)
      }
    } catch (error) {
      console.error("获取历史失败:", error)
    }
  }

  // 状态标签颜色
  const getStatusBadge = (status: KnowledgeStatus) => {
    const config: Record<KnowledgeStatus, { color: string; label: string }> = {
      DRAFT: { color: "bg-gray-500", label: isZh ? "草稿" : "Draft" },
      PUBLISHED: { color: "bg-green-500", label: isZh ? "已发布" : "Published" },
      ARCHIVED: { color: "bg-yellow-500", label: isZh ? "已归档" : "Archived" },
    }
    const { color, label } = config[status]
    return <Badge className={`${color} text-white`}>{label}</Badge>
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
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">{isZh ? "知识库管理" : "Knowledge Base"}</h1>
          </div>
          <Button onClick={() => handleOpenEdit()}>
            <Plus className="w-4 h-4 mr-2" />
            {isZh ? "新建知识" : "New Article"}
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
                    placeholder={isZh ? "搜索标题或内容..." : "Search title or content..."}
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
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="">{isZh ? "全部分类" : "All Categories"}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* 状态筛选 */}
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value as KnowledgeStatus | "")
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="">{isZh ? "全部状态" : "All Status"}</option>
                <option value="DRAFT">{isZh ? "草稿" : "Draft"}</option>
                <option value="PUBLISHED">{isZh ? "已发布" : "Published"}</option>
                <option value="ARCHIVED">{isZh ? "已归档" : "Archived"}</option>
              </select>

              <Button variant="outline" onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                {isZh ? "搜索" : "Search"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 知识列表 */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isZh ? "知识列表" : "Articles"}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({pagination.total} {isZh ? "条" : "items"})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                {isZh ? "加载中..." : "Loading..."}
              </div>
            ) : knowledgeList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {isZh ? "暂无数据" : "No data"}
              </div>
            ) : (
              <div className="space-y-4">
                {knowledgeList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium truncate">{item.title}</h3>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {item.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FolderOpen className="w-3 h-3" />
                          {item.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {item.tags.slice(0, 3).join(", ")}
                          {item.tags.length > 3 && "..."}
                        </span>
                        <span>v{item.version}</span>
                        <span>{formatDate(item.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="ghost" size="icon" onClick={() => handleViewHistory(item)}>
                        <History className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(item)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}

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
              {editingItem
                ? (isZh ? "编辑知识" : "Edit Article")
                : (isZh ? "新建知识" : "New Article")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                {isZh ? "标题" : "Title"} *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={isZh ? "请输入标题" : "Enter title"}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                {isZh ? "内容" : "Content"} *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder={isZh ? "请输入内容" : "Enter content"}
                className="w-full min-h-[200px] px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {isZh ? "分类" : "Category"} *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">{isZh ? "选择分类" : "Select category"}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {isZh ? "状态" : "Status"}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as KnowledgeStatus }))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="DRAFT">{isZh ? "草稿" : "Draft"}</option>
                  <option value="PUBLISHED">{isZh ? "已发布" : "Published"}</option>
                  <option value="ARCHIVED">{isZh ? "已归档" : "Archived"}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                {isZh ? "标签" : "Tags"}
                <span className="text-xs text-muted-foreground font-normal ml-1">
                  ({isZh ? "用逗号分隔" : "Separated by comma"})
                </span>
              </label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder={isZh ? "标签1, 标签2, 标签3" : "tag1, tag2, tag3"}
              />
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
            {isZh ? "确定要删除这条知识吗？此操作不可撤销。" : "Are you sure you want to delete this article? This action cannot be undone."}
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

      {/* 历史记录 Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isZh ? "版本历史" : "Version History"} - {selectedHistory?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedHistory?.history && selectedHistory.history.length > 0 ? (
              selectedHistory.history.map((h: { version: number; changedAt: string; changedBy: string }) => (
                <div key={h.version} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">v{h.version}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(h.changedAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isZh ? "修改者" : "Changed by"}: {h.changedBy}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">
                {isZh ? "暂无历史记录" : "No history available"}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>
              {isZh ? "关闭" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}