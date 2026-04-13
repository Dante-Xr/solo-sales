/**
 * ============================================
 * RAG 知识库管理页面 (Task 1.4)
 * ============================================
 * 功能说明：
 *   - 知识库列表展示（支持分页、筛选、搜索）
 *   - 知识内容创建、编辑、删除
 *   - 分类管理
 * ============================================
 * 2026-04-13: 迁移到 next-intl 国际化方案
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
import { useTranslations, useLocale } from "next-intl"

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
  const t = useTranslations('admin.knowledge')
  const locale = useLocale()

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
        alert(result.error || t('saveFailed'))
      }
    } catch (error) {
      console.error("保存知识失败:", error)
      alert(t('saveFailed'))
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
        alert(result.error || t('deleteFailed'))
      }
    } catch (error) {
      console.error("删除知识失败:", error)
      alert(t('deleteFailed'))
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
    const config: Record<KnowledgeStatus, { color: string; key: string }> = {
      DRAFT: { color: "bg-gray-500", key: 'status.draft' },
      PUBLISHED: { color: "bg-green-500", key: 'status.published' },
      ARCHIVED: { color: "bg-yellow-500", key: 'status.archived' },
    }
    const { color, key } = config[status]
    return <Badge className={`${color} text-white`}>{t(key)}</Badge>
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")
  }

  return (
    <div className="min-h-screen bg-muted/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">{t('pageTitle')}</h1>
          </div>
          <Button onClick={() => handleOpenEdit()}>
            <Plus className="w-4 h-4 mr-2" />
            {t('newArticle')}
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
                    placeholder={t('searchPlaceholder')}
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
                <option value="">{t('allCategories')}</option>
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
                <option value="">{t('allStatus')}</option>
                <option value="DRAFT">{t('status.draft')}</option>
                <option value="PUBLISHED">{t('status.published')}</option>
                <option value="ARCHIVED">{t('status.archived')}</option>
              </select>

              <Button variant="outline" onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                {t('search')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 知识列表 */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('articles')}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({pagination.total} {t('items')})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('loading')}
              </div>
            ) : knowledgeList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('noData')}
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
                      {t('previous')}
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
                      {t('next')}
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
              {editingItem ? t('editArticle') : t('newArticle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                {t('form.title')} *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t('form.titlePlaceholder')}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                {t('form.content')} *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder={t('form.contentPlaceholder')}
                className="w-full min-h-[200px] px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t('form.category')} *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">{t('form.selectCategory')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t('form.status')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as KnowledgeStatus }))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="DRAFT">{t('status.draft')}</option>
                  <option value="PUBLISHED">{t('status.published')}</option>
                  <option value="ARCHIVED">{t('status.archived')}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                {t('form.tags')}
                <span className="text-xs text-muted-foreground font-normal ml-1">
                  ({t('form.separatedByComma')})
                </span>
              </label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder={t('form.tagsPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t('buttons.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t('buttons.saving') : t('buttons.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirmDelete.title')}</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            {t('confirmDelete.description')}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('buttons.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {t('buttons.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 历史记录 Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('versionHistory')} - {selectedHistory?.title}
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
                    {t('changedBy')}: {h.changedBy}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">
                {t('noHistory')}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>
              {t('buttons.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}