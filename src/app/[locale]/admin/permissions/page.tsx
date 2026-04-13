/**
 * ============================================
 * 管理员权限管理页面 (Phase 5 管理后台重构)
 * ============================================
 * 功能说明：
 *   - 权限列表展示（表格）
 *   - 显示关联角色数量
 *   - 创建/编辑权限 Dialog
 *   - 删除权限确认 Dialog
 *   - 使用 Refine useList hook
 * ============================================
 * 2026-04-13: 集成 Refine useList hook
 */

"use client"

import { useState, useMemo } from "react"
import { useList } from "@refinedev/core"
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
import { useTranslations } from "next-intl"

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
  const t = useTranslations('admin.permissions')

  const { query: { data: permissionsData, isLoading: loading, refetch } } = useList({
    resource: "permissions",
    pagination: { currentPage: 1, pageSize: 100 },
  })

  const permissions = useMemo(() => {
    const raw = permissionsData?.data as any
    return raw?.list || []
  }, [permissionsData])

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
        refetch()
      } else {
        alert(data.error || t('operationFailed'))
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
        refetch()
      } else {
        alert(data.error || t('deleteFailed'))
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
              {t('pageTitle')}
            </h1>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" />
            {t('createPermission')}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('permissionList')}</CardTitle>
            <CardDescription>
              {t('permissionListDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('tableHeaders.permissionName')}</TableHead>
                  <TableHead>{t('tableHeaders.identifier')}</TableHead>
                  <TableHead>{t('tableHeaders.type')}</TableHead>
                  <TableHead>{t('tableHeaders.description')}</TableHead>
                  <TableHead>{t('tableHeaders.usedByRoles')}</TableHead>
                  <TableHead className="text-right">
                    {t('tableHeaders.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {t('noPermissionsFound')}
                    </TableCell>
                  </TableRow>
                ) : (
                  permissions.map((permission: any) => (
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
                          {permission.usedByRoles || permission._count?.roles || 0} {t('roles')}
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
              {editingPermission ? t('editPermission') : t('createPermission')}
            </DialogTitle>
            <DialogDescription>
              {editingPermission ? t('editPermissionDescription') : t('createPermissionDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t('form.permissionIdentifier')}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={t('form.permissionIdentifierPlaceholder')}
                disabled={!!editingPermission}
              />
              <p className="text-xs text-muted-foreground">
                {t('form.permissionIdentifierFormat')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="label">
                {t('form.permissionName')}
              </Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, label: e.target.value }))
                }
                placeholder={t('form.permissionNamePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">
                {t('form.permissionType')}
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
                {t('form.description')}
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder={t('form.descriptionPlaceholder')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('buttons.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !formData.name || !formData.label}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('buttons.saving')}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {t('buttons.save')}
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
              {t('confirmDelete.title')}
            </DialogTitle>
            <DialogDescription>
              {t('confirmDelete.description', { permissionName: deletingPermission?.label || '' })}
            </DialogDescription>
          </DialogHeader>
          {(deletingPermission?.usedByRoles || deletingPermission?._count?.roles || 0) > 0 && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              {t('permissionUsedByRoles')}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('buttons.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting || (deletingPermission?.usedByRoles || deletingPermission?._count?.roles || 0) > 0}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('buttons.deleting')}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('buttons.delete')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}