/**
 * 修改时间：2026-05-02 21:19:13 +08:00
 * 修改内容：用 Role/Permission 列表类型替代角色页 any。
 * 修改模型：gpt-5.5
 *
 * ============================================
 * 管理员角色管理页面 (Phase 5 管理后台重构)
 * ============================================
 * 功能说明：
 *   - 角色列表展示（表格）
 *   - 显示关联权限数量
 *   - 创建/编辑角色 Dialog
 *   - 角色权限复选框列表（分组展示 PAGE 和 ACTION）
 *   - 删除角色确认 Dialog
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
import { useTranslations } from "next-intl"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

interface Permission {
  id: string
  name: string
  label: string
  type: "PAGE" | "ACTION"
}

interface Role {
  id: string
  name: string
  label: string
  description: string | null
  permissions: { id: string; name: string; label: string }[]
  adminCount: number
}

interface ListPayload<T> {
  list?: T[]
}

export default function RolesPage() {
  const t = useTranslations('admin.roles')

  const { query: { data: rolesData, isLoading: loading, refetch: refetchRoles } } = useList({
    resource: "roles",
    pagination: { currentPage: 1, pageSize: 100 },
  })

  const { query: { data: permissionsData, refetch: refetchPermissions } } = useList({
    resource: "permissions",
    pagination: { currentPage: 1, pageSize: 100 },
  })

  const roles = useMemo<Role[]>(() => {
    const raw = rolesData?.data as Role[] | ListPayload<Role> | undefined
    return Array.isArray(raw) ? raw : (raw?.list || [])
  }, [rolesData])

  const permissions = useMemo<Permission[]>(() => {
    const raw = permissionsData?.data as ListPayload<Permission> | undefined
    return raw?.list || []
  }, [permissionsData])

  const refetchAll = () => {
    refetchRoles()
    refetchPermissions()
  }

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deletingRole, setDeletingRole] = useState<Role | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    label: "",
    description: "",
    permissionIds: [] as string[],
  })
  const [submitting, setSubmitting] = useState(false)

  const pagePermissions = useMemo(
    () => permissions.filter((p) => p.type === "PAGE"),
    [permissions]
  )
  const actionPermissions = useMemo(
    () => permissions.filter((p) => p.type === "ACTION"),
    [permissions]
  )

  const handleOpenCreate = () => {
    setEditingRole(null)
    setFormData({ name: "", label: "", description: "", permissionIds: [] })
    setDialogOpen(true)
  }

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      label: role.label,
      description: role.description || "",
      permissionIds: role.permissions.map((p) => p.id),
    })
    setDialogOpen(true)
  }

  const handleOpenDelete = (role: Role) => {
    setDeletingRole(role)
    setDeleteDialogOpen(true)
  }

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: checked
        ? [...prev.permissionIds, permissionId]
        : prev.permissionIds.filter((id) => id !== permissionId),
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.label) return

    try {
      setSubmitting(true)
      const url = editingRole
        ? `/api/admin/roles/${editingRole.id}`
        : "/api/admin/roles"
      const method = editingRole ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (data.success) {
        setDialogOpen(false)
        refetchAll()
      } else {
        toast.error(data.error || t('operationFailed'))
      }
    } catch (error: unknown) {
      console.error("提交失败:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingRole) return

    try {
      setSubmitting(true)
      const res = await fetch(`/api/admin/roles/${deletingRole.id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        setDeleteDialogOpen(false)
        refetchAll()
      } else {
        toast.error(data.error || t('deleteFailed'))
      }
    } catch (error: unknown) {
      console.error("删除失败:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const renderPermissionGroup = (
    title: string,
    permList: Permission[]
  ) => (
    <div className="space-y-3">
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className="grid grid-cols-2 gap-2">
        {permList.map((permission) => (
          <label
            key={permission.id}
            className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded-md px-2 py-1.5 transition-colors"
          >
            <Checkbox
              checked={formData.permissionIds.includes(permission.id)}
              onCheckedChange={(checked) =>
                handlePermissionChange(permission.id, checked)
              }
            />
            <span className="text-sm">{permission.label}</span>
          </label>
        ))}
      </div>
    </div>
  )

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
          {t('createRole')}
        </Button>
      </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('roleList')}</CardTitle>
            <CardDescription>
              {t('roleListDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('tableHeaders.roleName')}</TableHead>
                  <TableHead>{t('tableHeaders.identifier')}</TableHead>
                  <TableHead>{t('tableHeaders.description')}</TableHead>
                  <TableHead>{t('tableHeaders.permissions')}</TableHead>
                  <TableHead>{t('tableHeaders.admins')}</TableHead>
                  <TableHead className="text-right">
                    {t('tableHeaders.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {t('noRolesFound')}
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.label}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {role.name}
                        </code>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {role.description || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {role.permissions.length} {t('permissions')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {role.adminCount} {t('admins')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEdit(role)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenDelete(role)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? t('editRole') : t('createRole')}
            </DialogTitle>
            <DialogDescription>
              {editingRole ? t('editRoleDescription') : t('createRoleDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t('form.roleIdentifier')}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder={t('form.roleIdentifierPlaceholder')}
                  disabled={!!editingRole}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">
                  {t('form.roleName')}
                </Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, label: e.target.value }))
                  }
                  placeholder={t('form.roleNamePlaceholder')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {t('form.description')}
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder={t('form.descriptionPlaceholder')}
              />
            </div>

            <div className="space-y-3">
              <Label>{t('form.permissions')}</Label>
              {pagePermissions.length > 0 &&
                renderPermissionGroup(
                  t('form.pagePermissions'),
                  pagePermissions
                )}
              {actionPermissions.length > 0 &&
                renderPermissionGroup(
                  t('form.actionPermissions'),
                  actionPermissions
                )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('buttons.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !formData.name || !formData.label}>
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
              {t('confirmDelete.description', { roleName: deletingRole?.label || '' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('buttons.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
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
