/**
 * ============================================
 * 管理员权限管理页面
 * ============================================
 * 功能说明：
 *   - 权限列表展示（表格）
 *   - 显示关联角色数量
 *   - 创建/编辑权限 Dialog
 *   - 删除权限确认 Dialog
 * ============================================
 */

"use client"

import { useState, useEffect } from "react"
import { Shield, Plus, Pencil, Trash2, Check, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/context/LanguageContext"

interface Permission {
  id: string
  name: string
  label: string
  description: string | null
  type: "PAGE" | "ACTION" | "DATA"
  _count?: {
    roles: number
  }
  usedByRoles?: number
}

const PERMISSION_TYPES = [
  { value: "PAGE", label: "页面权限" },
  { value: "ACTION", label: "操作权限" },
  { value: "DATA", label: "数据权限" },
] as const

export default function PermissionsPage() {
  const { language } = useLanguage()
  const isZh = language === "zh"

  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [deletingPermission, setDeletingPermission] = useState<Permission | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    label: "",
    description: "",
    type: "ACTION" as "PAGE" | "ACTION" | "DATA",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/permissions")
      const data = await res.json()
      if (data.success) {
        setPermissions(data.data.list)
      }
    } catch (error) {
      console.error("获取权限列表失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenCreate = () => {
    setEditingPermission(null)
    setFormData({ name: "", label: "", description: "", type: "ACTION" })
    setDialogOpen(true)
  }

  const handleOpenEdit = (permission: Permission) => {
    setEditingPermission(permission)
    setFormData({
      name: permission.name,
      label: permission.label,
      description: permission.description || "",
      type: permission.type,
    })
    setDialogOpen(true)
  }

  const handleOpenDelete = (permission: Permission) => {
    setDeletingPermission(permission)
    setDeleteDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.label) return

    try {
      setSubmitting(true)
      const url = editingPermission
        ? `/api/admin/permissions/${editingPermission.id}`
        : "/api/admin/permissions"
      const method = editingPermission ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (data.success) {
        setDialogOpen(false)
        fetchPermissions()
      } else {
        alert(data.error || (isZh ? "操作失败" : "Operation failed"))
      }
    } catch (error) {
      console.error("提交失败:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingPermission) return

    try {
      setSubmitting(true)
      const res = await fetch(`/api/admin/permissions/${deletingPermission.id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        setDeleteDialogOpen(false)
        fetchPermissions()
      } else {
        alert(data.error || (isZh ? "删除失败" : "Delete failed"))
      }
    } catch (error) {
      console.error("删除失败:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "PAGE":
        return "default"
      case "ACTION":
        return "secondary"
      case "DATA":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getTypeLabel = (type: string) => {
    const found = PERMISSION_TYPES.find((t) => t.value === type)
    return found ? found.label : type
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/50 p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">
              {isZh ? "权限管理" : "Permission Management"}
            </h1>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" />
            {isZh ? "创建权限" : "Create Permission"}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isZh ? "权限列表" : "Permission List"}</CardTitle>
            <CardDescription>
              {isZh
                ? "管理系统中的所有权限定义"
                : "Manage all permission definitions in the system"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isZh ? "权限名称" : "Permission Name"}</TableHead>
                  <TableHead>{isZh ? "标识" : "Identifier"}</TableHead>
                  <TableHead>{isZh ? "类型" : "Type"}</TableHead>
                  <TableHead>{isZh ? "描述" : "Description"}</TableHead>
                  <TableHead>{isZh ? "引用角色" : "Used By Roles"}</TableHead>
                  <TableHead className="text-right">
                    {isZh ? "操作" : "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {isZh ? "暂无权限数据" : "No permissions found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">{permission.label}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {permission.name}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(permission.type)}>
                          {getTypeLabel(permission.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {permission.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {permission.usedByRoles || permission._count?.roles || 0} {isZh ? "个角色" : "roles"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEdit(permission)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenDelete(permission)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPermission
                ? isZh
                  ? "编辑权限"
                  : "Edit Permission"
                : isZh
                  ? "创建权限"
                  : "Create Permission"}
            </DialogTitle>
            <DialogDescription>
              {editingPermission
                ? isZh
                  ? "修改权限的名称、描述和类型"
                  : "Modify permission name, description and type"
                : isZh
                  ? "创建新的权限"
                  : "Create a new permission"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {isZh ? "权限标识" : "Permission Identifier"}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={isZh ? "如: products.view" : "e.g., products.view"}
                disabled={!!editingPermission}
              />
              <p className="text-xs text-muted-foreground">
                {isZh ? "权限标识格式：资源.操作，如 products.view" : "Format: resource.action, e.g., products.view"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="label">
                {isZh ? "权限名称" : "Permission Name"}
              </Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, label: e.target.value }))
                }
                placeholder={isZh ? "如: 查看商品" : "e.g., View Products"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">
                {isZh ? "权限类型" : "Permission Type"}
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, type: value as "PAGE" | "ACTION" | "DATA" }))
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERMISSION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {isZh ? "描述" : "Description"}
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder={isZh ? "可选的权限描述" : "Optional permission description"}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {isZh ? "取消" : "Cancel"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !formData.name || !formData.label}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isZh ? "保存中..." : "Saving..."}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {isZh ? "保存" : "Save"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isZh ? "确认删除权限" : "Confirm Delete Permission"}
            </DialogTitle>
            <DialogDescription>
              {isZh
                ? `确定要删除权限 "${deletingPermission?.label}" 吗？此操作无法撤销。`
                : `Are you sure you want to delete the permission "${deletingPermission?.label}"? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          {(deletingPermission?.usedByRoles || deletingPermission?._count?.roles || 0) > 0 && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              {isZh
                ? "该权限已被角色使用，无法删除。请先移除所有引用该权限的角色。"
                : "This permission is used by roles and cannot be deleted. Please remove all role references first."}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {isZh ? "取消" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting || (deletingPermission?.usedByRoles || deletingPermission?._count?.roles || 0) > 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isZh ? "删除中..." : "Deleting..."}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isZh ? "删除" : "Delete"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}